import { Heart, Leaf, Users } from 'lucide-react'

const values = [
    {
        icon: Heart,
        title: 'Quality First',
        description: 'Every product is crafted with the finest materials and meticulous attention to detail.',
        tint: 'bg-tile-lavender'
    },
    {
        icon: Leaf,
        title: 'Sustainability',
        description: "We're committed to ethical sourcing and reducing our environmental footprint.",
        tint: 'bg-tile-mint'
    },
    {
        icon: Users,
        title: 'Community',
        description: 'Building meaningful connections with our customers, artisans, and partners worldwide.',
        tint: 'bg-tile-peach'
    }
]

export default function ValueSection() {
    return (
        <section className="container mx-auto px-4 py-20 md:py-28">
            <div className="mb-12 text-center md:mb-16">
                <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-3">What We Stand For</p>
                <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary leading-[1.1]">Our Values</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                {values.map((value) => (
                    <div
                        key={value.title}
                        className={`rounded-3xl p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant ${value.tint}`}>
                        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-card shadow-soft">
                            <value.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-display text-xl font-semibold text-primary mb-3">{value.title}</h3>
                        <p className="text-primary/70 leading-relaxed">{value.description}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
