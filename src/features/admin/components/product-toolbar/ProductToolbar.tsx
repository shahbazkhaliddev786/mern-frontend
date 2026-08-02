import { Plus, Search } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import type { ProductSort } from '../../services/product.service'
import { useBrands, useCategories } from '@/shared/hooks/use-catalog'

interface ProductToolbarProps {
    search: string
    onSearchChange: (value: string) => void
    sort: ProductSort
    onSortChange: (value: ProductSort) => void
    category: string
    onCategoryChange: (value: string) => void
    brand: string
    onBrandChange: (value: string) => void
    onCreate: () => void
}

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' }
]

const controlClassName =
    'h-11 rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

export function ProductToolbar({
    search,
    onSearchChange,
    sort,
    onSortChange,
    category,
    onCategoryChange,
    brand,
    onBrandChange,
    onCreate
}: ProductToolbarProps) {
    const { data: categories = [] } = useCategories()
    const { data: brands = [] } = useBrands()

    return (
        <div className="flex flex-col gap-4 rounded-[2rem] border border-border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search products..."
                    value={search}
                    onChange={(event) => onSearchChange(event.target.value)}
                    className="h-11 rounded-xl bg-background pl-9"
                />
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <select
                    aria-label="Filter by category"
                    value={category}
                    onChange={(event) => onCategoryChange(event.target.value)}
                    className={controlClassName}>
                    <option value="">All categories</option>
                    {categories.map((item) => (
                        <option key={item._id} value={item._id}>
                            {item.name}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Filter by brand"
                    value={brand}
                    onChange={(event) => onBrandChange(event.target.value)}
                    className={controlClassName}>
                    <option value="">All brands</option>
                    {brands.map((item) => (
                        <option key={item._id} value={item._id}>
                            {item.name}
                        </option>
                    ))}
                </select>

                <select
                    aria-label="Sort products"
                    value={sort}
                    onChange={(event) => onSortChange(event.target.value as ProductSort)}
                    className={controlClassName}>
                    {SORT_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <Button className="rounded-xl" onClick={onCreate}>
                    <Plus className="h-4 w-4" />
                    Create Product
                </Button>
            </div>
        </div>
    )
}
