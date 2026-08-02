import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import hero1 from '@/shared/assets/images/hero-1.jpg'
import hero2 from '@/shared/assets/images/hero-2.jpg'
import hero3 from '@/shared/assets/images/hero-3.jpg'

const slides = [
    {
        image: hero1,
        title: 'New Season Collection',
        subtitle: 'Discover timeless pieces crafted for modern living',
        cta: 'Shop Now',
        link: '/products'
    },
    {
        image: hero2,
        title: 'Luxury Accessories',
        subtitle: 'Elevate your everyday with curated essentials',
        cta: 'Explore',
        link: '/products'
    },
    {
        image: hero3,
        title: 'Summer Arrivals',
        subtitle: 'Fresh styles for the warmer days ahead',
        cta: 'Discover',
        link: '/products'
    }
]

export default function HeroCarousel() {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <section className="relative h-[70vh] md:h-[85vh] overflow-hidden bg-primary rounded-b-[2rem] md:rounded-b-[3rem]">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-out ${
                        index === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}>
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className={`w-full h-full object-cover transition-transform duration-[6000ms] ease-out ${
                            index === current ? 'scale-110' : 'scale-100'
                        }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-center">
                        <div className="container mx-auto px-4">
                            <div className="max-w-lg">
                                <span className="inline-block text-accent text-xs md:text-sm font-semibold uppercase tracking-[0.2em] mb-4 animate-fade-in">
                                    Aljo Store
                                </span>
                                <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white mb-4 animate-fade-in leading-[1.05]">
                                    {slide.title}
                                </h1>
                                <p className="text-white/85 text-lg md:text-xl mb-8 animate-slide-up max-w-md">{slide.subtitle}</p>
                                <Button asChild variant="accent" size="lg" className="text-base px-8 animate-slide-up group/cta">
                                    <Link to={slide.link}>
                                        {slide.cta}
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        aria-label={`Go to slide ${index + 1}`}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                            index === current ? 'bg-accent w-10' : 'bg-white/50 w-4 hover:bg-white/80'
                        }`}
                    />
                ))}
            </div>
        </section>
    )
}
