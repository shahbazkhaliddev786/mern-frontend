import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'

export default function ForgotPassword() {
    return (
        <section className="relative container mx-auto px-4 py-16 md:py-24 flex justify-center overflow-hidden">
            <div
                className="pointer-events-none absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/3 rounded-full bg-accent/10 blur-3xl"
                aria-hidden="true"
            />
            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Reset Password</h1>
                    <p className="text-muted-foreground">Enter your email and we'll send you a reset link</p>
                </div>

                <div className="bg-card border border-border rounded-2xl p-8 shadow-elegant space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="john@example.com" />
                    </div>
                    <Button variant="accent" className="w-full" size="lg">
                        Send Reset Link
                    </Button>
                </div>

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
