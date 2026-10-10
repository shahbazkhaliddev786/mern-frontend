import { useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { Loader2, Paperclip, Send, Square, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { IMAGE_TYPES } from '../hooks/useAgentChat'
import type { Attachment } from '../types'

export const MAX_MESSAGE_LENGTH = 2000

interface ComposerProps {
    streaming: boolean
    /** Set while a confirmation waits: the customer answers it before writing more (spec 009). */
    blockedReason?: string | null
    onSend: (text: string) => void
    onStop: () => void
    /** The attached image, if any (spec 012). */
    attachment?: Attachment | null
    onAttach?: (file: File) => void
    onRemoveAttachment?: () => void
}

const ATTACHMENT_STATUS = { uploading: 'Uploading…', ready: 'Ready to send' } as const

export default function Composer({ streaming, blockedReason, onSend, onStop, attachment, onAttach, onRemoveAttachment }: ComposerProps) {
    const [text, setText] = useState('')
    const fileInput = useRef<HTMLInputElement>(null)
    const hasReadyImage = attachment?.status === 'ready'
    const canSend = !streaming && !blockedReason && attachment?.status !== 'uploading' && (text.trim().length > 0 || hasReadyImage)

    const pickFile = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        // Cleared so picking the same file again still fires a change.
        event.target.value = ''
        if (file) onAttach?.(file)
    }

    const submit = (event?: FormEvent) => {
        event?.preventDefault()
        if (!canSend) return
        onSend(text)
        setText('')
    }

    // Enter sends; Shift+Enter starts a new line.
    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()
            submit()
        }
    }

    return (
        <form onSubmit={submit} className="space-y-2 border-t p-3">
            {blockedReason && <p className="text-muted-foreground text-xs">{blockedReason}</p>}
            {attachment && (
                <div className="bg-muted/50 flex items-center gap-2 rounded-md border p-2" data-testid="attachment-chip">
                    <img src={attachment.previewUrl} alt="" className="size-10 shrink-0 rounded object-cover" />
                    <div className="min-w-0 flex-1 text-xs">
                        <p className="truncate font-medium">{attachment.name}</p>
                        {attachment.status === 'error' ? (
                            <p className="text-destructive">{attachment.error}</p>
                        ) : (
                            <p className="text-muted-foreground flex items-center gap-1">
                                {attachment.status === 'uploading' && <Loader2 className="size-3 animate-spin" aria-hidden />}
                                {ATTACHMENT_STATUS[attachment.status]}
                            </p>
                        )}
                    </div>
                    <Button type="button" variant="ghost" size="icon" className="size-7" onClick={onRemoveAttachment} aria-label="Remove attachment">
                        <X className="size-4" />
                    </Button>
                </div>
            )}
            <div className="flex items-end gap-2">
                {onAttach && (
                    <>
                        <input
                            ref={fileInput}
                            type="file"
                            accept={IMAGE_TYPES.join(',')}
                            className="hidden"
                            onChange={pickFile}
                            data-testid="attach-input"
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={Boolean(blockedReason) || streaming}
                            onClick={() => fileInput.current?.click()}
                            aria-label="Attach an image">
                            <Paperclip className="size-4" />
                        </Button>
                    </>
                )}
                <textarea
                    aria-label="Message the shopping assistant"
                    disabled={Boolean(blockedReason)}
                    value={text}
                    onChange={(event) => setText(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                    onKeyDown={onKeyDown}
                    rows={2}
                    maxLength={MAX_MESSAGE_LENGTH}
                    placeholder="Ask about products, your cart or orders…"
                    className="border-input bg-background focus-visible:ring-ring flex-1 resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"
                />
                {streaming ? (
                    <Button type="button" variant="outline" size="icon" onClick={onStop} aria-label="Stop">
                        <Square className="size-4" />
                    </Button>
                ) : (
                    <Button type="submit" size="icon" disabled={!canSend} aria-label="Send">
                        <Send className="size-4" />
                    </Button>
                )}
            </div>
        </form>
    )
}
