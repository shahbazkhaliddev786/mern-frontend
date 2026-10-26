// The chat endpoint's server-sent events (backend spec 006, phases.md §2).
export type AgentEvent =
    | { event: 'token'; data: { text: string } }
    | { event: 'tool_start'; data: { tool: string; label: string } }
    | { event: 'tool_end'; data: { tool: string; ok: boolean } }
    | { event: 'confirm_required'; data: { interruptId: string; tool: string; summary: string } }
    | { event: 'error'; data: { message: string; retryable: boolean } }
    // replyId (backend spec 021): the reply the customer can rate; absent after a failure or a pause.
    | { event: 'done'; data: { threadId: string; replyId?: string } }

export type MessageStatus = 'streaming' | 'done' | 'stopped' | 'error'

/** A confirm-required action waiting on (or answered by) the customer (spec 009). */
export interface Confirmation {
    interruptId: string
    tool: string
    summary: string
    state: 'pending' | 'confirmed' | 'declined'
}

export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    text: string
    status: MessageStatus
    /** Set when status is 'error'. */
    error?: { message: string; retryable: boolean; signIn?: boolean }
    /** Set on the assistant message that asked for a confirmation. */
    confirmation?: Confirmation
    /** An image the customer attached (spec 012). `previewUrl` is an object URL and isn't saved. */
    attachment?: { name: string; uploadId?: string; previewUrl?: string }
    /** The server's id for this reply, which the customer can rate (backend spec 021). */
    replyId?: string
    feedback?: Feedback
}

export const FEEDBACK_REASONS = ['wrong_answer', 'wrong_action', 'didnt_understand', 'other'] as const
export type FeedbackReason = (typeof FEEDBACK_REASONS)[number]

/** The customer's thumbs up or down on a reply, and how sending it went (backend spec 021). */
export interface Feedback {
    rating: 'up' | 'down'
    state: 'sending' | 'sent' | 'failed'
    reason?: FeedbackReason
    comment?: string
    /** The thumbs-down's reason or comment was sent (or there was nothing to add). */
    detailSent?: boolean
}

/** The image waiting in the composer (spec 012). */
export interface Attachment {
    status: 'uploading' | 'ready' | 'error'
    name: string
    previewUrl: string
    uploadId?: string
    error?: string
}
