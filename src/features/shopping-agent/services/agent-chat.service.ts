// Streams one chat turn from POST /api/v1/agent/chat (backend spec 006). Reads the body with
// fetch + ReadableStream rather than EventSource, which can't POST or send a Bearer header.

import type { AgentEvent } from '../types'
import { createSseParser } from './sse'

const CHAT_URL = '/api/v1/agent/chat'
const REFRESH_URL = '/api/v1/auth/refresh-token'

export type ChatFailureKind = 'unavailable' | 'signin' | 'invalid' | 'network' | 'aborted'

export class ChatFailure extends Error {
    readonly kind: ChatFailureKind

    constructor(kind: ChatFailureKind, message: string) {
        super(message)
        this.name = 'ChatFailure'
        this.kind = kind
    }
}

export const FAILURE_MESSAGES = {
    unavailable: "The shopping assistant isn't available right now.",
    signin: 'Please sign in again to keep chatting.',
    network: 'The connection dropped. Try again.'
} as const

export interface StreamChatOptions {
    message: string
    threadId?: string | null
    signal?: AbortSignal
    /** Called with a new token pair after a successful refresh, to keep the app's auth state in step. */
    onTokensRefreshed?: (tokens: { accessToken: string; refreshToken: string }) => void
}

const storedToken = (key: 'accessToken' | 'refreshToken') => (typeof window === 'undefined' ? null : localStorage.getItem(key))

async function refreshTokens(onTokensRefreshed: StreamChatOptions['onTokensRefreshed']): Promise<string | null> {
    const refreshToken = storedToken('refreshToken')
    if (!refreshToken) return null
    try {
        const response = await fetch(REFRESH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
        })
        if (!response.ok) return null
        const body = (await response.json()) as { data?: { accessToken?: string; refreshToken?: string } }
        const tokens = body.data
        if (!tokens?.accessToken || !tokens.refreshToken) return null
        localStorage.setItem('accessToken', tokens.accessToken)
        localStorage.setItem('refreshToken', tokens.refreshToken)
        onTokensRefreshed?.({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken })
        return tokens.accessToken
    } catch {
        return null
    }
}

const isAbort = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'

async function readMessage(response: Response): Promise<string | undefined> {
    try {
        const body = (await response.json()) as { message?: string; errors?: { message?: string }[] }
        return body.errors?.[0]?.message ?? body.message
    } catch {
        return undefined
    }
}

export async function* streamChat({ message, threadId, signal, onTokensRefreshed }: StreamChatOptions): AsyncGenerator<AgentEvent> {
    const send = (token: string | null) =>
        fetch(CHAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(threadId ? { message, threadId } : { message }),
            ...(signal ? { signal } : {})
        })

    let response: Response
    try {
        response = await send(storedToken('accessToken'))
        if (response.status === 401) {
            const fresh = await refreshTokens(onTokensRefreshed)
            if (!fresh) throw new ChatFailure('signin', FAILURE_MESSAGES.signin)
            response = await send(fresh)
            if (response.status === 401) throw new ChatFailure('signin', FAILURE_MESSAGES.signin)
        }
    } catch (error) {
        if (error instanceof ChatFailure) throw error
        if (isAbort(error)) throw new ChatFailure('aborted', 'Stopped')
        throw new ChatFailure('network', FAILURE_MESSAGES.network)
    }

    if (response.status === 503) throw new ChatFailure('unavailable', FAILURE_MESSAGES.unavailable)
    if (response.status === 400) throw new ChatFailure('invalid', (await readMessage(response)) ?? 'That message could not be sent.')
    if (!response.ok || !response.body) throw new ChatFailure('network', FAILURE_MESSAGES.network)

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader()
    const parser = createSseParser()
    let sawDone = false
    try {
        for (;;) {
            const { value, done } = await reader.read()
            if (done) break
            for (const parsed of parser.push(value)) {
                const event = parsed as AgentEvent
                if (event.event === 'done') sawDone = true
                yield event
            }
        }
    } catch (error) {
        if (isAbort(error) || signal?.aborted) throw new ChatFailure('aborted', 'Stopped')
        throw new ChatFailure('network', FAILURE_MESSAGES.network)
    }
    if (!sawDone) throw new ChatFailure('network', FAILURE_MESSAGES.network)
}
