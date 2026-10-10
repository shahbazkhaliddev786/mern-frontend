import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail, MailCheck } from 'lucide-react'
import { changeEmailSchema, emailCodeSchema, type ChangeEmailFormData, type EmailCodeFormData } from '@/features/authentication/schemas/auth.schema'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useRequestEmailChangeMutation } from '../hooks/useRequestEmailChangeMutation'
import { useConfirmEmailChangeMutation } from '../hooks/useConfirmEmailChangeMutation'
import { ProfileField } from './profile-field'

interface ChangeEmailCardProps {
    currentEmail?: string | undefined
}

// Two steps: confirm the password and name the new address (a code is emailed there),
// then enter that code. The address only changes once the code is accepted.
export function ChangeEmailCard({ currentEmail }: ChangeEmailCardProps) {
    const [pendingEmail, setPendingEmail] = useState<string | null>(null)

    return (
        <Card className="rounded-[2.5rem] border-border bg-card shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/30 pb-6 pt-8 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Change Email</CardTitle>
                <CardDescription className="text-base">
                    {pendingEmail ? (
                        <>
                            Enter the 6-digit code we sent to <span className="font-medium text-foreground">{pendingEmail}</span>. It expires in 5
                            minutes.
                        </>
                    ) : (
                        <>
                            {currentEmail && (
                                <>
                                    Your email is <span className="font-medium text-foreground">{currentEmail}</span>.{' '}
                                </>
                            )}
                            We'll send a code to the new address to confirm it.
                        </>
                    )}
                </CardDescription>
            </CardHeader>

            <CardContent className="pt-8 pb-10 px-6 sm:px-10">
                {pendingEmail ? <ConfirmCodeForm onDone={() => setPendingEmail(null)} /> : <RequestCodeForm onSent={setPendingEmail} />}
            </CardContent>
        </Card>
    )
}

// One useForm per component, with `errors` destructured from it: the React Compiler
// memoizes on the useForm() object itself, which never changes, so reading
// `form.formState.errors` would leave validation messages stale.
function RequestCodeForm({ onSent }: { onSent: (newEmail: string) => void }) {
    const { mutate: requestChange, isPending } = useRequestEmailChangeMutation()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ChangeEmailFormData>({
        resolver: zodResolver(changeEmailSchema),
        defaultValues: { newEmail: '', currentPassword: '' }
    })

    const onSubmit = (data: ChangeEmailFormData) => {
        requestChange(data, { onSuccess: () => onSent(data.newEmail) })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <ProfileField
                id="new-email"
                label="New Email Address"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                error={errors.newEmail?.message}
                {...register('newEmail')}
            />
            <ProfileField
                id="email-current-password"
                label="Current Password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.currentPassword?.message}
                {...register('currentPassword')}
            />

            <Button type="submit" variant="accent" className="w-full gap-2 rounded-xl h-12 font-bold" disabled={isPending}>
                {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
                {isPending ? 'Sending...' : 'Send Code'}
            </Button>
        </form>
    )
}

function ConfirmCodeForm({ onDone }: { onDone: () => void }) {
    const { mutate: confirmChange, isPending } = useConfirmEmailChangeMutation()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<EmailCodeFormData>({
        resolver: zodResolver(emailCodeSchema),
        defaultValues: { otp: '' }
    })

    const onSubmit = ({ otp }: EmailCodeFormData) => {
        confirmChange(otp, { onSuccess: onDone })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ProfileField
                id="email-code"
                label="Verification Code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="123456"
                error={errors.otp?.message}
                {...register('otp')}
            />

            <div className="flex flex-col sm:flex-row gap-4">
                <Button type="submit" variant="accent" className="flex-[2] gap-2 rounded-xl h-12 font-bold" disabled={isPending}>
                    {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <MailCheck className="h-5 w-5" />}
                    {isPending ? 'Confirming...' : 'Confirm Email'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 rounded-xl h-12 font-medium hover:bg-secondary/50"
                    onClick={onDone}
                    disabled={isPending}>
                    Start Over
                </Button>
            </div>
        </form>
    )
}
