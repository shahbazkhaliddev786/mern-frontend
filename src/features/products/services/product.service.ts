import { http } from '@/shared/services/api'
import type { ApiResponse } from '@/shared/types/api'
import type { Product, ProductsData } from '../types'
import type { SortOption } from '../slices/products-slice'

export interface GetProductsParams {
    page?: number
    limit?: number
    sort?: SortOption
    search?: string
    /** Category ids — sent as repeated `category=` params (parsed as an array server-side). */
    category?: string[]
    /** Brand ids — sent as repeated `brand=` params. */
    brand?: string[]
    minPrice?: number | null
    maxPrice?: number | null
}

export const productService = {
    /**
     * Get all products (paginated, sortable, filterable)
     * GET /v1/products?page=&limit=&sort=&search=&category=&brand=&minPrice=&maxPrice=
     */
    getAll: (params?: GetProductsParams, options?: RequestInit) => {
        const query = new URLSearchParams()
        if (params?.page) query.set('page', String(params.page))
        if (params?.limit) query.set('limit', String(params.limit))
        if (params?.sort) query.set('sort', params.sort)
        if (params?.search?.trim()) query.set('search', params.search.trim())
        if (params?.minPrice != null) query.set('minPrice', String(params.minPrice))
        if (params?.maxPrice != null) query.set('maxPrice', String(params.maxPrice))
        params?.category?.forEach((id) => query.append('category', id))
        params?.brand?.forEach((id) => query.append('brand', id))
        const qs = query.toString()
        return http.get<ApiResponse<ProductsData>>(`/v1/products${qs ? `?${qs}` : ''}`, options)
    },

    /**
     * Get a single product by ID
     * GET /v1/products/:id
     */
    getById: (id: string) => http.getById<ApiResponse<Product>>('/v1/products', id)
}
