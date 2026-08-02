import { Button } from '@/shared/components/ui/button'
import { Link } from 'react-router-dom'

export default function PurposeSection() {
    return (
        <section className="relative overflow-hidden bg-primary text-primary-foreground py-20 md:py-28">
            <div
                className="pointer-events-none absolute -bottom-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
                aria-hidden="true"
            />
            <div className="container relative mx-auto px-4 text-center">
                <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4 leading-[1.1]">Crafted with Purpose</h2>
                <p className="text-primary-foreground/70 max-w-xl mx-auto mb-8 text-lg">
                    Every piece in our collection is thoughtfully designed with quality materials and sustainable practices.
                </p>
                <Button asChild variant="accent" size="lg" className="px-8">
                    <Link to="/about">Our Story</Link>
                </Button>
            </div>
        </section>
    )
}
