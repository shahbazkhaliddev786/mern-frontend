import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { getErrorMessage } from '@/shared/services/api'
import {
    forgotPasswordSchema,
    PASSWORD_HINT,
    resetPasswordSchema,
    type ForgotPasswordFormData,
    type ResetPasswordFormData
} from '../schemas/auth.schema'
import { useForgotPassword, useResetPassword } from '../hooks/useAuth'

const SEND_CODE_FAILED = 'Could not send the code. Please try again.'

// Step 1 emails a reset code to the address; step 2 takes that code and the new password.
export default function ForgotPassword() {
    const [email, setEmail] = useState<string | null>(null)

    return (
        <section className="relative container mx-auto px-4 py-16 md:py-24 flex justify-center overflow-hidden">
            <div
                className="pointer-events-none absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/10 blur-3xl"
                aria-hidden="true"
            />
            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Reset Password</h1>
                    <p className="text-muted-foreground">
                        {email ? (
                            <>
                                Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span> and choose a new password
                            </>
                        ) : (
                            "Enter your email and we'll send you a reset code"
                        )}
                    </p>
                </div>

                {email ? <ResetPasswordForm email={email} onStartOver={() => setEmail(null)} /> : <RequestCodeForm onSent={setEmail} />}

                <div className="text-center mt-6">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" /> Back to Login
                    </Link>
                </div>
            </div>
        </section>
    )
}

// One useForm per component, with `errors` destructured from it: the React Compiler
// memoizes on the useForm() object itself, which never changes, so reading
// `form.formState.errors` would leave validation messages stale.
function RequestCodeForm({ onSent }: { onSent: (email: string) => void }) {
    const { mutate: sendCode, isPending } = useForgotPassword()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' }
    })
    const emailError = errors.email?.message

    const onSubmit = ({ email }: ForgotPasswordFormData) => {
        sendCode(email, {
            onSuccess: () => {
                toast.success('If an account uses that email, a reset code is on its way.')
                onSent(email)
            },
            onError: (error) => toast.error(getErrorMessage(error, SEND_CODE_FAILED))
        })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-2xl p-8 shadow-elegant space-y-4" noValidate>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" autoComplete="email" placeholder="john@example.com" {...register('email')} />
                {emailError && <span className="text-xs text-destructive">{emailError}</span>}
            </div>
            <Button type="submit" variant="accent" className="w-full" size="lg" disabled={isPending}>
                {isPending ? 'Sending...' : 'Send Reset Code'}
            </Button>
        </form>
    )
}

function ResetPasswordForm({ email, onStartOver }: { email: string; onStartOver: () => void }) {
    const navigate = useNavigate()
    const { mutate: resendCode, isPending: isResending } = useForgotPassword()
    const { mutate: resetPassword, isPending: isResetting } = useResetPassword()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { otp: '', newPassword: '', confirmPassword: '' }
    })
    const otpError = errors.otp?.message
    const newPasswordError = errors.newPassword?.message
    const confirmPasswordError = errors.confirmPassword?.message

    const onResend = () => {
        resendCode(email, {
            onSuccess: () => toast.success('If an account uses that email, a new code is on its way.'),
            onError: (error) => toast.error(getErrorMessage(error, SEND_CODE_FAILED))
        })
    }

    const onSubmit = (data: ResetPasswordFormData) => {
        resetPassword(
            { email, ...data },
            {
                onSuccess: () => {
                    toast.success('Password reset. Sign in with your new password.')
                    navigate('/login')
                },
                onError: (error) => toast.error(getErrorMessage(error, 'Could not reset the password. Please try again.'))
            }
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-2xl p-8 shadow-elegant space-y-4">
            <div className="space-y-2">
                <Label htmlFor="otp">Reset Code</Label>
                <Input id="otp" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="123456" {...register('otp')} />
                {otpError && <span className="text-xs text-destructive">{otpError}</span>}
            </div>

            <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" autoComplete="new-password" placeholder="••••••••" {...register('newPassword')} />
                {newPasswordError ? (
                    <span className="text-xs text-destructive">{newPasswordError}</span>
                ) : (
                    <span className="text-xs text-muted-foreground">{PASSWORD_HINT}</span>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input id="confirmPassword" type="password" autoComplete="new-password" placeholder="••••••••" {...register('confirmPassword')} />
                {confirmPasswordError && <span className="text-xs text-destructive">{confirmPasswordError}</span>}
            </div>

            <Button type="submit" variant="accent" className="w-full" size="lg" disabled={isResetting}>
                {isResetting ? 'Resetting...' : 'Reset Password'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
                Didn't get a code?{' '}
                <button
                    type="button"
                    onClick={onResend}
                    disabled={isResending}
                    className="text-foreground font-medium hover:text-accent transition-colors disabled:opacity-50">
                    Resend
                </button>{' '}
                or{' '}
                <button type="button" onClick={onStartOver} className="text-foreground font-medium hover:text-accent transition-colors">
                    use a different email
                </button>
            </p>
        </form>
    )
}
