import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { useAppSelector } from '@/shared/store/hooks'
import type { Product } from '@/features/products/types'

interface CategoryEntry {
    id: string
    name: string
    image?: string
    count: number
}

/** Derive unique categories straight from the real product list — no invented data. */
function deriveCategories(products: Product[]): CategoryEntry[] {
    const map = new Map<string, CategoryEntry>()
    for (const p of products) {
        const cat = p.category
        if (!cat?._id) continue
        const existing = map.get(cat._id)
        if (existing) {
            existing.count += 1
            if (!existing.image && p.images?.[0]) existing.image = p.images[0]
        } else {
            map.set(cat._id, { id: cat._id, name: cat.name, image: p.images?.[0], count: 1 })
        }
    }
    return Array.from(map.values())
}

export default function ExploreCategorySection() {
    const { items: products } = useAppSelector((state) => state.products)
    const [search, setSearch] = useState('')
    const [activeId, setActiveId] = useState<string | null>(null)

    const categories = useMemo(() => deriveCategories(products), [products])

    const filtered = useMemo(() => categories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())), [categories, search])

    if (categories.length === 0) return null

    const activeIndex = Math.max(
        0,
        filtered.findIndex((c) => c.id === activeId)
    )
    const gridCategories = filtered.length > 0 ? filtered : categories

    return (
        <section className="bg-background py-16 md:py-24">
            <div className="container mx-auto px-4">
                <h2 className="text-center font-display text-3xl md:text-5xl font-semibold text-primary mb-12 md:mb-16">Explore by Category</h2>

                <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                    {/* Sidebar */}
                    <aside className="flex flex-col gap-4">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search"
                                className="w-full rounded-xl border border-border bg-muted/40 py-2.5 pl-9 pr-3 text-sm outline-none transition-colors focus:border-accent focus:bg-card"
                            />
                        </div>

                        <ul className="flex flex-col">
                            {filtered.map((cat, index) => {
                                const isActive = activeId ? cat.id === activeId : index === 0
                                return (
                                    <li key={cat.id}>
                                        <button
                                            onClick={() => setActiveId(cat.id)}
                                            className={`flex w-full items-center justify-between border-l-2 py-3 pl-4 pr-2 text-left text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'border-accent text-primary'
                                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                            }`}>
                                            <span>{cat.name}</span>
                                            <span className="text-xs text-muted-foreground/70">{cat.count}</span>
                                        </button>
                                    </li>
                                )
                            })}
                            {filtered.length === 0 && <li className="py-3 pl-4 text-sm text-muted-foreground">No categories found</li>}
                        </ul>

                        <Link
                            to="/products"
                            className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-soft transition-all hover:shadow-glow active:scale-[0.98]">
                            All Categories
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </aside>

                    {/* Category grid */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {gridCategories.map((cat, index) => {
                            const featured = index === activeIndex
                            return (
                                <Link
                                    key={cat.id}
                                    to="/products"
                                    onMouseEnter={() => setActiveId(cat.id)}
                                    className={`group relative overflow-hidden rounded-2xl shadow-soft transition-all duration-300 hover:shadow-elegant ${
                                        featured ? 'sm:col-span-2 sm:row-span-2 min-h-[260px]' : 'min-h-[180px]'
                                    }`}>
                                    {cat.image ? (
                                        <img
                                            src={cat.image}
                                            alt={cat.name}
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-secondary" />
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/5" />
                                    <div className="relative flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                                        <h3 className={`font-display font-semibold text-white ${featured ? 'text-3xl md:text-4xl' : 'text-xl'}`}>
                                            {cat.name}
                                        </h3>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-card/95 px-4 py-1.5 text-xs font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                            Explore
                                            <ArrowRight className="h-3 w-3" />
                                        </span>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
