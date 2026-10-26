// Streams one chat turn from POST /api/v1/agent/chat (backend spec 006). Reads the body with
// fetch + ReadableStream rather than EventSource, which can't POST or send a Bearer header.

import type { AgentEvent, FeedbackReason } from '../types'
import { createSseParser } from './sse'

const CHAT_URL = '/api/v1/agent/chat'
const AVATAR_UPLOAD_URL = '/api/v1/agent/uploads/avatar'
const FEEDBACK_URL = '/api/v1/agent/feedback'
const REFRESH_URL = '/api/v1/auth/refresh-token'

export type ChatFailureKind = 'unavailable' | 'signin' | 'invalid' | 'limited' | 'network' | 'aborted'

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
    network: 'The connection dropped. Try again.',
    limited: "You've sent a lot of messages in a short time. Please wait a few minutes and try again."
} as const

export interface StreamChatOptions {
    /** A new message; or `resume` to answer a pending confirmation (spec 009). */
    message?: string
    /** An attached image from `uploadAvatar` (spec 012); sent with a new message only. */
    uploadId?: string
    resume?: { interruptId: string; approved: boolean }
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

function chatBody({ message, uploadId, resume, threadId }: StreamChatOptions) {
    if (resume) return { threadId, resume }
    return { message, ...(threadId ? { threadId } : {}), ...(uploadId ? { uploadId } : {}) }
}

export async function* streamChat(options: StreamChatOptions): AsyncGenerator<AgentEvent> {
    const { signal, onTokensRefreshed } = options
    const send = (token: string | null) =>
        fetch(CHAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'text/event-stream',
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify(chatBody(options)),
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
    // Per-user limits (backend spec 014): the server says how long to wait.
    if (response.status === 429) throw new ChatFailure('limited', (await readMessage(response)) ?? FAILURE_MESSAGES.limited)
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

export interface UploadedImage {
    uploadId: string
    name: string
    size: number
}

/**
 * Hands an image to the server for the agent's `upload_avatar` tool (spec 012). The server keeps it
 * for an hour; the model only ever sees the returned id, never the image.
 */
export async function uploadAvatar(
    file: File,
    { signal, onTokensRefreshed }: Pick<StreamChatOptions, 'signal' | 'onTokensRefreshed'> = {}
): Promise<UploadedImage> {
    const send = (token: string | null) => {
        const form = new FormData()
        form.append('profile', file)
        return fetch(AVATAR_UPLOAD_URL, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form,
            ...(signal ? { signal } : {})
        })
    }

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
    if (response.status === 400) throw new ChatFailure('invalid', (await readMessage(response)) ?? "That picture couldn't be attached.")
    if (response.status === 429) throw new ChatFailure('limited', (await readMessage(response)) ?? FAILURE_MESSAGES.limited)
    if (!response.ok) throw new ChatFailure('network', FAILURE_MESSAGES.network)
    try {
        const body = (await response.json()) as { data?: Partial<UploadedImage> }
        const data = body.data
        if (!data?.uploadId || !data.name || typeof data.size !== 'number') throw new Error('bad body')
        return { uploadId: data.uploadId, name: data.name, size: data.size }
    } catch {
        throw new ChatFailure('network', FAILURE_MESSAGES.network)
    }
}

export interface FeedbackBody {
    threadId: string
    replyId: string
    rating: 'up' | 'down'
    reason?: FeedbackReason
    comment?: string
}

/** A thumbs up or down on one reply (backend spec 021). A new vote on the same reply replaces the old one. */
export async function sendFeedback(body: FeedbackBody, { onTokensRefreshed }: Pick<StreamChatOptions, 'onTokensRefreshed'> = {}): Promise<void> {
    const send = (token: string | null) =>
        fetch(FEEDBACK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            body: JSON.stringify(body)
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
        throw new ChatFailure('network', FAILURE_MESSAGES.network)
    }
    if (response.status === 400) throw new ChatFailure('invalid', (await readMessage(response)) ?? "That feedback couldn't be sent.")
    if (response.status === 429) throw new ChatFailure('limited', (await readMessage(response)) ?? FAILURE_MESSAGES.limited)
    if (!response.ok) throw new ChatFailure('network', FAILURE_MESSAGES.network)
}
