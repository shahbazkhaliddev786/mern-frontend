import { useEffect, useState, type ReactNode } from 'react'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { MinusIcon, PlusIcon } from '@heroicons/react/20/solid'
import { Search } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks'
import { useCategories, useBrands } from '@/shared/hooks/use-catalog'
import { useDebounce } from '@/shared/hooks/use-debounce'
import { setSearchTerm, toggleCategory, toggleBrand, setPriceRange } from '../slices/products-slice'

interface FilterSectionProps {
    title: string
    defaultOpen?: boolean
    children: ReactNode
}

function FilterSection({ title, defaultOpen, children }: FilterSectionProps) {
    return (
        <Disclosure as="div" defaultOpen={defaultOpen} className="border-b border-border py-6">
            <h3 className="-my-3 flow-root">
                <DisclosureButton className="group flex w-full items-center justify-between py-3 text-sm text-muted-foreground hover:text-foreground">
                    <span className="font-medium text-foreground">{title}</span>
                    <span className="ml-6 flex items-center">
                        <PlusIcon aria-hidden="true" className="size-5 group-data-open:hidden" />
                        <MinusIcon aria-hidden="true" className="size-5 group-not-data-open:hidden" />
                    </span>
                </DisclosureButton>
            </h3>
            <DisclosurePanel className="pt-6">{children}</DisclosurePanel>
        </Disclosure>
    )
}

interface CheckboxListProps {
    items: { _id: string; name: string }[]
    selected: string[]
    onToggle: (id: string) => void
    isLoading: boolean
    emptyLabel: string
}

function CheckboxList({ items, selected, onToggle, isLoading, emptyLabel }: CheckboxListProps) {
    if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>
    if (items.length === 0) return <p className="text-sm text-muted-foreground">{emptyLabel}</p>

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <label key={item._id} className="flex cursor-pointer items-center gap-3">
                    <input
                        type="checkbox"
                        checked={selected.includes(item._id)}
                        onChange={() => onToggle(item._id)}
                        className="size-4 rounded border-border accent-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                </label>
            ))}
        </div>
    )
}

/**
 * Presentational filter controls (search, category, brand, price) shared by the
 * mobile filter dialog and the desktop sidebar. Reads the current selection from
 * the products slice and dispatches filter actions; search and price are debounced.
 */
export default function ProductFiltersPanel() {
    const dispatch = useAppDispatch()
    const { searchTerm, selectedCategories, selectedBrands, minPrice, maxPrice } = useAppSelector((state) => state.products)
    const { data: categories = [], isLoading: categoriesLoading } = useCategories()
    const { data: brands = [], isLoading: brandsLoading } = useBrands()

    // --- Search (debounced) ---
    const [search, setSearch] = useState(searchTerm)
    const debouncedSearch = useDebounce(search, 400)
    useEffect(() => {
        if (debouncedSearch !== searchTerm) dispatch(setSearchTerm(debouncedSearch))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch])
    // Mirror external resets (e.g. "Clear all") back into the local input.
    useEffect(() => {
        if (searchTerm === '') setSearch('')
    }, [searchTerm])

    // --- Price range (debounced) ---
    const [min, setMin] = useState(minPrice != null ? String(minPrice) : '')
    const [max, setMax] = useState(maxPrice != null ? String(maxPrice) : '')
    const debouncedMin = useDebounce(min, 500)
    const debouncedMax = useDebounce(max, 500)
    useEffect(() => {
        const parse = (v: string) => {
            const n = Number(v)
            return v.trim() === '' || Number.isNaN(n) ? null : n
        }
        const nextMin = parse(debouncedMin)
        const nextMax = parse(debouncedMax)
        if (nextMin !== minPrice || nextMax !== maxPrice) dispatch(setPriceRange({ min: nextMin, max: nextMax }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedMin, debouncedMax])
    useEffect(() => {
        if (minPrice === null) setMin('')
    }, [minPrice])
    useEffect(() => {
        if (maxPrice === null) setMax('')
    }, [maxPrice])

    const priceInputClass =
        'w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-accent'

    return (
        <div>
            {/* Search */}
            <div className="border-b border-border py-6">
                <label htmlFor="product-search" className="sr-only">
                    Search products
                </label>
                <div className="relative">
                    <Search
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                        id="product-search"
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full rounded-md border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-accent"
                    />
                </div>
            </div>

            <FilterSection title="Category" defaultOpen>
                <CheckboxList
                    items={categories}
                    selected={selectedCategories}
                    onToggle={(id) => dispatch(toggleCategory(id))}
                    isLoading={categoriesLoading}
                    emptyLabel="No categories found"
                />
            </FilterSection>

            <FilterSection title="Brand" defaultOpen>
                <CheckboxList
                    items={brands}
                    selected={selectedBrands}
                    onToggle={(id) => dispatch(toggleBrand(id))}
                    isLoading={brandsLoading}
                    emptyLabel="No brands found"
                />
            </FilterSection>

            <FilterSection title="Price" defaultOpen>
                <div className="flex items-center gap-2">
                    <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={min}
                        onChange={(e) => setMin(e.target.value)}
                        placeholder="Min"
                        aria-label="Minimum price"
                        className={priceInputClass}
                    />
                    <span className="text-muted-foreground">–</span>
                    <input
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={max}
                        onChange={(e) => setMax(e.target.value)}
                        placeholder="Max"
                        aria-label="Maximum price"
                        className={priceInputClass}
                    />
                </div>
            </FilterSection>
        </div>
    )
}
