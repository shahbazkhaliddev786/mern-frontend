import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, FunnelIcon, Squares2X2Icon } from '@heroicons/react/20/solid'

// Project Imports
import ProductsList from '@/features/products/components/products-list'
import ProductFiltersPanel from '@/features/products/components/product-filters-panel'
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks'
import { setSort, resetFilters, type SortOption } from '../slices/products-slice'
import { cn } from '@/shared/lib/utils'

const sortOptions: { label: string; value: SortOption }[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Price: Low to High', value: 'price_low' },
    { label: 'Price: High to Low', value: 'price_high' }
]

export default function ProductsFilter() {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
    const dispatch = useAppDispatch()
    const { sort, searchTerm, selectedCategories, selectedBrands, minPrice, maxPrice } = useAppSelector((state) => state.products)

    const hasActiveFilters =
        searchTerm !== '' || selectedCategories.length > 0 || selectedBrands.length > 0 || minPrice != null || maxPrice != null || sort !== 'newest'

    return (
        <div className="bg-background">
            <div>
                {/* Mobile filter dialog */}
                <Dialog open={mobileFiltersOpen} onClose={setMobileFiltersOpen} className="relative z-40 lg:hidden">
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity duration-300 ease-linear data-closed:opacity-0"
                    />

                    <div className="fixed inset-0 z-40 flex">
                        <DialogPanel
                            transition
                            className="relative ml-auto flex size-full max-w-xs transform flex-col overflow-y-auto bg-card pt-4 pb-6 shadow-lifted transition duration-300 ease-in-out data-closed:translate-x-full">
                            <div className="flex items-center justify-between px-4">
                                <h2 className="font-display text-lg font-semibold text-foreground">Filters</h2>
                                <div className="flex items-center gap-3">
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={() => dispatch(resetFilters())}
                                            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                                            Clear all
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setMobileFiltersOpen(false)}
                                        className="relative -mr-2 flex size-10 items-center justify-center rounded-md bg-card p-2 text-muted-foreground hover:bg-secondary focus:ring-2 focus:ring-accent focus:outline-hidden">
                                        <span className="absolute -inset-0.5" />
                                        <span className="sr-only">Close menu</span>
                                        <XMarkIcon aria-hidden="true" className="size-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 border-t border-border px-4">
                                <ProductFiltersPanel />
                            </div>
                        </DialogPanel>
                    </div>
                </Dialog>

                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline justify-between border-b border-border pt-16 md:pt-24 pb-6">
                        <div>
                            <p className="text-sm text-accent font-semibold uppercase tracking-wider mb-2">Shop the Collection</p>
                            <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-foreground">New Arrivals</h1>
                        </div>

                        <div className="flex items-center">
                            <Menu as="div" className="relative inline-block text-left">
                                <MenuButton className="group inline-flex justify-center text-sm font-medium text-muted-foreground hover:text-foreground">
                                    Sort
                                    <ChevronDownIcon
                                        aria-hidden="true"
                                        className="-mr-1 ml-1 size-5 shrink-0 text-muted-foreground group-hover:text-foreground"
                                    />
                                </MenuButton>

                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-card shadow-elegant ring-1 ring-border transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in">
                                    <div className="py-1">
                                        {sortOptions.map((option) => (
                                            <MenuItem key={option.value}>
                                                <button
                                                    type="button"
                                                    onClick={() => dispatch(setSort(option.value))}
                                                    className={cn(
                                                        sort === option.value ? 'font-medium text-foreground' : 'text-muted-foreground',
                                                        'block w-full px-4 py-2 text-left text-sm data-focus:bg-secondary data-focus:outline-hidden'
                                                    )}>
                                                    {option.label}
                                                </button>
                                            </MenuItem>
                                        ))}
                                    </div>
                                </MenuItems>
                            </Menu>

                            <button type="button" className="-m-2 ml-5 p-2 text-muted-foreground hover:text-accent transition-colors sm:ml-7">
                                <span className="sr-only">View grid</span>
                                <Squares2X2Icon aria-hidden="true" className="size-5" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setMobileFiltersOpen(true)}
                                className="-m-2 ml-4 p-2 text-muted-foreground hover:text-accent transition-colors sm:ml-6 lg:hidden">
                                <span className="sr-only">Filters</span>
                                <FunnelIcon aria-hidden="true" className="size-5" />
                            </button>
                        </div>
                    </div>

                    <section aria-labelledby="products-heading" className="pt-6 pb-24">
                        <h2 id="products-heading" className="sr-only">
                            Products
                        </h2>

                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-4">
                            {/* Desktop filters */}
                            <aside className="hidden lg:block">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium text-foreground">Filters</h3>
                                    {hasActiveFilters && (
                                        <button
                                            type="button"
                                            onClick={() => dispatch(resetFilters())}
                                            className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">
                                            Clear all
                                        </button>
                                    )}
                                </div>
                                <ProductFiltersPanel />
                            </aside>

                            {/* Product grid */}
                            <div className="lg:col-span-3">
                                <ProductsList />
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}
