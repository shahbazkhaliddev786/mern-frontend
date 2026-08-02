import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, Loader2, Save } from 'lucide-react'
import { useProfileQuery } from '../hooks/useProfileQuery'
import { useUpdateProfileMutation } from '../hooks/useUpdateProfileMutation'
import { editProfileSchema, type EditProfileFormData } from '@/features/authentication/schemas/auth.schema'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Avatar } from '@/shared/components/ui/avatar'

export function EditProfilePage() {
    const navigate = useNavigate()
    const { data: profileData, isLoading: isProfileLoading } = useProfileQuery()
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfileMutation()
    const [preview, setPreview] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors }
    } = useForm<EditProfileFormData>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            name: '',
            email: '',
            password: ''
        }
    })

    // Populate form with current data
    useEffect(() => {
        if (profileData?.data) {
            setValue('name', profileData.data.name)
            setValue('email', profileData.data.email)
        }
    }, [profileData, setValue])

    const profileFile = watch('profile')

    // Handle image preview
    useEffect(() => {
        if (profileFile && profileFile.length > 0) {
            const file = profileFile[0]
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }, [profileFile])

    const onSubmit = (data: EditProfileFormData) => {
        // Filter out empty password
        const payload = { ...data }
        if (!payload.password) delete payload.password

        updateProfile(payload, {
            onSuccess: () => {
                navigate('/profile')
            }
        })
    }

    if (isProfileLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <section className="container mx-auto px-4 py-12 md:py-24 max-w-2xl">
            <Button variant="ghost" className="mb-8 gap-2 hover:bg-secondary/50 rounded-full" onClick={() => navigate('/profile')}>
                <ArrowLeft className="h-4 w-4" /> Back to Profile
            </Button>

            <Card className="rounded-[2.5rem] border-border bg-card shadow-xl overflow-hidden">
                <CardHeader className="border-b border-border/50 bg-muted/30 pb-8 pt-10 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">Edit Profile</CardTitle>
                    <CardDescription className="text-base">Update your personal information and profile picture</CardDescription>
                </CardHeader>

                <CardContent className="pt-10 pb-12 px-6 sm:px-10">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
                        {/* Profile Picture Upload */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="relative group">
                                <div className="p-1 rounded-full border-2 border-primary/20 bg-background">
                                    <Avatar
                                        src={preview || profileData?.data.profile}
                                        className="h-32 w-32 border-4 border-background shadow-2xl rounded-full object-cover"
                                    />
                                </div>
                                <label
                                    htmlFor="profile-upload"
                                    className="absolute bottom-1 right-1 p-3 bg-accent text-accent-foreground rounded-full cursor-pointer shadow-glow hover:scale-110 active:scale-95 transition-all duration-200 border-4 border-background">
                                    <Camera className="h-5 w-5" />
                                    <input id="profile-upload" type="file" className="hidden" accept="image/*" {...register('profile')} />
                                </label>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium text-foreground">Profile Picture</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or GIF up to 2MB</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold ml-1">
                                    Full Name
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Your Name"
                                    {...register('name')}
                                    className={`h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all ${errors.name ? 'border-destructive ring-destructive/20' : ''}`}
                                />
                                {errors.name && <p className="text-xs font-medium text-destructive mt-1 ml-1">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold ml-1">
                                    Email Address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="your@email.com"
                                    {...register('email')}
                                    className={`h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all ${errors.email ? 'border-destructive ring-destructive/20' : ''}`}
                                />
                                {errors.email && <p className="text-xs font-medium text-destructive mt-1 ml-1">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold ml-1">
                                    New Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register('password')}
                                    className={`h-12 rounded-xl border-border bg-background focus:ring-2 focus:ring-primary/20 transition-all ${errors.password ? 'border-destructive ring-destructive/20' : ''}`}
                                />
                                <p className="text-xs text-muted-foreground mt-1 ml-1">Leave blank if you don't want to change it</p>
                                {errors.password && <p className="text-xs font-medium text-destructive mt-1 ml-1">{errors.password.message}</p>}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                type="submit"
                                variant="accent"
                                className="flex-[2] gap-2 rounded-xl h-14 text-lg font-bold shadow-glow transition-all active:scale-[0.98]"
                                disabled={isUpdating}>
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 rounded-xl h-14 text-lg font-medium hover:bg-secondary/50 transition-all"
                                onClick={() => navigate('/profile')}
                                disabled={isUpdating}>
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </section>
    )
}
