import { Link } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function MissionSection() {
    return (
        <section className="bg-band-mint/60 py-20 md:py-28">
            <div className="container mx-auto px-4 max-w-3xl text-center">
                <span className="text-xs text-accent font-semibold tracking-widest uppercase mb-3 block">A Personal Note</span>

                <h2 className="font-display text-3xl md:text-4.5xl font-medium text-primary mb-6 leading-tight">
                    From our studio table to your everyday rituals.
                </h2>

                <div className="space-y-4 text-foreground/80 text-base md:text-lg leading-relaxed font-normal">
                    <p>
                        When we package a piece to send to your home, we think about where it will live: the coat hooks it will hang from, the bedside
                        table it will rest upon, the slow weekend mornings it will accompany.
                    </p>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Thank you for choosing objects made with patience over convenience. You make it possible for independent ateliers and
                        traditional craft to thrive in an era of mass speed.
                    </p>
                </div>

                {/* Founder Sign-off */}
                <div className="mt-8 pt-6 border-t border-primary/10 inline-block">
                    <p className="font-display italic text-lg md:text-xl text-primary font-medium">Warmly,</p>
                    <p className="font-display text-sm tracking-wide text-primary/70 mt-0.5">Shahbaz & The Aljo Studio Family</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild variant="accent" size="lg" className="px-8 rounded-xl shadow-soft hover:shadow-glow group/cta">
                        <Link to="/products">
                            Explore the Collection
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        size="lg"
                        className="group/say px-6 rounded-xl bg-card border-primary/25 text-primary shadow-soft hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 cursor-pointer">
                        <Link to="/contact" className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary group-hover/say:text-primary-foreground transition-colors" />
                            <span>Say Hello</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
