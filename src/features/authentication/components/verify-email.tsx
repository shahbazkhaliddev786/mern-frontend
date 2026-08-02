import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Button } from '@/shared/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks'
import { verifyOtp, resendOtp } from '../slices/auth-slice'

export default function VerifyEmail() {
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useAppDispatch()
    const { isLoading } = useAppSelector((state) => state.auth)
    const email = (location.state as { email?: string } | null)?.email
    const [otp, setOtp] = useState(['', '', '', '', '', ''])
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // If the page is opened directly without an email in navigation state,
    // there's nothing to verify — send the user back to signup.
    useEffect(() => {
        if (!email) {
            toast.error('Please sign up first to verify your email.')
            navigate('/signup', { replace: true })
        }
    }, [email, navigate])

    const handleChange = (index: number, value: string) => {
        // Only allow numbers
        if (!/^[0-9]*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value.substring(value.length - 1)
        setOtp(newOtp)

        // Move focus up
        if (value && index < 5 && inputRefs.current[index + 1]) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Move focus backward on backspace if empty
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email) return

        const code = otp.join('')
        if (code.length !== 6) {
            toast.error('Please complete the 6-digit code')
            return
        }

        try {
            await dispatch(verifyOtp({ email, otp: code })).unwrap()
            toast.success('Email verified successfully!')
            navigate('/')
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Failed to verify OTP')
        }
    }

    const handleResend = async () => {
        if (!email) return

        try {
            await dispatch(resendOtp(email)).unwrap()
            setOtp(['', '', '', '', '', ''])
            inputRefs.current[0]?.focus()
            toast.success('A new code has been sent to your email.')
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Failed to resend code')
        }
    }

    return (
        <section className="relative container mx-auto px-4 py-16 md:py-24 flex justify-center overflow-hidden">
            <div
                className="pointer-events-none absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/10 blur-3xl"
                aria-hidden="true"
            />
            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Verify Email</h1>
                    <p className="text-muted-foreground">We sent a 6-digit code to your email.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-8 shadow-elegant space-y-6">
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el
                                }}
                                type="text"
                                inputMode="numeric"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-xl font-bold rounded-md border border-input bg-background focus:ring-2 focus:ring-accent focus:border-transparent outline-none transition-all"
                            />
                        ))}
                    </div>

                    <Button type="submit" variant="accent" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify Account'}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Didn't receive a code?{' '}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isLoading}
                        className="text-foreground font-medium hover:text-accent transition-colors disabled:opacity-50">
                        Resend
                    </button>
                </p>
            </div>
        </section>
    )
}
