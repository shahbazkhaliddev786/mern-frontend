import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Send, Square } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export const MAX_MESSAGE_LENGTH = 2000

interface ComposerProps {
    streaming: boolean
    onSend: (text: string) => void
    onStop: () => void
}

export default function Composer({ streaming, onSend, onStop }: ComposerProps) {
    const [text, setText] = useState('')
    const canSend = !streaming && text.trim().length > 0

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
        <form onSubmit={submit} className="flex items-end gap-2 border-t p-3">
            <textarea
                aria-label="Message the shopping assistant"
                value={text}
                onChange={(event) => setText(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                onKeyDown={onKeyDown}
                rows={2}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Ask about products, your cart or orders…"
                className="border-input bg-background focus-visible:ring-ring flex-1 resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
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
        </form>
    )
}
