import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { AdminSidebar } from '../sidebar/AdminSidebar'
import { Button } from '@/shared/components/ui/button'
import { useAppSelector } from '@/shared/store/hooks'

export function AdminLayout() {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
    const { user } = useAppSelector((state) => state.auth)

    return (
        <div className="flex min-h-screen bg-muted/20">
            {/* Desktop Sidebar */}
            <aside className="hidden w-72 flex-shrink-0 lg:block">
                <div className="fixed inset-y-0 w-72">
                    <AdminSidebar />
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
            )}

            {/* Mobile Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:hidden ${
                    isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <AdminSidebar onClose={() => setIsMobileSidebarOpen(false)} />
            </aside>

            {/* Main Content */}
            <main className="flex w-full flex-col lg:pl-0">
                {/* Top Navbar */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-md">
                    <div className="flex items-center gap-4 lg:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileSidebarOpen(true)} className="text-foreground">
                            <Menu className="h-6 w-6" />
                        </Button>
                        <h2 className="font-display text-xl font-bold tracking-tight text-primary">ALJO Admin</h2>
                    </div>

                    <div className="hidden lg:block">{/* Can add page context title here if needed */}</div>

                    <div className="flex items-center gap-4 ml-auto">
                        <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">Welcome, {user?.name || 'Admin'}</span>
                        {user?.profile ? (
                            <img src={user.profile} alt="Profile" className="h-10 w-10 rounded-full border border-border object-cover" />
                        ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent font-bold border border-accent/20">
                                {user?.name?.charAt(0).toUpperCase() || 'A'}
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Content Container */}
                <div className="flex-1 p-6 md:p-8 xl:p-12">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
