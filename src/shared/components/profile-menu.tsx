import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks'
import { logout } from '@/features/authentication/slices/auth-slice'
import { LayoutDashboard, LogOut, User } from 'lucide-react'
import { Avatar } from './ui/avatar'
import { clsx } from 'clsx'

export function ProfileMenu() {
    const dispatch = useAppDispatch()
    const { user } = useAppSelector((state) => state.auth)

    return (
        <Menu as="div" className="relative inline-block text-left hidden sm:block">
            <Menu.Button className="flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all hover:opacity-80">
                <span className="sr-only">Open user menu</span>
                <Avatar src={user?.profile} alt={user?.name || 'User Profile'} />
            </Menu.Button>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-border rounded-xl bg-card shadow-elegant ring-1 ring-border focus:outline-none overflow-hidden">
                    <div className="px-4 py-3">
                        <p className="text-sm font-medium text-foreground truncate">{user?.name || 'My Account'}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email || 'Logged in'}</p>
                    </div>

                    <div className="p-1">
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    to="/dashboard"
                                    className={clsx(
                                        active ? 'bg-secondary text-foreground' : 'text-muted-foreground',
                                        'group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors'
                                    )}>
                                    <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Dashboard
                                </Link>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <Link
                                    to="/profile"
                                    className={clsx(
                                        active ? 'bg-secondary text-foreground' : 'text-muted-foreground',
                                        'group flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors'
                                    )}>
                                    <User className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Profile
                                </Link>
                            )}
                        </Menu.Item>
                    </div>

                    <div className="p-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={() => dispatch(logout())}
                                    className={clsx(
                                        active ? 'bg-destructive/10 text-destructive' : 'text-foreground hover:text-destructive',
                                        'group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
                                    )}>
                                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                                    Logout
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    )
}
