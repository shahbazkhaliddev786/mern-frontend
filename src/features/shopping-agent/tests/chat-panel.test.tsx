import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import authReducer from '@/features/authentication/slices/auth-slice'
import ChatLauncher from '../components/ChatLauncher'
import { fakeFetch, jsonResponse, sse, streamingResponse } from './fake-stream'

type AuthUser = { id: string; name: string; email: string }

function renderLauncher(user: AuthUser | null) {
    const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
            auth: {
                user,
                accessToken: user ? 'access' : null,
                refreshToken: user ? 'refresh' : null,
                isAuthenticated: Boolean(user),
                isLoading: false,
                error: null
            }
        }
    })
    return render(
        <Provider store={store}>
            <MemoryRouter>
                <ChatLauncher />
            </MemoryRouter>
        </Provider>
    )
}

const alice: AuthUser = { id: 'alice-id', name: 'Alice', email: 'alice@example.com' }
const bob: AuthUser = { id: 'bob-id', name: 'Bob', email: 'bob@example.com' }

async function openAndSend(text: string) {
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: 'Open the shopping assistant' }))
    const box = await screen.findByRole('textbox', { name: 'Message the shopping assistant' })
    await user.type(box, `${text}{Enter}`)
    return user
}

const lastAssistant = () => screen.getAllByTestId('assistant-message').at(-1)!

beforeEach(() => {
    vi.stubEnv('VITE_AGENT_ENABLED', 'true')
    localStorage.clear()
    localStorage.setItem('accessToken', 'access')
    localStorage.setItem('refreshToken', 'refresh')
})
afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
    localStorage.clear()
})

describe('ChatLauncher visibility', () => {
    it('renders nothing unless VITE_AGENT_ENABLED is true', () => {
        vi.stubEnv('VITE_AGENT_ENABLED', 'false')
        renderLauncher(alice)
        expect(screen.queryByRole('button', { name: 'Open the shopping assistant' })).toBeNull()
    })

    it('shows guests a sign-in prompt instead of the chat', async () => {
        renderLauncher(null)
        await userEvent.setup().click(screen.getByRole('button', { name: 'Open the shopping assistant' }))
        expect(await screen.findByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
        expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute('href', '/signup')
        expect(screen.queryByRole('textbox')).toBeNull()
    })
})

describe('a chat turn', () => {
    it('shows the question, the tool chip while a tool runs, then the streamed answer', async () => {
        let release: () => void = () => {}
        const fake = fakeFetch(() => {
            const encoder = new TextEncoder()
            return new Response(
                new ReadableStream<Uint8Array>({
                    start(controller) {
                        controller.enqueue(encoder.encode(sse('tool_start', { tool: 'search_products', label: 'Searching products…' })))
                        release = () => {
                            controller.enqueue(encoder.encode(sse('tool_end', { tool: 'search_products', ok: true })))
                            controller.enqueue(encoder.encode(sse('token', { text: 'Try the ' })))
                            controller.enqueue(encoder.encode(sse('token', { text: '[Trail Runner](/products/abc).' })))
                            controller.enqueue(encoder.encode(sse('done', { threadId: 'thread-1' })))
                            controller.close()
                        }
                    }
                }),
                { status: 200, headers: { 'Content-Type': 'text/event-stream' } }
            )
        })
        vi.stubGlobal('fetch', fake.fn)
        renderLauncher(alice)
        await openAndSend('shoes under $50?')

        expect(screen.getByText('shoes under $50?')).toBeInTheDocument()
        expect(await screen.findByRole('status')).toHaveTextContent('Searching products…')
        release()
        expect(await screen.findByRole('link', { name: 'Trail Runner' })).toHaveAttribute('href', '/products/abc')
        expect(lastAssistant()).toHaveTextContent('Try the Trail Runner.')
        expect(screen.queryByRole('status')).toBeNull()
        expect(fake.requests[0]!.body).toEqual({ message: 'shoes under $50?' })
    })

    it('sends the stored threadId next time, and none after New chat', async () => {
        const fake = fakeFetch(
            () => streamingResponse([sse('token', { text: 'One' }), sse('done', { threadId: 'thread-1' })]),
            () => streamingResponse([sse('token', { text: 'Two' }), sse('done', { threadId: 'thread-1' })]),
            () => streamingResponse([sse('token', { text: 'Three' }), sse('done', { threadId: 'thread-2' })])
        )
        vi.stubGlobal('fetch', fake.fn)
        renderLauncher(alice)
        const user = await openAndSend('first')
        await screen.findByText('One')
        await user.type(screen.getByRole('textbox', { name: 'Message the shopping assistant' }), 'second{Enter}')
        await screen.findByText('Two')
        await user.click(screen.getByRole('button', { name: 'New chat' }))
        expect(screen.queryByText('One')).toBeNull()
        await user.type(screen.getByRole('textbox', { name: 'Message the shopping assistant' }), 'third{Enter}')
        await screen.findByText('Three')

        expect(fake.requests.map((r) => r.body)).toEqual([{ message: 'first' }, { message: 'second', threadId: 'thread-1' }, { message: 'third' }])
    })

    it('Stop aborts the request and keeps the partial answer', async () => {
        vi.stubGlobal(
            'fetch',
            fakeFetch((init) => streamingResponse([sse('token', { text: 'Partial answer' })], { hang: true, signal: init?.signal ?? null })).fn
        )
        renderLauncher(alice)
        const user = await openAndSend('hello')
        await screen.findByText('Partial answer')
        await user.click(screen.getByRole('button', { name: 'Stop' }))
        expect(await screen.findByText('Stopped.')).toBeInTheDocument()
        expect(screen.getByText('Partial answer')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
    })
})

describe('failures', () => {
    it('503: says the assistant is unavailable, with no retry', async () => {
        vi.stubGlobal('fetch', fakeFetch(() => jsonResponse(503, { status: 'error', message: 'off' })).fn)
        renderLauncher(alice)
        await openAndSend('hi')
        expect(await screen.findByText("The shopping assistant isn't available right now.")).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    })

    it('a retryable error event offers Try again, which resends the same question', async () => {
        const fake = fakeFetch(
            () => streamingResponse([sse('error', { message: 'The assistant is busy right now.', retryable: true }), sse('done', { threadId: 't' })]),
            () => streamingResponse([sse('token', { text: 'Here you go.' }), sse('done', { threadId: 't' })])
        )
        vi.stubGlobal('fetch', fake.fn)
        renderLauncher(alice)
        const user = await openAndSend('my orders?')
        expect(await screen.findByText('The assistant is busy right now.')).toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Try again' }))
        expect(await screen.findByText('Here you go.')).toBeInTheDocument()
        expect(screen.getAllByText('my orders?')).toHaveLength(1)
        expect(fake.requests.map((r) => r.body?.message)).toEqual(['my orders?', 'my orders?'])
    })

    it('a non-retryable error event shows its message without Try again', async () => {
        vi.stubGlobal(
            'fetch',
            fakeFetch(() => streamingResponse([sse('error', { message: 'Something went wrong.', retryable: false }), sse('done', { threadId: 't' })]))
                .fn
        )
        renderLauncher(alice)
        await openAndSend('hi')
        expect(await screen.findByText('Something went wrong.')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    })

    it('a dropped stream says so and offers Try again', async () => {
        vi.stubGlobal('fetch', fakeFetch(() => streamingResponse([sse('token', { text: 'Half' })])).fn)
        renderLauncher(alice)
        await openAndSend('hi')
        expect(await screen.findByText('The connection dropped. Try again.')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
    })

    it('401 that cannot be refreshed asks the customer to sign in again', async () => {
        vi.stubGlobal(
            'fetch',
            fakeFetch(
                () => jsonResponse(401, {}),
                () => jsonResponse(401, {})
            ).fn
        )
        renderLauncher(alice)
        await openAndSend('hi')
        expect(await screen.findByText('Please sign in again to keep chatting.')).toBeInTheDocument()
        expect(within(lastAssistant()).getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login')
    })

    it("400 shows the server's validation message", async () => {
        vi.stubGlobal('fetch', fakeFetch(() => jsonResponse(400, { errors: [{ message: 'Message is too long' }] })).fn)
        renderLauncher(alice)
        await openAndSend('hi')
        expect(await screen.findByText('Message is too long')).toBeInTheDocument()
    })
})

describe('rendering safety', () => {
    it('renders no HTML from the answer, links only store paths, and drops images', async () => {
        const answer =
            'See <script>window.hacked = true</script> <b>bold</b> [Trail](/products/abc) [Win a prize](https://evil.example) ![x](https://evil.example/x.png)'
        vi.stubGlobal('fetch', fakeFetch(() => streamingResponse([sse('token', { text: answer }), sse('done', { threadId: 't' })])).fn)
        renderLauncher(alice)
        await openAndSend('hi')
        const message = await waitFor(() => {
            const m = lastAssistant()
            expect(m).toHaveTextContent('Trail')
            return m
        })
        expect(message.querySelector('script, b, img')).toBeNull()
        expect((window as unknown as { hacked?: boolean }).hacked).toBeUndefined()
        expect(within(message).getByRole('link', { name: 'Trail' })).toHaveAttribute('href', '/products/abc')
        expect(within(message).queryByRole('link', { name: 'Win a prize' })).toBeNull()
        expect(message).toHaveTextContent('Win a prize')
    })
})

describe('the visible conversation across reloads', () => {
    it('comes back for the same user and stays private from another user', async () => {
        vi.stubGlobal('fetch', fakeFetch(() => streamingResponse([sse('token', { text: 'Saved answer' }), sse('done', { threadId: 'thread-9' })])).fn)
        const first = renderLauncher(alice)
        await openAndSend('remember me')
        await screen.findByText('Saved answer')
        first.unmount()

        const again = renderLauncher(alice)
        await userEvent.setup().click(screen.getByRole('button', { name: 'Open the shopping assistant' }))
        expect(await screen.findByText('Saved answer')).toBeInTheDocument()
        again.unmount()

        renderLauncher(bob)
        await userEvent.setup().click(screen.getByRole('button', { name: 'Open the shopping assistant' }))
        await screen.findByRole('textbox', { name: 'Message the shopping assistant' })
        expect(screen.queryByText('Saved answer')).toBeNull()
    })
})
