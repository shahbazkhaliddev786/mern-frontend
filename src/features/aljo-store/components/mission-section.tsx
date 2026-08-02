import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function MissionSection() {
    return (
        <section className="bg-band-mint py-20 md:py-28">
            <div className="container mx-auto px-4 text-center">
                <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-3">Our Mission</p>
                <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary mb-6 leading-[1.1]">Fashion With Responsibility</h2>
                <p className="text-primary/70 text-lg max-w-3xl mx-auto leading-relaxed">
                    To create a world where fashion and responsibility coexist. We believe that what you wear should reflect not just your style, but
                    your values. Every purchase supports fair wages, sustainable practices, and timeless craftsmanship.
                </p>
                <Button asChild variant="accent" size="lg" className="mt-8 px-8 group/cta">
                    <Link to="/products">
                        Shop the Collection
                        <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                    </Link>
                </Button>
            </div>
        </section>
    )
}
