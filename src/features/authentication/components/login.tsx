import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { loginSchema, type LoginFormData } from '../schemas/auth.schema'
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks'
import { loginUser } from '../slices/auth-slice'
import { toast } from 'react-toastify'

export default function Login() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const queryClient = useQueryClient()
    const [showPassword, setShowPassword] = useState(false)
    const { isLoading, error: authError } = useAppSelector((state) => state.auth)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit = async (data: LoginFormData) => {
        try {
            const response = await dispatch(loginUser(data)).unwrap()
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            toast.success('Successfully logged in!')
            const isAdmin = response.user.role === 'admin'
            navigate(isAdmin ? '/admin' : '/products')
        } catch (error) {
            toast.error(typeof error === 'string' ? error : 'Login failed')
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
                    <h1 className="font-display text-3xl md:text-4xl font-semibold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to your Aljo Store account</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="bg-card border border-border rounded-2xl p-8 shadow-elegant space-y-4">
                    {authError && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-sm text-center">
                            {authError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="john@example.com" {...register('email')} />
                        {errors.email && <span className="text-xs text-destructive">{errors.email.message}</span>}
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password">Password</Label>
                            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-accent transition-colors">
                                Forgot password?
                            </Link>
                        </div>
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

                    <Button type="submit" variant="accent" disabled={isLoading} className="w-full" size="lg">
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                </form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-foreground font-medium hover:text-accent transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </section>
    )
}
