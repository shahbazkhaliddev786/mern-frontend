import heroStudio from '@/shared/assets/images/hero-3.jpg'
import heroCraft from '@/shared/assets/images/hero-2.jpg'
import { Sparkle, Compass } from 'lucide-react'

export default function AboutSection() {
    return (
        <section className="relative overflow-hidden bg-background pt-12 pb-16 md:pt-20 md:pb-24">
            <div className="container mx-auto px-4 lg:px-8">
                {/* Asymmetric Editorial Header Grid */}
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    {/* Left Column: Narrative Manifesto */}
                    <div className="lg:col-span-6 space-y-6 lg:space-y-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-primary text-xs font-medium tracking-widest uppercase">
                            <Compass className="w-3.5 h-3.5 text-accent" />
                            <span>Est. 2020 · The Aljo Studio</span>
                        </div>

                        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium text-primary tracking-tight leading-[1.12]">
                            Slow goods, crafted for deliberate living.
                        </h1>

                        <div className="space-y-4 text-foreground/80 text-base md:text-lg leading-relaxed font-normal">
                            <p>
                                We began Aljo Store with a simple, quiet rebellion against the disposable. In a world rushing toward trend cycles, we
                                chose the long road: obsessing over stitch density, the drape of unbleached fibers, and the honest patina of raw
                                materials.
                            </p>
                            <p className="text-muted-foreground text-sm md:text-base">
                                We work hand-in-hand with independent weavers, ceramicists, and generational makers. Every piece in our catalog exists
                                because someone poured genuine human care into its shape, balance, and purpose.
                            </p>
                        </div>

                        {/* Subtle Editorial Provenance Footer */}
                        <div className="pt-4 border-t border-border/80 flex flex-wrap items-center gap-y-3 gap-x-8 text-xs text-muted-foreground">
                            <div>
                                <span className="block font-semibold text-foreground">Provenance</span>
                                Generational Workshops
                            </div>
                            <div className="h-6 w-px bg-border/80 hidden sm:block" />
                            <div>
                                <span className="block font-semibold text-foreground">Philosophy</span>
                                Measured Batches Only
                            </div>
                            <div className="h-6 w-px bg-border/80 hidden sm:block" />
                            <div>
                                <span className="block font-semibold text-foreground">Packaging</span>
                                100% Recycled Kraft & Twine
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Layered Editorial Photographic Composition */}
                    <div className="lg:col-span-6 relative">
                        {/* Main Studio Frame */}
                        <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-secondary shadow-elegant aspect-[4/5] sm:aspect-[4/4] lg:aspect-[4/5] max-h-[560px] w-full">
                            <img
                                src={heroStudio}
                                alt="Inside the Aljo studio workshop"
                                className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                            <div className="absolute bottom-6 left-6 right-6 text-white">
                                <p className="font-display text-lg md:text-xl font-medium leading-snug">The Morning Light in Our Workshop</p>
                                <p className="text-xs text-white/80 mt-1">Where ideas take physical form through sketches and test swatches</p>
                            </div>
                        </div>

                        {/* Overlapping Inset Detail Card */}
                        <div className="hidden sm:block absolute -bottom-8 -left-8 md:-left-10 w-48 md:w-56 overflow-hidden rounded-2xl bg-card border-4 border-background shadow-lifted">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img src={heroCraft} alt="Detailed close-up of materials and craft" className="w-full h-full object-cover" />
                            </div>
                            <div className="p-3 bg-card">
                                <div className="flex items-center gap-1.5 text-accent text-[11px] font-semibold uppercase tracking-wider">
                                    <Sparkle className="w-3 h-3" />
                                    <span>Material Detail</span>
                                </div>
                                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                                    Natural fibers and untreated finishes that age gracefully.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
