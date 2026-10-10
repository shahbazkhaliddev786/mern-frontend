import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import type { ChatMessage } from '../types'
import AssistantMessage from './AssistantMessage'
import ConfirmCard from './ConfirmCard'
import ToolStatus from './ToolStatus'

interface MessageListProps {
    messages: ChatMessage[]
    tool: { label: string } | null
    onRetry: (assistantId: string) => void
    onConfirm: (assistantId: string, approved: boolean) => void
    /** True while a reply streams: confirmation buttons wait for it. */
    busy: boolean
    onNavigate?: () => void
}

export default function MessageList({ messages, tool, onRetry, onConfirm, busy, onNavigate }: MessageListProps) {
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
                    <div key={message.id} className="flex justify-end">
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
                                        className="text-primary inline-flex items-center gap-1 text-sm font-medium underline-offset-2 hover:underline">
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
