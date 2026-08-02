import { NavLink } from 'react-router-dom'
import { ADMIN_NAVIGATION } from '../../constants/navigation'
import { LogOut } from 'lucide-react'
import { useAppDispatch } from '@/shared/store/hooks'
import { logout } from '@/features/authentication/slices/auth-slice'

interface AdminSidebarProps {
    onClose?: () => void
}

export function AdminSidebar({ onClose }: AdminSidebarProps) {
    const dispatch = useAppDispatch()

    const handleLogout = () => {
        dispatch(logout())
    }

    return (
        <div className="flex h-full flex-col overflow-y-auto border-r border-border bg-card px-4 py-6">
            <div className="mb-8 flex items-center justify-center">
                <h1 className="font-display text-2xl font-bold tracking-tight text-primary">ALJO Admin</h1>
            </div>

            <nav className="flex-1 space-y-2">
                {ADMIN_NAVIGATION.map((item) => {
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            onClick={onClose}
                            end={item.href === '/admin'}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                                    isActive
                                        ? 'bg-accent text-accent-foreground shadow-glow'
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                }`
                            }>
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </NavLink>
                    )
                })}
            </nav>

            <div className="mt-auto pt-6">
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive">
                    <LogOut className="h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    )
}
