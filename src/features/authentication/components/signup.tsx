import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { signupSchema, type SignupFormData } from '../schemas/auth.schema'
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks'
import { signupUser } from '../slices/auth-slice'
import { toast } from 'react-toastify'

export default function Signup() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [showPassword, setShowPassword] = useState(false)
    const { isLoading, error: authError } = useAppSelector((state) => state.auth)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema)
    })

    const onSubmit = async (data: SignupFormData) => {
        try {
            await dispatch(signupUser(data)).unwrap()
            toast.success('Registration successful! Check your email.')
            navigate('/verify-email', { state: { email: data.email } })
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Signup failed')
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
                    <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Create Account</h1>
                    <p className="text-muted-foreground">Join Aljo Store and start shopping</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-2xl p-8 shadow-elegant space-y-4">
                    {authError && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm text-center">
                            {authError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="John Doe" {...register('name')} />
                        {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
                        {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" {...register('password')} />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {errors.password && <span className="text-xs text-destructive">{errors.password.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="profile">Profile Picture (Optional)</Label>
                        <Input id="profile" type="file" accept="image/*" {...register('profile')} />
                        {errors.profile && <span className="text-xs text-destructive">{errors.profile.message as string}</span>}
                    </div>

                    <Button type="submit" variant="accent" disabled={isLoading} className="w-full" size="lg">
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-foreground font-medium hover:text-accent transition-colors">
                        Log in
                    </Link>
                </p>
            </div>
        </section>
    )
}
