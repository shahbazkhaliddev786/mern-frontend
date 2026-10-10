import { Link } from 'react-router-dom'
import { Facebook, Instagram, Linkedin, Twitter, Mail, MapPin, Phone } from 'lucide-react'
import { STORE_CONTACT } from '@/shared/config/store'

const columns = [
    {
        heading: 'My Account',
        links: [
            { label: 'Sign In', to: '/login' },
            { label: 'Register', to: '/signup' },
            { label: 'My Orders', to: '/dashboard' },
            { label: 'Profile', to: '/profile' }
        ]
    },
    {
        heading: 'Help',
        links: [
            { label: 'Contact Us', to: '/contact' },
            { label: 'Our Story', to: '/about' }
        ]
    },
    {
        heading: 'Shop',
        links: [
            { label: 'All Products', to: '/products' },
            { label: 'New Arrivals', to: '/products' },
            { label: 'Best Sellers', to: '/products' },
            { label: 'Your Cart', to: '/cart' }
        ]
    }
]

const socials = [
    { icon: Facebook, label: 'Facebook' },
    { icon: Instagram, label: 'Instagram' },
    { icon: Linkedin, label: 'LinkedIn' },
    { icon: Twitter, label: 'Twitter' }
]

export default function Footer() {
    return (
        <footer className="border-t border-border bg-secondary/40">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-2 gap-10 md:grid-cols-4 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="col-span-2 lg:col-span-2">
                        <Link to="/" className="font-display text-2xl font-semibold text-primary">
                            Aljo Store
                        </Link>
                        <div className="mt-4 flex gap-3">
                            {socials.map(({ icon: Icon, label }) => (
                                <a
                                    key={label}
                                    href="#"
                                    aria-label={label}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-accent hover:bg-accent hover:text-accent-foreground">
                                    <Icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                        <div className="mt-6 space-y-2 text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground">Contact</p>
                            <p className="flex items-center gap-2">
                                <Mail className="h-4 w-4 shrink-0" /> {STORE_CONTACT.email}
                            </p>
                            <p className="flex items-center gap-2">
                                <Phone className="h-4 w-4 shrink-0" /> {STORE_CONTACT.phone}
                            </p>
                            <p className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 shrink-0" /> {STORE_CONTACT.address}
                            </p>
                        </div>
                    </div>

                    {/* Link columns */}
                    {columns.map((col) => (
                        <div key={col.heading}>
                            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary">{col.heading}</h4>
                            <ul className="space-y-3 text-sm text-muted-foreground">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        <Link to={link.to} className="transition-colors hover:text-accent">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
                    © 2026 Aljo Store. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
