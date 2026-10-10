import { useCallback, useEffect, useReducer, useRef } from 'react'
import { setTokens } from '@/features/authentication/slices/auth-slice'
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks'
import { ChatFailure, FAILURE_MESSAGES, streamChat } from '../services/agent-chat.service'
import type { ChatMessage } from '../types'

// The visible conversation survives a reload (spec 007). The server keeps the real memory;
// this is display only, saved per user so another account on the same browser starts fresh.
export const MAX_SAVED_MESSAGES = 50
const storageKey = (userKey: string) => `aljo.agentChat.${userKey}`

interface SavedChat {
    threadId: string | null
    messages: ChatMessage[]
}

interface ChatState extends SavedChat {
    streaming: boolean
    tool: { tool: string; label: string } | null
}

type Action =
    | { type: 'load'; saved: SavedChat }
    | { type: 'send'; user: ChatMessage; assistant: ChatMessage }
    | { type: 'token'; text: string }
    | { type: 'tool'; tool: ChatState['tool'] }
    | { type: 'done'; threadId: string }
    | { type: 'fail'; error: NonNullable<ChatMessage['error']> }
    | { type: 'stopped' }
    | { type: 'removeTurn'; assistantId: string }
    | { type: 'reset' }

const empty: ChatState = { threadId: null, messages: [], streaming: false, tool: null }

const updateLast = (messages: ChatMessage[], change: (message: ChatMessage) => ChatMessage) =>
    messages.map((message, index) => (index === messages.length - 1 ? change(message) : message))

function reducer(state: ChatState, action: Action): ChatState {
    switch (action.type) {
        case 'load':
            return { ...empty, ...action.saved }
        case 'send':
            return { ...state, streaming: true, tool: null, messages: [...state.messages, action.user, action.assistant] }
        case 'token':
            return { ...state, tool: null, messages: updateLast(state.messages, (m) => ({ ...m, text: m.text + action.text })) }
        case 'tool':
            return { ...state, tool: action.tool }
        case 'done':
            return {
                ...state,
                streaming: false,
                tool: null,
                threadId: action.threadId,
                messages: updateLast(state.messages, (m) => (m.status === 'streaming' ? { ...m, status: 'done' } : m))
            }
        case 'fail':
            return {
                ...state,
                streaming: false,
                tool: null,
                messages: updateLast(state.messages, (m) => ({ ...m, status: 'error', error: action.error }))
            }
        case 'stopped':
            return { ...state, streaming: false, tool: null, messages: updateLast(state.messages, (m) => ({ ...m, status: 'stopped' })) }
        case 'removeTurn': {
            // Drops a failed answer and the question before it, so "Try again" resends cleanly.
            const index = state.messages.findIndex((m) => m.id === action.assistantId)
            return index < 1 ? state : { ...state, messages: state.messages.filter((_, i) => i !== index && i !== index - 1) }
        }
        case 'reset':
            return { ...empty }
    }
}

/** The signed-in user's id, from the auth state or, after a reload, the access token's payload. */
function decodeUserId(accessToken: string | null): string | null {
    try {
        const payload = accessToken?.split('.')[1]
        if (!payload) return null
        const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { userId?: string }
        return json.userId ?? null
    } catch {
        return null
    }
}

function loadSaved(userKey: string | null): SavedChat {
    if (!userKey) return { threadId: null, messages: [] }
    try {
        const raw = localStorage.getItem(storageKey(userKey))
        if (!raw) return { threadId: null, messages: [] }
        const saved = JSON.parse(raw) as SavedChat
        return { threadId: saved.threadId ?? null, messages: Array.isArray(saved.messages) ? saved.messages : [] }
    } catch {
        return { threadId: null, messages: [] }
    }
}

let idCounter = 0
const newId = () => `m${Date.now().toString(36)}${(idCounter += 1).toString(36)}`

export function useAgentChat() {
    const dispatchApp = useAppDispatch()
    const { user, accessToken } = useAppSelector((s) => s.auth)
    const userKey = user?.id ?? decodeUserId(accessToken)

    const [state, dispatch] = useReducer(reducer, userKey, (key) => ({ ...empty, ...loadSaved(key) }))
    const abortRef = useRef<AbortController | null>(null)

    // A different user on this browser sees their own saved chat, never the previous one.
    const loadedFor = useRef(userKey)
    useEffect(() => {
        if (loadedFor.current === userKey) return
        loadedFor.current = userKey
        abortRef.current?.abort()
        dispatch({ type: 'load', saved: loadSaved(userKey) })
    }, [userKey])

    // Save finished turns only; an answer still streaming is saved once it ends.
    useEffect(() => {
        if (!userKey || state.streaming) return
        try {
            const saved: SavedChat = { threadId: state.threadId, messages: state.messages.slice(-MAX_SAVED_MESSAGES) }
            localStorage.setItem(storageKey(userKey), JSON.stringify(saved))
        } catch {
            // Storage full or blocked: the chat still works, it just won't survive a reload.
        }
    }, [userKey, state.threadId, state.messages, state.streaming])

    useEffect(() => () => abortRef.current?.abort(), [])

    const send = useCallback(
        async (text: string) => {
            const message = text.trim()
            if (!message || state.streaming) return
            const abort = new AbortController()
            abortRef.current = abort
            dispatch({
                type: 'send',
                user: { id: newId(), role: 'user', text: message, status: 'done' },
                assistant: { id: newId(), role: 'assistant', text: '', status: 'streaming' }
            })
            try {
                for await (const event of streamChat({
                    message,
                    threadId: state.threadId,
                    signal: abort.signal,
                    onTokensRefreshed: (tokens) => dispatchApp(setTokens(tokens))
                })) {
                    if (event.event === 'token') dispatch({ type: 'token', text: event.data.text })
                    else if (event.event === 'tool_start') dispatch({ type: 'tool', tool: event.data })
                    else if (event.event === 'tool_end') dispatch({ type: 'tool', tool: null })
                    else if (event.event === 'error') dispatch({ type: 'fail', error: event.data })
                    else if (event.event === 'done') dispatch({ type: 'done', threadId: event.data.threadId })
                }
            } catch (error) {
                if (error instanceof ChatFailure && error.kind === 'aborted') return dispatch({ type: 'stopped' })
                if (error instanceof ChatFailure) {
                    return dispatch({
                        type: 'fail',
                        error: { message: error.message, retryable: error.kind === 'network', ...(error.kind === 'signin' ? { signIn: true } : {}) }
                    })
                }
                dispatch({ type: 'fail', error: { message: FAILURE_MESSAGES.network, retryable: true } })
            } finally {
                if (abortRef.current === abort) abortRef.current = null
            }
        },
        [state.streaming, state.threadId, dispatchApp]
    )

    const stop = useCallback(() => abortRef.current?.abort(), [])

    const retry = useCallback(
        (assistantId: string) => {
            const index = state.messages.findIndex((m) => m.id === assistantId)
            const question = state.messages[index - 1]
            if (!question || question.role !== 'user') return
            dispatch({ type: 'removeTurn', assistantId })
            void send(question.text)
        },
        [state.messages, send]
    )

    const newChat = useCallback(() => {
        abortRef.current?.abort()
        dispatch({ type: 'reset' })
    }, [])

    return { messages: state.messages, streaming: state.streaming, tool: state.tool, threadId: state.threadId, send, stop, retry, newChat }
}
