import type { ComponentProps } from 'react'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { cn } from '@/shared/lib/utils'

interface ProfileFieldProps extends ComponentProps<typeof Input> {
    id: string
    label: string
    error?: string | undefined
    hint?: string
}

// A labelled input in the profile forms' style, followed by its validation message or hint.
export function ProfileField({ id, label, error, hint, className, ...inputProps }: ProfileFieldProps) {
    const messageId = `${id}-message`

    return (
        <div className="space-y-2">
            <Label htmlFor={id} className="text-sm font-semibold ml-1">
                {label}
            </Label>
            <Input
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={error || hint ? messageId : undefined}
                className={cn('h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all', className)}
                {...inputProps}
            />
            {error ? (
                <p id={messageId} className="text-xs font-medium text-destructive mt-1 ml-1">
                    {error}
                </p>
            ) : (
                hint && (
                    <p id={messageId} className="text-xs text-muted-foreground mt-1 ml-1">
                        {hint}
                    </p>
                )
            )}
        </div>
    )
}
