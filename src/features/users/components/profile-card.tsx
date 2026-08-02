import { Avatar } from '@/shared/components/ui/avatar'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import type { UserProfileData } from '../services/profile.service'
import { Edit2 } from 'lucide-react'
import { Link } from 'react-router-dom'

interface ProfileCardProps {
    user: UserProfileData
}

export function ProfileCard({ user }: ProfileCardProps) {
    return (
        <Card className="rounded-3xl border-border bg-card shadow-elegant">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl font-semibold">Personal Information</CardTitle>
                    <CardDescription>Manage your personal details and contact info.</CardDescription>
                </div>
                <Link to="/profile/edit">
                    <Button variant="outline" size="sm" className="hidden sm:flex gap-2 rounded-full px-4">
                        <Edit2 className="h-4 w-4" /> Edit Profile
                    </Button>
                </Link>
            </CardHeader>

            <CardContent className="mt-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Avatar src={user.profile} alt={user.name} className="h-24 w-24 shrink-0 rounded-full text-2xl border-2 border-border shadow-sm">
                        {/* If Avatar component accepts children we can pass initials, otherwise we rely on its internal User icon */}
                    </Avatar>

                    <div className="space-y-4 w-full text-center sm:text-left">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Full Name</p>
                            <p className="text-lg font-semibold text-foreground mt-1">{user.name}</p>
                        </div>

                        <div className="border-t border-border pt-4">
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Email Address</p>
                            <p className="text-lg text-foreground mt-1">{user.email}</p>
                        </div>
                    </div>
                </div>

                <Link to="/profile/edit" className="block w-full">
                    <Button variant="outline" className="w-full mt-8 sm:hidden gap-2 rounded-xl h-12">
                        <Edit2 className="h-4 w-4" /> Edit Profile
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
