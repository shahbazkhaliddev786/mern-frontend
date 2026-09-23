import { Quote } from 'lucide-react'

export default function StatsSection() {
    return (
        <section className="relative overflow-hidden bg-primary text-primary-foreground py-20 md:py-28">
            {/* Fine accent top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />

            <div className="container relative mx-auto px-4 lg:px-8 max-w-4xl text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 text-accent mb-8 shadow-inner">
                    <Quote className="w-5 h-5 text-accent-foreground" />
                </div>

                <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-4.5xl font-normal leading-[1.3] text-primary-foreground tracking-tight">
                    “We measure our work not by how many pieces we produce, but by how many are still cherished, repaired, and lived in five years
                    from now.”
                </blockquote>

                <p className="mt-6 text-xs uppercase tracking-widest text-accent font-medium">The Aljo Workshop Manifesto</p>

                {/* Grounded Studio Commitments */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-14 mt-14 border-t border-primary-foreground/15 text-left">
                    <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider block">Zero Plastic Packaging</span>
                        <p className="text-xs text-primary-foreground/75 leading-relaxed">
                            Orders arrive wrapped in unbleached recycled kraft paper and tied with natural compostable twine.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider block">Generational Ateliers</span>
                        <p className="text-xs text-primary-foreground/75 leading-relaxed">
                            We partner exclusively with independent workshops that uphold fair living wages and traditional techniques.
                        </p>
                    </div>

                    <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-accent uppercase tracking-wider block">Direct & Transparent</span>
                        <p className="text-xs text-primary-foreground/75 leading-relaxed">
                            No artificial department store markups or manufactured artificial scarcity. Honest pricing year-round.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}
