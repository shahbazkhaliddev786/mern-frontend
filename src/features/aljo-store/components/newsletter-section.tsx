import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import hero2 from '@/shared/assets/images/hero-2.jpg'

export default function NewsletterSection() {
    const [email, setEmail] = useState('')

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            toast.error('Please enter a valid email address.')
            return
        }
        toast.success('Subscribed!', {
            description: "You'll be the first to hear about new arrivals and deals.",
            position: 'bottom-right'
        })
        setEmail('')
    }

    return (
        <section className="bg-background py-12 md:py-20">
            <div className="container mx-auto px-4">
                <div className="grid overflow-hidden rounded-[2rem] shadow-elegant md:grid-cols-2">
                    <div className="relative min-h-[220px]">
                        <img src={hero2} alt="Newsletter" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    </div>
                    <div className="bg-band-mint p-8 md:p-12">
                        <h2 className="font-display text-3xl md:text-4xl font-semibold leading-tight text-primary">
                            Join Our
                            <br />
                            Newsletter
                        </h2>
                        <p className="mt-3 text-sm text-primary/70">Receive exclusive deals, discounts and many other offers.</p>
                        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full rounded-xl border border-transparent bg-card px-4 py-3 text-sm outline-none transition-colors focus:border-accent"
                            />
                            <button
                                type="submit"
                                className="shrink-0 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition-all hover:shadow-glow active:scale-[0.98]">
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    )
}
