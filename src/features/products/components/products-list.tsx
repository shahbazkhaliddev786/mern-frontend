import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks'
import { fetchProducts, setPage } from '../slices/products-slice'
import { Pagination } from '@/shared/components/ui/pagination'
import ProductCard from './product-card'

export default function ProductsList() {
    const dispatch = useAppDispatch()
    const {
        items: products,
        isLoading,
        error: isError,
        page,
        limit,
        totalPages,
        sort,
        searchTerm,
        selectedCategories,
        selectedBrands,
        minPrice,
        maxPrice
    } = useAppSelector((state) => state.products)

    // Refetch whenever the page, sort, or any filter changes. Filter reducers
    // reset the page to 1, so a filter change and its page reset trigger a single fetch.
    useEffect(() => {
        dispatch(
            fetchProducts({
                page,
                limit,
                sort,
                search: searchTerm,
                category: selectedCategories,
                brand: selectedBrands,
                minPrice,
                maxPrice
            })
        )
    }, [dispatch, page, limit, sort, searchTerm, selectedCategories, selectedBrands, minPrice, maxPrice])

    const handlePageChange = (nextPage: number) => {
        dispatch(setPage(nextPage))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    if (isLoading) {
        return (
            <div className="bg-background flex justify-center py-24">
                <p className="text-muted-foreground animate-pulse">Loading products...</p>
            </div>
        )
    }

    if (isError) {
        return (
            <div className="bg-background flex justify-center py-24">
                <p className="text-destructive">Error loading products.</p>
            </div>
        )
    }

    return (
        <div className="bg-background">
            <div className="mx-auto max-w-2xl px-4 py-2 sm:px-6 sm:py-2 lg:max-w-7xl lg:px-8">
                <h2 className="sr-only">Products</h2>

                <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                    {products.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-muted-foreground">
                            {searchTerm || selectedCategories.length > 0 || selectedBrands.length > 0 || minPrice != null || maxPrice != null
                                ? 'No products match your filters.'
                                : 'No products available.'}
                        </div>
                    ) : (
                        products.map((product) => <ProductCard key={product._id} product={product} />)
                    )}
                </div>

                <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} className="mt-12" />
            </div>
        </div>
    )
}
