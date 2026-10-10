import { Check, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import type { Confirmation } from '../types'

interface ConfirmCardProps {
    confirmation: Confirmation
    disabled: boolean
    onAnswer: (approved: boolean) => void
}

// The server-written summary of a confirm-required action, with the customer's yes/no (spec 009).
export default function ConfirmCard({ confirmation, disabled, onAnswer }: ConfirmCardProps) {
    return (
        <div role="group" aria-label="Confirm this action" className="bg-secondary/60 space-y-3 rounded-lg border p-3">
            <p className="text-sm font-medium">{confirmation.summary}</p>
            {confirmation.state === 'pending' ? (
                <div className="flex gap-2">
                    <Button type="button" size="sm" onClick={() => onAnswer(true)} disabled={disabled}>
                        <Check aria-hidden />
                        Confirm
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={() => onAnswer(false)} disabled={disabled}>
                        <X aria-hidden />
                        Cancel
                    </Button>
                </div>
            ) : (
                <p className="text-muted-foreground text-xs">{confirmation.state === 'confirmed' ? 'Confirmed' : 'Cancelled'}</p>
            )}
        </div>
    )
}
