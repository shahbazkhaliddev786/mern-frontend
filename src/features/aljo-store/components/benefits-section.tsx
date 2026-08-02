import { CreditCard, RotateCcw, Headphones } from 'lucide-react'

const benefits = [
    {
        icon: CreditCard,
        title: 'Payment Method',
        description: 'We offer flexible payment options, to make it easier.',
        tint: 'bg-tile-lavender'
    },
    {
        icon: RotateCcw,
        title: 'Return Policy',
        description: 'You can return any product within 30 days.',
        tint: 'bg-tile-peach'
    },
    {
        icon: Headphones,
        title: 'Customer Support',
        description: 'Our customer support is available 24/7.',
        tint: 'bg-tile-mint'
    }
]

export default function BenefitsSection() {
    return (
        <section className="bg-band-blue py-16 md:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-center font-display text-3xl md:text-5xl font-semibold text-primary mb-12 md:mb-16">
                    Benefits for your expediency
                </h2>

                <div className="grid gap-10 md:grid-cols-3">
                    {benefits.map(({ icon: Icon, title, description, tint }) => (
                        <div key={title} className="flex flex-col items-center text-center">
                            <div className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${tint} shadow-soft`}>
                                <Icon className="h-7 w-7 text-primary" />
                            </div>
                            <h3 className="font-display text-xl font-semibold text-primary">{title}</h3>
                            <p className="mt-2 max-w-xs text-sm leading-relaxed text-primary/70">{description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
