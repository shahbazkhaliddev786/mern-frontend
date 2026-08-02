import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAppSelector } from '@/shared/store/hooks'

export default function OurCreationSection() {
    const { items: products } = useAppSelector((state) => state.products)

    // Use real product imagery for the showcase strip
    const showcase = products.slice(0, 4)

    return (
        <section className="bg-background py-12 md:py-16">
            <div className="container mx-auto px-4">
                <div className="grid gap-5 md:grid-cols-[minmax(0,340px)_1fr]">
                    {/* Promo card */}
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl bg-primary p-8 text-primary-foreground shadow-elegant">
                        <div
                            className="pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl"
                            aria-hidden="true"
                        />
                        <div className="relative">
                            <h3 className="font-display text-3xl font-semibold leading-tight">
                                Our
                                <br />
                                Own Creation
                            </h3>
                            <p className="mt-3 text-sm text-primary-foreground/70">Designed in our studio, made to last.</p>
                        </div>
                        <Link
                            to="/products"
                            className="relative mt-8 inline-flex w-fit items-center gap-2 text-sm font-semibold text-primary-foreground transition-colors hover:text-accent">
                            More
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {/* Showcase strip */}
                    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                        {showcase.map((p, i) => (
                            <Link
                                key={p._id}
                                to={`/products/${p._id}`}
                                className={`group relative overflow-hidden rounded-3xl shadow-soft transition-all duration-300 hover:shadow-elegant ${
                                    i === 0 ? 'col-span-2 sm:col-span-1' : ''
                                }`}>
                                <img
                                    src={p.images[0]}
                                    alt={p.name}
                                    className="h-full min-h-[180px] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                                <span className="absolute bottom-3 left-3 right-3 truncate text-sm font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    {p.name}
                                </span>
                            </Link>
                        ))}
                        {showcase.length > 0 && (
                            <Link
                                to="/products"
                                className="flex min-h-[180px] items-center justify-center rounded-3xl border border-dashed border-border bg-secondary/40 p-6 text-center transition-colors hover:border-accent hover:bg-secondary/70">
                                <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                                    Explore All Rooms
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
