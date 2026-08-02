import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Star, Trash2 } from 'lucide-react'
import { useAppSelector } from '@/shared/store/hooks'
import { useAddToCart } from '@/features/products/hooks/useAddToCart'
import { useRemoveFromCart } from '@/features/products/hooks/useRemoveFromCart'
import { useIsInCart } from '@/features/products/hooks/useIsInCart'

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`} />
            ))}
        </div>
    )
}

export default function SpecialPackageSection() {
    const { items: products } = useAppSelector((state) => state.products)
    const [expanded, setExpanded] = useState(false)

    const addToCart = useAddToCart()
    const removeFromCart = useRemoveFromCart()

    // Feature the most expensive in-stock product as the "special package"
    const featured = [...products].filter((p) => p.stock > 0).sort((a, b) => b.price - a.price)[0] ?? products[0]
    const isInCart = useIsInCart(featured?._id ?? '')

    if (!featured) return null

    const related = products.filter((p) => p._id !== featured._id).slice(0, 3)
    const isPending = addToCart.isPending || removeFromCart.isPending

    return (
        <section className="bg-background py-16 md:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-center font-display text-3xl md:text-5xl font-semibold text-primary mb-12 md:mb-16">Special Package</h2>

                <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
                    {/* Featured product */}
                    <div>
                        <div className="relative overflow-hidden rounded-3xl bg-secondary shadow-elegant">
                            <img src={featured.images[0]} alt={featured.name} className="aspect-[4/3] w-full object-cover" />
                        </div>
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h3 className="font-display text-2xl font-semibold text-primary">{featured.name}</h3>
                                <div className="mt-2 flex items-center gap-3">
                                    <Stars rating={featured.rating ?? 0} />
                                    <span className="text-sm text-muted-foreground">({featured.reviews ?? 0})</span>
                                </div>
                                <p className="mt-3 font-display text-2xl font-bold text-primary">${featured.price.toFixed(2)}</p>
                            </div>
                            <button
                                onClick={() =>
                                    isInCart ? removeFromCart.mutate(featured._id) : addToCart.mutate({ productId: featured._id, quantity: 1 })
                                }
                                disabled={isPending}
                                className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold shadow-soft transition-all active:scale-[0.98] disabled:opacity-50 ${
                                    isInCart
                                        ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                                        : 'bg-accent text-accent-foreground hover:shadow-glow'
                                }`}>
                                {isInCart ? <Trash2 className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
                                {isInCart ? 'Remove' : 'Add to cart'}
                            </button>
                        </div>
                    </div>

                    {/* Description + related */}
                    <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-soft">
                        <h4 className="font-semibold text-primary">Description</h4>
                        <p className={`mt-3 text-sm leading-relaxed text-muted-foreground ${expanded ? '' : 'line-clamp-3'}`}>
                            {featured.description}
                        </p>
                        {featured.description && featured.description.length > 140 && (
                            <button onClick={() => setExpanded((v) => !v)} className="mt-2 text-sm font-medium text-accent hover:underline">
                                {expanded ? 'See Less' : 'See More'}
                            </button>
                        )}

                        {related.length > 0 && (
                            <div className="mt-6 space-y-3 border-t border-border pt-6">
                                {related.map((p) => (
                                    <Link
                                        key={p._id}
                                        to={`/products/${p._id}`}
                                        className="flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-secondary/60">
                                        <img src={p.images[0]} alt={p.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium text-primary">{p.name}</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <Stars rating={p.rating ?? 0} />
                                            </div>
                                        </div>
                                        <span className="shrink-0 font-semibold text-primary">${p.price}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
