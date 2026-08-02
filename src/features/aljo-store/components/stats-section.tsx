const stats = [
    { number: '50+', label: 'Artisan Partners' },
    { number: '10K+', label: 'Happy Customers' },
    { number: '200+', label: 'Products' },
    { number: '15', label: 'Countries Shipped' }
]

export default function StatsSection() {
    return (
        <section className="relative overflow-hidden bg-primary text-primary-foreground py-16 md:py-20">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
            <div className="container relative mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4">
                    {stats.map((stat, index) => (
                        <div
                            key={stat.label}
                            className={`px-4 py-4 text-center md:py-0 ${
                                index < stats.length - 1 ? 'md:border-r md:border-primary-foreground/15' : ''
                            }`}>
                            <p className="font-display text-3xl md:text-5xl font-semibold text-accent">{stat.number}</p>
                            <p className="text-primary-foreground/70 text-sm mt-2 uppercase tracking-wider">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
