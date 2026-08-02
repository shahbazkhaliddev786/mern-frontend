import { Quote } from 'lucide-react'
import hero1 from '@/shared/assets/images/hero-1.jpg'

export default function TestimonialsSection() {
    return (
        <section className="bg-background py-16 md:py-24">
            <div className="container mx-auto px-4">
                <div className="text-center">
                    <h2 className="font-display text-3xl md:text-5xl font-semibold text-primary">Testimonials</h2>
                    <p className="mt-3 text-muted-foreground">Over 15,000 happy customers.</p>
                </div>

                <div className="mx-auto mt-12 grid max-w-4xl items-center gap-8 md:grid-cols-[220px_1fr]">
                    <div className="relative mx-auto">
                        <Quote className="absolute -left-4 -top-4 h-12 w-12 fill-accent/20 text-accent/30" />
                        <img src={hero1} alt="Happy customer" className="h-52 w-52 rounded-3xl object-cover shadow-elegant" loading="lazy" />
                    </div>
                    <figure>
                        <blockquote className="font-display text-xl leading-relaxed text-primary md:text-2xl">
                            “My experience with Aljo Store has been a complete success — from customer service to the wide range of products, a clean
                            store, and a smooth purchasing experience. Thank you.”
                        </blockquote>
                        <figcaption className="mt-6">
                            <p className="font-semibold text-primary">Leona Paul</p>
                            <p className="text-sm text-muted-foreground">CEO of Floatcom</p>
                        </figcaption>
                    </figure>
                </div>
            </div>
        </section>
    )
}
