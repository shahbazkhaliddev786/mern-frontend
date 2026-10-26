import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { isAgentEnabled } from '@/shared/config/env'
import { useAppSelector } from '@/shared/store/hooks'
import { Button } from '@/shared/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet'
import { useAgentChat } from '../hooks/useAgentChat'
import ChatPanel from './ChatPanel'

const isSmallScreen = () => typeof window !== 'undefined' && window.matchMedia?.('(max-width: 640px)').matches

// Store pages only (it lives in PageLayout). Signed-in customers get the chat; guests get a
// sign-in prompt instead (reconciliation.md Gap 16). Hidden unless VITE_AGENT_ENABLED=true.
export default function ChatLauncher() {
    const [open, setOpen] = useState(false)
    const { isAuthenticated } = useAppSelector((state) => state.auth)
    // Kept here, outside the Sheet, so a reply keeps streaming while the panel is closed (backend spec 022).
    const chat = useAgentChat()
    if (!isAgentEnabled()) return null

    // On a phone the panel covers the page, so following a product link closes it.
    const onNavigate = () => {
        if (isSmallScreen()) setOpen(false)
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <Button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed right-4 bottom-4 z-40 h-12 rounded-full px-4 shadow-lg"
                aria-label="Open the shopping assistant">
                <MessageCircle className="size-5" aria-hidden />
                <span className="hidden sm:inline">Ask the assistant</span>
            </Button>
            <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-[420px]">
                {isAuthenticated ? (
                    <ChatPanel chat={chat} onNavigate={onNavigate} />
                ) : (
                    <SheetHeader className="p-6">
                        <SheetTitle>Shopping assistant</SheetTitle>
                        <SheetDescription>Sign in to ask about products, your cart and your orders.</SheetDescription>
                        <div className="flex gap-2 pt-4">
                            <Button asChild>
                                <Link to="/login" onClick={() => setOpen(false)}>
                                    Sign in
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/signup" onClick={() => setOpen(false)}>
                                    Create account
                                </Link>
                            </Button>
                        </div>
                    </SheetHeader>
                )}
            </SheetContent>
        </Sheet>
    )
}
