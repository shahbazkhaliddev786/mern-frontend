// The chat endpoint's server-sent events (backend spec 006, phases.md §2).
export type AgentEvent =
    | { event: 'token'; data: { text: string } }
    | { event: 'tool_start'; data: { tool: string; label: string } }
    | { event: 'tool_end'; data: { tool: string; ok: boolean } }
    | { event: 'confirm_required'; data: { interruptId: string; tool: string; summary: string } }
    | { event: 'error'; data: { message: string; retryable: boolean } }
    | { event: 'done'; data: { threadId: string } }

export type MessageStatus = 'streaming' | 'done' | 'stopped' | 'error'

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    text: string
    status: MessageStatus
    /** Set when status is 'error'. */
    error?: { message: string; retryable: boolean; signIn?: boolean }
}
