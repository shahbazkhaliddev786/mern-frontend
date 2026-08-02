import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import { productService, type GetProductsParams } from '../services/product.service'
import type { Product } from '../types'

export const PRODUCTS_PER_PAGE = 9

export type SortOption = 'newest' | 'price_low' | 'price_high'

export const fetchProducts = createAsyncThunk('products/fetchProducts', async (params: GetProductsParams | undefined, { rejectWithValue }) => {
    try {
        const response = await productService.getAll(params)
        return response.data
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to fetch products'
        return rejectWithValue(message)
    }
})

interface ProductsState {
    items: Product[]
    isLoading: boolean
    error: string | null
    page: number
    limit: number
    totalPages: number
    totalItems: number
    // Filters / sort
    searchTerm: string
    selectedCategories: string[]
    selectedBrands: string[]
    minPrice: number | null
    maxPrice: number | null
    sort: SortOption
}

const initialState: ProductsState = {
    items: [],
    isLoading: false,
    error: null,
    page: 1,
    limit: PRODUCTS_PER_PAGE,
    totalPages: 1,
    totalItems: 0,
    searchTerm: '',
    selectedCategories: [],
    selectedBrands: [],
    minPrice: null,
    maxPrice: null,
    sort: 'newest'
}

export const productsSlice = createSlice({
    name: 'products',
    initialState,
    reducers: {
        setPage: (state, action: PayloadAction<number>) => {
            state.page = action.payload
        },
        setSort: (state, action: PayloadAction<SortOption>) => {
            state.sort = action.payload
            state.page = 1
        },
        setSearchTerm: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload
            state.page = 1 // reset page on search
        },
        toggleCategory: (state, action: PayloadAction<string>) => {
            const id = action.payload
            state.selectedCategories = state.selectedCategories.includes(id)
                ? state.selectedCategories.filter((c) => c !== id)
                : [...state.selectedCategories, id]
            state.page = 1 // reset page on filter
        },
        toggleBrand: (state, action: PayloadAction<string>) => {
            const id = action.payload
            state.selectedBrands = state.selectedBrands.includes(id) ? state.selectedBrands.filter((b) => b !== id) : [...state.selectedBrands, id]
            state.page = 1 // reset page on filter
        },
        setPriceRange: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
            state.minPrice = action.payload.min
            state.maxPrice = action.payload.max
            state.page = 1 // reset page on filter
        },
        resetFilters: (state) => {
            state.page = 1
            state.searchTerm = ''
            state.selectedCategories = []
            state.selectedBrands = []
            state.minPrice = null
            state.maxPrice = null
            state.sort = 'newest'
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.isLoading = false
                state.items = action.payload.products
                state.page = action.payload.pagination.currentPage
                state.totalPages = action.payload.pagination.totalPages
                state.totalItems = action.payload.pagination.totalItems
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
    }
})

export const { setPage, setSort, setSearchTerm, toggleCategory, toggleBrand, setPriceRange, resetFilters } = productsSlice.actions

export default productsSlice.reducer
