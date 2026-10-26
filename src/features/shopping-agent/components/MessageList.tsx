import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Image as ImageIcon, RotateCcw } from 'lucide-react'
import type { ChatMessage, Feedback, FeedbackReason } from '../types'
import AssistantMessage from './AssistantMessage'
import ConfirmCard from './ConfirmCard'
import FeedbackBar from './FeedbackBar'
import ToolStatus from './ToolStatus'

interface MessageListProps {
    messages: ChatMessage[]
    tool: { label: string } | null
    onRetry: (assistantId: string) => void
    onConfirm: (assistantId: string, approved: boolean) => void
    /** Thumbs up or down on a finished reply (backend spec 021). */
    onFeedback?: (assistantId: string, rating: Feedback['rating'], detail?: { reason?: FeedbackReason; comment?: string }) => void
    /** True while a reply streams: confirmation buttons wait for it. */
    busy: boolean
    /** True while a confirmation waits: "Try again" would be refused (backend spec 022). */
    retryBlocked?: boolean
    onNavigate?: () => void
}

export default function MessageList({ messages, tool, onRetry, onConfirm, onFeedback, busy, retryBlocked = false, onNavigate }: MessageListProps) {
    const endRef = useRef<HTMLDivElement>(null)
    const last = messages.at(-1)
    useEffect(() => {
        endRef.current?.scrollIntoView?.({ block: 'end' })
    }, [messages.length, last?.text, tool])

    if (messages.length === 0) {
        return (
            <div className="text-muted-foreground flex flex-1 items-center justify-center px-6 text-center text-sm">
                Ask about products, your cart or your orders. For example: “running shoes under $50”.
            </div>
        )
    }

    return (
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.map((message) =>
                message.role === 'user' ? (
                    <div key={message.id} className="flex flex-col items-end gap-1">
                        {message.attachment &&
                            (message.attachment.previewUrl ? (
                                <img
                                    src={message.attachment.previewUrl}
                                    alt={message.attachment.name}
                                    className="max-h-40 max-w-[60%] rounded-xl border object-cover"
                                />
                            ) : (
                                <p className="text-muted-foreground flex max-w-[85%] items-center gap-1 text-xs">
                                    <ImageIcon className="size-3 shrink-0" aria-hidden />
                                    <span className="truncate">{message.attachment.name}</span>
                                </p>
                            ))}
                        <p className="bg-primary text-primary-foreground max-w-[85%] rounded-2xl rounded-br-sm px-3 py-2 text-sm whitespace-pre-wrap">
                            {message.text}
                        </p>
                    </div>
                ) : (
                    <div key={message.id} className="max-w-[90%] space-y-2" data-testid="assistant-message">
                        {message.text && <AssistantMessage text={message.text} {...(onNavigate ? { onNavigate } : {})} />}
                        {message.status === 'streaming' && !message.text && !tool && (
                            <p className="text-muted-foreground text-sm" aria-label="Assistant is typing">
                                …
                            </p>
                        )}
                        {message.confirmation && (
                            <ConfirmCard
                                confirmation={message.confirmation}
                                disabled={busy}
                                onAnswer={(approved) => onConfirm(message.id, approved)}
                            />
                        )}
                        {message.status === 'stopped' && <p className="text-muted-foreground text-xs">Stopped.</p>}
                        {onFeedback && message.replyId && message.status === 'done' && (
                            <FeedbackBar
                                {...(message.feedback ? { feedback: message.feedback } : {})}
                                onRate={(rating, detail) => onFeedback(message.id, rating, detail)}
                            />
                        )}
                        {message.status === 'error' && message.error && (
                            <div className="text-destructive space-y-2 text-sm">
                                <p>{message.error.message}</p>
                                {message.error.signIn && (
                                    <Link to="/login" onClick={onNavigate} className="text-primary font-medium underline underline-offset-2">
                                        Sign in
                                    </Link>
                                )}
                                {message.error.retryable && (
                                    <button
                                        type="button"
                                        onClick={() => onRetry(message.id)}
                                        disabled={busy || retryBlocked}
                                        className="text-primary inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline disabled:pointer-events-none disabled:opacity-50">
                                        <RotateCcw className="size-3" aria-hidden />
                                        Try again
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )
            )}
            {tool && <ToolStatus label={tool.label} />}
            <div ref={endRef} />
        </div>
    )
}
