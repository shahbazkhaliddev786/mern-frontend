import { Plus } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { useAgentChat } from '../hooks/useAgentChat'
import Composer from './Composer'
import MessageList from './MessageList'

export default function ChatPanel({ onNavigate }: { onNavigate?: () => void }) {
    const { messages, streaming, tool, send, stop, retry, newChat } = useAgentChat()
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
            <MessageList messages={messages} tool={tool} onRetry={retry} {...(onNavigate ? { onNavigate } : {})} />
            <Composer streaming={streaming} onSend={(text) => void send(text)} onStop={stop} />
        </div>
    )
}
