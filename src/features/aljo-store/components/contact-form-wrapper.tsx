import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import { ContactForm } from './contact'

const contactDetails = [
    { icon: Mail, label: 'Email', value: 'hello@aljostore.com', tint: 'bg-tile-lavender' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 234-5678', tint: 'bg-tile-mint' },
    { icon: MapPin, label: 'Studio', value: '123 Fifth Avenue, New York, NY', tint: 'bg-tile-blue' },
    { icon: Clock, label: 'Hours', value: 'Mon – Fri, 9am – 6pm EST', tint: 'bg-tile-peach' }
]

export default function ContactFormWrapper() {
    return (
        <section className="bg-background py-16 sm:py-24">
            <div className="container mx-auto px-4 text-center mb-14">
                <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-5">
                    Get In Touch
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-semibold text-primary mb-4">We'd Love to Hear From You</h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
                    Questions, feedback, or just want to say hello? Our team typically responds within one business day.
                </p>
            </div>

            <div className="container mx-auto px-4 grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start max-w-5xl">
                {/* Contact detail tiles */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {contactDetails.map(({ icon: Icon, label, value, tint }) => (
                        <div
                            key={label}
                            className={`flex flex-col gap-3 rounded-2xl p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant ${tint}`}>
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-card shadow-soft">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-wider text-primary/60">{label}</p>
                                <p className="mt-1 font-medium text-primary">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className="w-full">
                    <ContactForm />
                </div>
            </div>
        </section>
    )
}
