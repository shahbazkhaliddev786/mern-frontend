import { http } from '@/shared/services/api'
import type { ApiResponse } from '@/shared/types/api'
import type { Brand, Category } from '@/features/products/types'

/** GET /v1/categories — shared catalog lookup (product form dropdowns, product filters) */
export async function getCategories(): Promise<Category[]> {
    const response = await http.get<ApiResponse<Category[]>>('/v1/categories')
    return response.data ?? []
}

/** GET /v1/brands — shared catalog lookup (product form dropdowns, product filters) */
export async function getBrands(): Promise<Brand[]> {
    const response = await http.get<ApiResponse<Brand[]>>('/v1/brands')
    return response.data ?? []
}
