import { Link } from 'react-router-dom'
import { ArrowRight, Star } from 'lucide-react'
import { useAppSelector } from '@/shared/store/hooks'

const TILES = ['bg-tile-mint', 'bg-tile-blue', 'bg-tile-lavender', 'bg-tile-peach']

export default function PopularProductsSection() {
    const { items: products } = useAppSelector((state) => state.products)

    if (products.length === 0) return null

    const popular = products.slice(0, 8)

    return (
        <section className="bg-background py-16 md:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-center font-display text-3xl md:text-5xl font-semibold text-primary mb-12 md:mb-16">Popular Products</h2>

                <div className="grid grid-cols-2 gap-5 md:gap-6 lg:grid-cols-4">
                    {popular.map((product, index) => (
                        <Link
                            key={product._id}
                            to={`/products/${product._id}`}
                            className={`group flex flex-col rounded-3xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant ${
                                TILES[index % TILES.length]
                            }`}>
                            <div className="mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-2xl">
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    loading="lazy"
                                />
                            </div>
                            <div className="mt-auto space-y-1">
                                <div className="flex items-center justify-between gap-2">
                                    <h3 className="truncate font-semibold text-primary">{product.name}</h3>
                                    {(product.rating ?? 0) > 0 && (
                                        <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-primary/70">
                                            <Star className="h-3 w-3 fill-gold text-gold" />
                                            {(product.rating ?? 0).toFixed(1)}
                                        </span>
                                    )}
                                </div>
                                <p className="truncate text-xs uppercase tracking-wider text-primary/60">{product.category.name}</p>
                                <p className="pt-1 text-lg font-bold text-primary">${product.price}</p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 flex justify-center">
                    <Link
                        to="/products"
                        className="group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition-all hover:shadow-glow active:scale-[0.98]">
                        Explore all items
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
