import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Loader2 } from 'lucide-react'
import { changePasswordSchema, PASSWORD_HINT, type ChangePasswordFormData } from '@/features/authentication/schemas/auth.schema'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { useChangePasswordMutation } from '../hooks/useChangePasswordMutation'
import { ProfileField } from './profile-field'

export function ChangePasswordCard() {
    const { mutate: changePassword, isPending } = useChangePasswordMutation()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm<ChangePasswordFormData>({
        resolver: zodResolver(changePasswordSchema),
        defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' }
    })

    const onSubmit = ({ currentPassword, newPassword }: ChangePasswordFormData) => {
        changePassword({ currentPassword, newPassword }, { onSuccess: () => reset() })
    }

    return (
        <Card className="rounded-[2.5rem] border-border bg-card shadow-xl overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-muted/30 pb-6 pt-8 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Change Password</CardTitle>
                <CardDescription className="text-base">You'll stay signed in here. Your other devices will be signed out.</CardDescription>
            </CardHeader>

            <CardContent className="pt-8 pb-10 px-6 sm:px-10">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <ProfileField
                        id="current-password"
                        label="Current Password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        error={errors.currentPassword?.message}
                        {...register('currentPassword')}
                    />
                    <ProfileField
                        id="new-password"
                        label="New Password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        hint={PASSWORD_HINT}
                        error={errors.newPassword?.message}
                        {...register('newPassword')}
                    />
                    <ProfileField
                        id="confirm-password"
                        label="Confirm New Password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />

                    <Button type="submit" variant="accent" className="w-full gap-2 rounded-xl h-12 font-bold" disabled={isPending}>
                        {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <KeyRound className="h-5 w-5" />}
                        {isPending ? 'Updating...' : 'Update Password'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
