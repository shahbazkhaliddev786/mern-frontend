import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { useAgentChat } from '../hooks/useAgentChat'
import Composer from './Composer'
import MessageList from './MessageList'

export default function ChatPanel({ onNavigate }: { onNavigate?: () => void }) {
    const { messages, streaming, tool, pendingConfirmation, attachment, attach, removeAttachment, send, respond, rate, stop, retry, newChat } =
        useAgentChat()
    return (
        <div className="flex h-full min-h-0 flex-col">
            <SheetHeader className="border-b pr-12">
                <div className="flex items-center justify-between gap-2">
                    <SheetTitle>Shopping assistant</SheetTitle>
                    <Button type="button" variant="ghost" size="sm" onClick={newChat} disabled={messages.length === 0 && !streaming}>
                        <Plus className="size-4" aria-hidden />
                        New chat
                    </Button>
                </div>
                <SheetDescription>Answers come from the store's catalog and your account.</SheetDescription>
            </SheetHeader>
            <MessageList
                messages={messages}
                tool={tool}
                busy={streaming}
                onRetry={retry}
                onConfirm={(id, approved) => void respond(id, approved)}
                onFeedback={(id, rating, detail) => void rate(id, rating, detail)}
                {...(onNavigate ? { onNavigate } : {})}
            />
            <Composer
                streaming={streaming}
                blockedReason={pendingConfirmation ? 'Confirm or cancel the action above first.' : null}
                onSend={(text) => void send(text)}
                onStop={stop}
                attachment={attachment}
                onAttach={(file) => void attach(file)}
                onRemoveAttachment={removeAttachment}
            />
        </div>
    )
}
