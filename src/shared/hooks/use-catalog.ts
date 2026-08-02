import { useQuery } from '@tanstack/react-query'
import { getBrands, getCategories } from '@/shared/services/catalog.service'

const FIVE_MINUTES = 5 * 60 * 1000

export function useCategories() {
    return useQuery({
        queryKey: ['categories'],
        queryFn: getCategories,
        staleTime: FIVE_MINUTES
    })
}

export function useBrands() {
    return useQuery({
        queryKey: ['brands'],
        queryFn: getBrands,
        staleTime: FIVE_MINUTES
    })
}
