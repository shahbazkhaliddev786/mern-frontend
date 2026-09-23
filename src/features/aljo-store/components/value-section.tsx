const principles = [
    {
        number: '01',
        title: 'Honest, Tactile Materials',
        subtitle: 'Raw textures that do not hide behind synthetics',
        description:
            'From unbleached organic linen and heavy-drape cotton to vegetable-tanned hides and raw stoneware, we choose materials that celebrate their natural irregularities and breathe with everyday living.',
        tint: 'bg-tile-lavender/70 border-tile-lavender'
    },
    {
        number: '02',
        title: 'Measured, Small Batches',
        subtitle: 'No warehouse deadstock, no artificial rush',
        description:
            'We work in modest, limited production editions alongside generational craftspeople. Making fewer pieces allows us to pay fair artisan wages and scrutinize every single seam before it leaves the workshop.',
        tint: 'bg-tile-mint/70 border-tile-mint'
    },
    {
        number: '03',
        title: 'Made to Soften & Age',
        subtitle: 'A quiet patina that deepens with years of use',
        description:
            'We reject disposable goods designed to fail after a season. An Aljo piece is built to soften, collect memories, and look more handsome after five hundred mornings of use than it did in the package.',
        tint: 'bg-tile-peach/70 border-tile-peach'
    }
]

export default function ValueSection() {
    return (
        <section className="container mx-auto px-4 lg:px-8 py-20 md:py-28">
            <div className="max-w-2xl mx-auto mb-14 md:mb-20 text-center">
                <span className="text-xs text-accent font-semibold tracking-widest uppercase mb-3 block">Our Craft Philosophy</span>
                <h2 className="font-display text-3xl md:text-5xl font-medium text-primary tracking-tight leading-[1.15]">
                    Three quiet principles that guide our hands.
                </h2>
                <p className="text-muted-foreground text-sm md:text-base mt-4 leading-relaxed">
                    We don’t produce to satisfy arbitrary seasonal quotas. Every single item exists because it solves an everyday need with elegance
                    and durability.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                {principles.map((item) => (
                    <div
                        key={item.number}
                        className={`rounded-[2rem] p-8 md:p-10 border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elegant flex flex-col justify-between ${item.tint}`}>
                        <div>
                            <div className="flex items-center justify-between mb-8">
                                <span className="font-display text-3xl md:text-4xl font-medium text-primary/40 tracking-wider">{item.number}</span>
                                <span className="h-2 w-2 rounded-full bg-accent/60" />
                            </div>

                            <h3 className="font-display text-xl md:text-2xl font-medium text-primary mb-2 leading-snug">{item.title}</h3>
                            <p className="text-xs uppercase tracking-wider text-accent font-semibold mb-4">{item.subtitle}</p>
                            <p className="text-foreground/75 text-sm leading-relaxed">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
