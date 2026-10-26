import { useState, type FormEvent } from 'react'
import { RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { containsSensitive, SENSITIVE_HINT } from '../services/sensitive'
import { FEEDBACK_REASONS, type Feedback, type FeedbackReason } from '../types'

const REASON_LABELS: Record<FeedbackReason, string> = {
    wrong_answer: 'Wrong answer',
    wrong_action: 'Wrong action',
    didnt_understand: "Didn't understand me",
    other: 'Something else'
}
export const MAX_COMMENT = 300

interface FeedbackBarProps {
    feedback?: Feedback
    onRate: (rating: Feedback['rating'], detail?: { reason?: FeedbackReason; comment?: string }) => void
}

// Thumbs up or down on a finished reply (backend spec 021). One tap counts; a thumbs-down then
// offers an optional reason and comment, sent as a second vote that replaces the first.
export default function FeedbackBar({ feedback, onRate }: FeedbackBarProps) {
    const [reason, setReason] = useState<FeedbackReason | null>(null)
    const [comment, setComment] = useState('')
    const [hint, setHint] = useState<string | null>(null)
    const sending = feedback?.state === 'sending'
    const askDetail = feedback?.rating === 'down' && feedback.state === 'sent' && !feedback.detailSent

    const sendDetail = (event: FormEvent) => {
        event.preventDefault()
        const text = comment.trim()
        if (text && containsSensitive(text)) return setHint(SENSITIVE_HINT)
        setHint(null)
        onRate('down', { ...(reason ? { reason } : {}), ...(text ? { comment: text } : {}) })
    }
    const retry = () => {
        if (!feedback) return
        const { rating, reason: sentReason, comment: sentComment } = feedback
        onRate(
            rating,
            sentReason || sentComment
                ? { ...(sentReason ? { reason: sentReason } : {}), ...(sentComment ? { comment: sentComment } : {}) }
                : undefined
        )
    }

    return (
        <div className="space-y-2" data-testid="feedback">
            <div className="flex items-center gap-1">
                {(['up', 'down'] as const).map((rating) => {
                    const Icon = rating === 'up' ? ThumbsUp : ThumbsDown
                    const chosen = feedback?.rating === rating
                    return (
                        <Button
                            key={rating}
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={`size-7 ${chosen ? 'text-primary' : 'text-muted-foreground'}`}
                            aria-label={rating === 'up' ? 'Helpful' : 'Not helpful'}
                            aria-pressed={chosen}
                            disabled={sending}
                            onClick={() => !chosen && onRate(rating)}>
                            <Icon className={`size-4 ${chosen ? 'fill-current' : ''}`} aria-hidden />
                        </Button>
                    )
                })}
                {feedback?.state === 'sent' && !askDetail && <span className="text-muted-foreground text-xs">Thanks for the feedback.</span>}
                {feedback?.state === 'failed' && (
                    <span className="text-muted-foreground inline-flex items-center gap-1 text-xs">
                        Couldn't send your feedback.
                        <button type="button" onClick={retry} className="text-primary inline-flex items-center gap-1 font-medium hover:underline">
                            <RotateCcw className="size-3" aria-hidden />
                            Retry
                        </button>
                    </span>
                )}
            </div>
            {askDetail && (
                <form onSubmit={sendDetail} aria-label="What went wrong?" className="bg-secondary/60 space-y-2 rounded-lg border p-3">
                    <p className="text-sm font-medium">What went wrong? (optional)</p>
                    <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Reason">
                        {FEEDBACK_REASONS.map((value) => (
                            <button
                                key={value}
                                type="button"
                                role="radio"
                                aria-checked={reason === value}
                                onClick={() => setReason(reason === value ? null : value)}
                                className={`rounded-full border px-2 py-0.5 text-xs ${reason === value ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                                {REASON_LABELS[value]}
                            </button>
                        ))}
                    </div>
                    <textarea
                        aria-label="Tell us more"
                        placeholder="Tell us more (optional)"
                        maxLength={MAX_COMMENT}
                        rows={2}
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        className="bg-background w-full resize-none rounded-md border px-2 py-1 text-sm"
                    />
                    {hint && <p className="text-destructive text-xs">{hint}</p>}
                    <Button type="submit" size="sm">
                        Send
                    </Button>
                </form>
            )}
        </div>
    )
}
