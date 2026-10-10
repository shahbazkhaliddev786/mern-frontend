import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
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
    const view = render(
        <Provider store={store}>
            <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                <MemoryRouter>
                    <ChatLauncher />
                </MemoryRouter>
            </QueryClientProvider>
        </Provider>
    )
    return Object.assign(view, { store })
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

    it('links Stripe Checkout in a new tab, and nothing that only looks like it', async () => {
        const answer = '[Pay securely](https://checkout.stripe.com/c/pay/cs_test_1) or [this](https://checkout.stripe.com.evil.example/x)'
        vi.stubGlobal('fetch', fakeFetch(() => streamingResponse([sse('token', { text: answer }), sse('done', { threadId: 't' })])).fn)
        renderLauncher(alice)
        await openAndSend('check out')
        const pay = await screen.findByRole('link', { name: 'Pay securely' })
        expect(pay).toHaveAttribute('href', 'https://checkout.stripe.com/c/pay/cs_test_1')
        expect(pay).toHaveAttribute('target', '_blank')
        expect(pay).toHaveAttribute('rel', 'noopener noreferrer')
        expect(screen.queryByRole('link', { name: 'this' })).toBeNull()
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

describe('confirmation card (spec 009)', () => {
    const pause = (interruptId = 'int-1') =>
        streamingResponse([
            sse('confirm_required', { interruptId, tool: 'clear_cart', summary: 'Remove all 2 items ($90.00) from your cart?' }),
            sse('done', { threadId: 'thread-c' })
        ])

    it('shows the summary with Confirm and Cancel, and no tool chip', async () => {
        vi.stubGlobal('fetch', fakeFetch(() => pause()).fn)
        renderLauncher(alice)
        await openAndSend('empty my cart')
        const card = await screen.findByRole('group', { name: 'Confirm this action' })
        expect(card).toHaveTextContent('Remove all 2 items ($90.00) from your cart?')
        expect(within(card).getByRole('button', { name: 'Confirm' })).toBeEnabled()
        expect(within(card).getByRole('button', { name: 'Cancel' })).toBeEnabled()
        expect(screen.queryByRole('status')).toBeNull()
    })

    it('Confirm sends the resume, shows Confirmed, and streams the result', async () => {
        const fake = fakeFetch(
            () => pause(),
            () =>
                streamingResponse([
                    sse('tool_start', { tool: 'clear_cart', label: 'Clearing your cart…' }),
                    sse('tool_end', { tool: 'clear_cart', ok: true }),
                    sse('token', { text: 'Your cart is empty now.' }),
                    sse('done', { threadId: 'thread-c' })
                ])
        )
        vi.stubGlobal('fetch', fake.fn)
        renderLauncher(alice)
        const user = await openAndSend('empty my cart')
        const card = await screen.findByRole('group', { name: 'Confirm this action' })
        await user.click(within(card).getByRole('button', { name: 'Confirm' }))

        expect(await screen.findByText('Your cart is empty now.')).toBeInTheDocument()
        expect(card).toHaveTextContent('Confirmed')
        expect(within(card).queryByRole('button')).toBeNull()
        expect(fake.requests[1]!.body).toEqual({ threadId: 'thread-c', resume: { interruptId: 'int-1', approved: true } })
    })

    it('Cancel sends approved: false and shows Cancelled', async () => {
        const fake = fakeFetch(
            () => pause(),
            () => streamingResponse([sse('token', { text: 'Okay, I left your cart as it is.' }), sse('done', { threadId: 'thread-c' })])
        )
        vi.stubGlobal('fetch', fake.fn)
        renderLauncher(alice)
        const user = await openAndSend('empty my cart')
        const card = await screen.findByRole('group', { name: 'Confirm this action' })
        await user.click(within(card).getByRole('button', { name: 'Cancel' }))
        expect(await screen.findByText('Okay, I left your cart as it is.')).toBeInTheDocument()
        expect(card).toHaveTextContent('Cancelled')
        expect(fake.requests[1]!.body).toEqual({ threadId: 'thread-c', resume: { interruptId: 'int-1', approved: false } })
    })

    it('blocks new messages while a confirmation waits, and unblocks after a choice', async () => {
        vi.stubGlobal(
            'fetch',
            fakeFetch(
                () => pause(),
                () => streamingResponse([sse('token', { text: 'Done.' }), sse('done', { threadId: 'thread-c' })])
            ).fn
        )
        renderLauncher(alice)
        const user = await openAndSend('empty my cart')
        const card = await screen.findByRole('group', { name: 'Confirm this action' })
        const box = screen.getByRole('textbox', { name: 'Message the shopping assistant' })
        expect(box).toBeDisabled()
        expect(screen.getByText('Confirm or cancel the action above first.')).toBeInTheDocument()
        await user.click(within(card).getByRole('button', { name: 'Confirm' }))
        await screen.findByText('Done.')
        expect(box).toBeEnabled()
    })

    it('shows "already confirmed" without Try again', async () => {
        vi.stubGlobal(
            'fetch',
            fakeFetch(
                () => pause(),
                () =>
                    streamingResponse([
                        sse('error', { message: 'That was already confirmed.', retryable: false }),
                        sse('done', { threadId: 'thread-c' })
                    ])
            ).fn
        )
        renderLauncher(alice)
        const user = await openAndSend('empty my cart')
        await user.click(within(await screen.findByRole('group', { name: 'Confirm this action' })).getByRole('button', { name: 'Confirm' }))
        expect(await screen.findByText('That was already confirmed.')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    })

    it('reopens the card when the answer never reached the server', async () => {
        vi.stubGlobal(
            'fetch',
            fakeFetch(
                () => pause(),
                () => Promise.reject(new TypeError('Failed to fetch'))
            ).fn
        )
        renderLauncher(alice)
        const user = await openAndSend('empty my cart')
        const card = await screen.findByRole('group', { name: 'Confirm this action' })
        await user.click(within(card).getByRole('button', { name: 'Confirm' }))
        expect(await screen.findByText('The connection dropped. Try again.')).toBeInTheDocument()
        expect(within(card).getByRole('button', { name: 'Confirm' })).toBeEnabled()
        expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    })

    it('reopens the card when the answer is over the limit (spec 014)', async () => {
        const limited = "You've sent a lot of messages in a short time. Please wait about 3 minutes and try again."
        vi.stubGlobal(
            'fetch',
            fakeFetch(
                () => pause(),
                () => jsonResponse(429, { status: 'error', message: limited })
            ).fn
        )
        renderLauncher(alice)
        const user = await openAndSend('empty my cart')
        const card = await screen.findByRole('group', { name: 'Confirm this action' })
        await user.click(within(card).getByRole('button', { name: 'Confirm' }))
        expect(await screen.findByText(limited)).toBeInTheDocument()
        expect(within(card).getByRole('button', { name: 'Confirm' })).toBeEnabled()
    })

    it('keeps a pending card across a reload, and it can still be answered', async () => {
        const fake = fakeFetch(
            () => pause('int-9'),
            () => streamingResponse([sse('token', { text: 'Cleared.' }), sse('done', { threadId: 'thread-c' })])
        )
        vi.stubGlobal('fetch', fake.fn)
        const first = renderLauncher(alice)
        await openAndSend('empty my cart')
        await screen.findByRole('group', { name: 'Confirm this action' })
        first.unmount()

        renderLauncher(alice)
        const user = userEvent.setup()
        await user.click(screen.getByRole('button', { name: 'Open the shopping assistant' }))
        const card = await screen.findByRole('group', { name: 'Confirm this action' })
        await user.click(within(card).getByRole('button', { name: 'Confirm' }))
        expect(await screen.findByText('Cleared.')).toBeInTheDocument()
        expect(fake.requests[1]!.body).toEqual({ threadId: 'thread-c', resume: { interruptId: 'int-9', approved: true } })
    })
})

describe('after the agent changes the name (spec 011)', () => {
    it("updates the signed-in user's name from the profile", async () => {
        const fake = fakeFetch(
            () =>
                streamingResponse([
                    sse('tool_end', { tool: 'update_profile', ok: true }),
                    sse('token', { text: 'Done, you are Jane Doe now.' }),
                    sse('done', { threadId: 't' })
                ]),
            () => jsonResponse(200, { status: 'success', message: 'ok', data: { id: 'alice-id', name: 'Jane Doe', email: 'alice@example.com' } })
        )
        vi.stubGlobal('fetch', fake.fn)
        const { store } = renderLauncher(alice)
        await openAndSend('call me Jane Doe')
        await screen.findByText('Done, you are Jane Doe now.')
        await waitFor(() => expect(store.getState().auth.user?.name).toBe('Jane Doe'))
        expect(fake.requests[1]!.url).toBe('/api/v1/auth/profile')
    })
})

describe('attaching a picture (spec 012)', () => {
    const image = (name = 'me.png', type = 'image/png', bytes = 1000) => new File([new Uint8Array(bytes)], name, { type })
    const uploaded = (name = 'me.png') =>
        jsonResponse(201, { status: 'success', message: 'Image received', data: { uploadId: 'a'.repeat(24), name, size: 1000 } })

    beforeEach(() => {
        vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() }))
    })

    async function openAndAttach(file: File) {
        const user = userEvent.setup({ applyAccept: false })
        await user.click(screen.getByRole('button', { name: 'Open the shopping assistant' }))
        await screen.findByRole('textbox', { name: 'Message the shopping assistant' })
        await user.upload(screen.getByTestId('attach-input'), file)
        return user
    }

    it('uploads the image as FormData with the token, then sends its uploadId with the message', async () => {
        const fake = fakeFetch(
            () => uploaded(),
            () => streamingResponse([sse('token', { text: 'Nice picture.' }), sse('done', { threadId: 't' })])
        )
        vi.stubGlobal('fetch', fake.fn)
        renderLauncher(alice)
        const user = await openAndAttach(image())
        const chip = await screen.findByTestId('attachment-chip')
        await within(chip).findByText('Ready to send')

        const upload = fake.requests[0]!
        expect(upload.url).toBe('/api/v1/agent/uploads/avatar')
        expect(upload.authorization).toBe('Bearer access')
        expect((upload.form?.get('profile') as File).name).toBe('me.png')

        await user.type(screen.getByRole('textbox', { name: 'Message the shopping assistant' }), 'make this my picture{Enter}')
        await screen.findByText('Nice picture.')
        expect(fake.requests[1]!.body).toEqual({ message: 'make this my picture', uploadId: 'a'.repeat(24) })
        expect(screen.queryByTestId('attachment-chip')).toBeNull()
        expect(screen.getByRole('img', { name: 'me.png' })).toHaveAttribute('src', 'blob:preview')
    })

    it('sends a default message when only a picture is attached', async () => {
        const fake = fakeFetch(
            () => uploaded(),
            () => streamingResponse([sse('done', { threadId: 't' })])
        )
        vi.stubGlobal('fetch', fake.fn)
        renderLauncher(alice)
        const user = await openAndAttach(image())
        await screen.findByText('Ready to send')
        await user.click(screen.getByRole('button', { name: 'Send' }))
        await waitFor(() => expect(fake.requests).toHaveLength(2))
        expect(fake.requests[1]!.body).toEqual({ message: "Here's a picture.", uploadId: 'a'.repeat(24) })
    })

    it('refuses a wrong type or an oversize file in the browser, without uploading', async () => {
        const fake = fakeFetch()
        vi.stubGlobal('fetch', fake.fn)
        renderLauncher(alice)
        const user = await openAndAttach(image('notes.pdf', 'application/pdf'))
        expect(await screen.findByText('Only JPEG, PNG, GIF or WEBP images are allowed')).toBeInTheDocument()
        await user.upload(screen.getByTestId('attach-input'), image('big.png', 'image/png', 2 * 1024 * 1024 + 1))
        expect(await screen.findByText('Each image must be 2 MB or smaller')).toBeInTheDocument()
        expect(fake.requests).toHaveLength(0)
        expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled()
    })

    it("shows the server's message when the upload is refused", async () => {
        vi.stubGlobal('fetch', fakeFetch(() => jsonResponse(400, { status: 'error', message: 'Only JPEG, PNG, GIF or WEBP images are allowed' })).fn)
        renderLauncher(alice)
        await openAndAttach(image())
        expect(await screen.findByText('Only JPEG, PNG, GIF or WEBP images are allowed')).toBeInTheDocument()
    })

    it('removes the chip, and the next message goes without an uploadId', async () => {
        const fake = fakeFetch(
            () => uploaded(),
            () => streamingResponse([sse('done', { threadId: 't' })])
        )
        vi.stubGlobal('fetch', fake.fn)
        renderLauncher(alice)
        const user = await openAndAttach(image())
        await screen.findByText('Ready to send')
        await user.click(screen.getByRole('button', { name: 'Remove attachment' }))
        expect(screen.queryByTestId('attachment-chip')).toBeNull()
        await user.type(screen.getByRole('textbox', { name: 'Message the shopping assistant' }), 'hello{Enter}')
        await waitFor(() => expect(fake.requests).toHaveLength(2))
        expect(fake.requests[1]!.body).toEqual({ message: 'hello' })
    })

    it('shows only the file name after a reload', async () => {
        const fake = fakeFetch(
            () => uploaded(),
            () => streamingResponse([sse('done', { threadId: 't' })])
        )
        vi.stubGlobal('fetch', fake.fn)
        const first = renderLauncher(alice)
        const user = await openAndAttach(image())
        await screen.findByText('Ready to send')
        await user.click(screen.getByRole('button', { name: 'Send' }))
        await waitFor(() => expect(fake.requests).toHaveLength(2))
        await waitFor(() => expect(localStorage.getItem('aljo.agentChat.alice-id')).toContain('me.png'))
        expect(localStorage.getItem('aljo.agentChat.alice-id')).not.toContain('blob:')
        first.unmount()

        renderLauncher(alice)
        await userEvent.setup().click(screen.getByRole('button', { name: 'Open the shopping assistant' }))
        expect(await screen.findByText('me.png')).toBeInTheDocument()
        expect(screen.queryByRole('img', { name: 'me.png' })).toBeNull()
    })

    it("updates the signed-in user's picture after upload_avatar", async () => {
        const fake = fakeFetch(
            () =>
                streamingResponse([
                    sse('tool_end', { tool: 'upload_avatar', ok: true }),
                    sse('token', { text: 'Your new picture is set.' }),
                    sse('done', { threadId: 't' })
                ]),
            () =>
                jsonResponse(200, {
                    status: 'success',
                    message: 'ok',
                    data: { id: 'alice-id', name: 'Alice', email: 'alice@example.com', profile: 'https://res.cloudinary.com/x/new.png' }
                })
        )
        vi.stubGlobal('fetch', fake.fn)
        const { store } = renderLauncher(alice)
        await openAndSend('yes')
        await screen.findByText('Your new picture is set.')
        await waitFor(() => expect(store.getState().auth.user?.profile).toBe('https://res.cloudinary.com/x/new.png'))
    })
})

describe('per-user limits (backend spec 014)', () => {
    const limited = "You've sent a lot of messages in a short time. Please wait about 4 minutes and try again."

    it("shows the server's message without Try again", async () => {
        vi.stubGlobal('fetch', fakeFetch(() => jsonResponse(429, { status: 'error', message: limited })).fn)
        renderLauncher(alice)
        await openAndSend('hello')
        expect(await screen.findByText(limited)).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    })

    it('shows an upload refusal in the attachment chip', async () => {
        vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() }))
        const message = "You've made a lot of changes in a short time. Please wait about 1 hour and try again."
        vi.stubGlobal('fetch', fakeFetch(() => jsonResponse(429, { status: 'error', message })).fn)
        renderLauncher(alice)
        const user = userEvent.setup({ applyAccept: false })
        await user.click(screen.getByRole('button', { name: 'Open the shopping assistant' }))
        await screen.findByRole('textbox', { name: 'Message the shopping assistant' })
        await user.upload(screen.getByTestId('attach-input'), new File([new Uint8Array(10)], 'me.png', { type: 'image/png' }))
        expect(await within(await screen.findByTestId('attachment-chip')).findByText(message)).toBeInTheDocument()
    })
})

describe('card numbers and passwords stay in the browser (backend spec 016)', () => {
    const hint = "For your security, don't share card numbers or passwords here. Payment happens only on Stripe's checkout page."

    it('refuses a card number or a password before sending, and keeps the text', async () => {
        const fake = fakeFetch()
        vi.stubGlobal('fetch', fake.fn)
        renderLauncher(alice)
        const user = userEvent.setup()
        await user.click(screen.getByRole('button', { name: 'Open the shopping assistant' }))
        const box = await screen.findByRole('textbox', { name: 'Message the shopping assistant' })
        for (const text of ['my card is 4242 4242 4242 4242', 'my password is Summer2024!']) {
            await user.type(box, `${text}{Enter}`)
            expect(await screen.findByRole('alert')).toHaveTextContent(hint)
            expect(box).toHaveValue(text)
            await user.clear(box)
            expect(screen.queryByRole('alert')).toBeNull()
        }
        expect(fake.requests).toHaveLength(0)
    })

    it('sends ordinary messages with numbers', async () => {
        const fake = fakeFetch(() => streamingResponse([sse('done', { threadId: 't' })]))
        vi.stubGlobal('fetch', fake.fn)
        renderLauncher(alice)
        await openAndSend('2 of the blue ones under $50, about order #1A2B3C4D')
        await waitFor(() => expect(fake.requests).toHaveLength(1))
        expect(screen.queryByRole('alert')).toBeNull()
    })
})
