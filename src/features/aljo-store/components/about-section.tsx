import heroAbout from '@/shared/assets/images/hero-3.jpg'

export default function AboutSection() {
    return (
        <section className="relative overflow-hidden bg-background pt-16 md:pt-24">
            <div
                className="pointer-events-none absolute -top-24 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-3xl"
                aria-hidden="true"
            />
            <div className="container relative mx-auto px-4 text-center">
                <span className="inline-block rounded-full bg-accent/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-5">
                    Our Story
                </span>
                <h1 className="font-display text-4xl md:text-6xl font-semibold text-primary mb-6 leading-[1.1]">Made with Intention</h1>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
                    Founded in 2020, Aljo Store was born from a belief that everyday essentials should be both beautiful and responsibly made. We
                    partner with artisans and ethical manufacturers to bring you pieces that stand the test of time.
                </p>
            </div>

            <div className="container relative mx-auto px-4 mt-12 md:mt-16">
                <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] shadow-elegant">
                    <img src={heroAbout} alt="Inside the Aljo Store studio" className="h-[280px] w-full object-cover md:h-[440px]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 flex flex-wrap items-center gap-x-8 gap-y-2 text-white md:bottom-8 md:left-8">
                        <p className="font-display text-lg md:text-xl">Crafted for modern living</p>
                        <p className="text-sm text-white/80">Ethically sourced · Thoughtfully designed</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
