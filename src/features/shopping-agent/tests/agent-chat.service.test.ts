import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ChatFailure, sendFeedback, streamChat, uploadAvatar } from '../services/agent-chat.service'
import { fakeFetch, jsonResponse, sse, streamingResponse } from './fake-stream'

const collect = async (gen: AsyncGenerator<unknown>) => {
    const out: unknown[] = []
    for await (const event of gen) out.push(event)
    return out
}
const failureOf = async (gen: AsyncGenerator<unknown>) => {
    try {
        await collect(gen)
    } catch (error) {
        return error as ChatFailure
    }
    throw new Error('expected a failure')
}

beforeEach(() => {
    localStorage.setItem('accessToken', 'old-access')
    localStorage.setItem('refreshToken', 'old-refresh')
})
afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
})

describe('streamChat', () => {
    it('posts the message with the Bearer token and yields events as they stream', async () => {
        const fake = fakeFetch(() =>
            streamingResponse([sse('token', { text: 'Hel' }), sse('token', { text: 'lo' }) + sse('done', { threadId: 't1' })])
        )
        vi.stubGlobal('fetch', fake.fn)
        const events = await collect(streamChat({ message: 'hi', threadId: 't0' }))
        expect(fake.requests[0]).toEqual({ url: '/api/v1/agent/chat', body: { message: 'hi', threadId: 't0' }, authorization: 'Bearer old-access' })
        expect(events).toEqual([
            { event: 'token', data: { text: 'Hel' } },
            { event: 'token', data: { text: 'lo' } },
            { event: 'done', data: { threadId: 't1' } }
        ])
    })

    it('refreshes once on 401, stores the new tokens and retries', async () => {
        const onTokensRefreshed = vi.fn()
        const fake = fakeFetch(
            () => jsonResponse(401, { message: 'expired' }),
            () => jsonResponse(200, { data: { accessToken: 'new-access', refreshToken: 'new-refresh' } }),
            () => streamingResponse([sse('done', { threadId: 't1' })])
        )
        vi.stubGlobal('fetch', fake.fn)
        await collect(streamChat({ message: 'hi', onTokensRefreshed }))
        expect(fake.requests.map((r) => r.url)).toEqual(['/api/v1/agent/chat', '/api/v1/auth/refresh-token', '/api/v1/agent/chat'])
        expect(fake.requests[1]!.body).toEqual({ refreshToken: 'old-refresh' })
        expect(fake.requests[2]!.authorization).toBe('Bearer new-access')
        expect(localStorage.getItem('accessToken')).toBe('new-access')
        expect(onTokensRefreshed).toHaveBeenCalledWith({ accessToken: 'new-access', refreshToken: 'new-refresh' })
    })

    it('asks to sign in again when the refresh fails', async () => {
        vi.stubGlobal(
            'fetch',
            fakeFetch(
                () => jsonResponse(401, {}),
                () => jsonResponse(401, { message: 'invalid' })
            ).fn
        )
        expect((await failureOf(streamChat({ message: 'hi' }))).kind).toBe('signin')
    })

    it('maps 503 and 400 to their own failures', async () => {
        vi.stubGlobal('fetch', fakeFetch(() => jsonResponse(503, { message: 'off' })).fn)
        expect((await failureOf(streamChat({ message: 'hi' }))).kind).toBe('unavailable')

        vi.stubGlobal('fetch', fakeFetch(() => jsonResponse(400, { errors: [{ message: 'Too long' }] })).fn)
        const invalid = await failureOf(streamChat({ message: 'hi' }))
        expect(invalid.kind).toBe('invalid')
        expect(invalid.message).toBe('Too long')
    })

    it('treats a stream that ends without done, or a network error, as a dropped connection', async () => {
        vi.stubGlobal('fetch', fakeFetch(() => streamingResponse([sse('token', { text: 'Hi' })])).fn)
        expect((await failureOf(streamChat({ message: 'hi' }))).kind).toBe('network')

        vi.stubGlobal('fetch', () => Promise.reject(new TypeError('Failed to fetch')))
        expect((await failureOf(streamChat({ message: 'hi' }))).kind).toBe('network')
    })
})

describe('streamChat resume (spec 009)', () => {
    it('posts the confirmation answer with the threadId', async () => {
        localStorage.setItem('accessToken', 'access')
        const fake = fakeFetch(() => streamingResponse([sse('done', { threadId: 't1' })]))
        vi.stubGlobal('fetch', fake.fn)
        await collect(streamChat({ resume: { interruptId: 'int-1', approved: false }, threadId: 't1' }))
        expect(fake.requests[0]!.body).toEqual({ threadId: 't1', resume: { interruptId: 'int-1', approved: false } })
    })
})

describe('uploadAvatar (spec 012)', () => {
    const file = new File([new Uint8Array(10)], 'me.png', { type: 'image/png' })

    it('refreshes once on 401 and retries the upload with the new token', async () => {
        const fake = fakeFetch(
            () => jsonResponse(401, { message: 'expired' }),
            () => jsonResponse(200, { data: { accessToken: 'new-access', refreshToken: 'new-refresh' } }),
            () => jsonResponse(201, { data: { uploadId: 'b'.repeat(24), name: 'me.png', size: 10 } })
        )
        vi.stubGlobal('fetch', fake.fn)
        await expect(uploadAvatar(file)).resolves.toEqual({ uploadId: 'b'.repeat(24), name: 'me.png', size: 10 })
        expect(fake.requests.map((r) => r.url)).toEqual([
            '/api/v1/agent/uploads/avatar',
            '/api/v1/auth/refresh-token',
            '/api/v1/agent/uploads/avatar'
        ])
        expect(fake.requests[2]!.authorization).toBe('Bearer new-access')
        expect(fake.requests[2]!.form?.get('profile')).toBeInstanceOf(File)
    })

    it('maps 503 to unavailable', async () => {
        vi.stubGlobal('fetch', fakeFetch(() => jsonResponse(503, {})).fn)
        await expect(uploadAvatar(file)).rejects.toMatchObject({ kind: 'unavailable' })
    })
})

describe('one login refresh at a time (backend spec 022)', () => {
    it('two requests that hit 401 together share one refresh, and both go through', async () => {
        // The backend rotates refresh tokens: a second refresh with the same old token is refused.
        let refreshes = 0
        vi.stubGlobal('fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
            const url = String(input)
            if (url.endsWith('/refresh-token')) {
                refreshes += 1
                await new Promise((resolve) => setTimeout(resolve, 10))
                return refreshes === 1
                    ? jsonResponse(200, { data: { accessToken: 'new-access', refreshToken: 'new-refresh' } })
                    : jsonResponse(401, { message: 'Invalid refresh token' })
            }
            if (new Headers(init?.headers).get('Authorization') !== 'Bearer new-access') return jsonResponse(401, { message: 'expired' })
            return url.endsWith('/feedback') ? jsonResponse(200, { status: 'success' }) : streamingResponse([sse('done', { threadId: 't1' })])
        })
        const [events] = await Promise.all([collect(streamChat({ message: 'hi' })), sendFeedback({ threadId: 't1', replyId: 'r1', rating: 'up' })])
        expect(events).toEqual([{ event: 'done', data: { threadId: 't1' } }])
        expect(refreshes).toBe(1)
    })
})
