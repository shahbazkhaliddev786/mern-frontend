import { useEffect, useMemo, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Save, Upload, X } from 'lucide-react'
import { useForm, type FieldPath } from 'react-hook-form'
import { toast } from 'react-toastify'
import { AdminModal } from '../modal/AdminModal'
import { useCreateProduct } from '../../hooks/useCreateProduct'
import { useUpdateProduct } from '../../hooks/useUpdateProduct'
import { useBrands, useCategories } from '@/shared/hooks/use-catalog'
import { productSchema, type ProductFormData } from '../../schemas/product.schema'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Textarea } from '@/shared/components/ui/textarea'
import type { Product } from '@/features/products/types'

interface ProductFormModalProps {
    isOpen: boolean
    onClose: () => void
    /** Presence switches the modal into edit mode. */
    product?: Product | null
}

interface BackendValidationError {
    field?: string
    message?: string
}

interface ApiErrorData {
    message?: string
    errors?: BackendValidationError[]
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
const MAX_IMAGES = 10

const EMPTY_VALUES: ProductFormData = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    brand: ''
}

function getDefaultValues(product?: Product | null): ProductFormData {
    if (!product) return EMPTY_VALUES
    return {
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        category: product.category?._id ?? '',
        brand: product.brand?._id ?? ''
    }
}

function isProductField(field: string): field is FieldPath<ProductFormData> {
    return ['name', 'description', 'price', 'stock', 'category', 'brand'].includes(field)
}

function getErrorData(error: unknown): ApiErrorData | undefined {
    if (typeof error !== 'object' || error === null || !('data' in error)) return undefined
    const data = (error as { data?: unknown }).data
    return typeof data === 'object' && data !== null ? (data as ApiErrorData) : undefined
}

/** Validate selected files client-side before upload (server re-validates). */
function validateImages(files: File[]): string | null {
    if (files.length > MAX_IMAGES) return `You can upload at most ${MAX_IMAGES} images`
    for (const file of files) {
        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            return 'Only JPEG, PNG or WEBP images are allowed'
        }
        if (file.size > MAX_IMAGE_SIZE) {
            return 'Each image must be 5MB or smaller'
        }
    }
    return null
}

const selectClassName =
    'h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50'

export function ProductFormModal({ isOpen, onClose, product }: ProductFormModalProps) {
    const isEditMode = Boolean(product)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [images, setImages] = useState<File[]>([])
    const [imageError, setImageError] = useState<string | null>(null)

    const { data: categories = [], isLoading: isCategoriesLoading } = useCategories()
    const { data: brands = [], isLoading: isBrandsLoading } = useBrands()

    const { mutate: createProduct, isPending: isCreating } = useCreateProduct()
    const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct()
    const isPending = isCreating || isUpdating

    const defaultValues = useMemo(() => getDefaultValues(product), [product])
    const initializedRef = useRef(false)

    const {
        register,
        handleSubmit,
        reset,
        setError,
        formState: { errors }
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues
    })

    // Initialize the form once per open, but only after the category/brand options
    // are available — otherwise an uncontrolled <select> can't bind to a value whose
    // <option> hasn't rendered yet (edit mode would show blank category/brand).
    useEffect(() => {
        if (!isOpen) {
            initializedRef.current = false
            return
        }
        if (initializedRef.current || isCategoriesLoading || isBrandsLoading) return

        // Only the RHF form needs syncing here — image state is always cleared on
        // close (handleClose), so it is already empty by the time the modal reopens.
        initializedRef.current = true
        reset(getDefaultValues(product))
    }, [isOpen, product, isCategoriesLoading, isBrandsLoading, reset])

    const handleClose = () => {
        reset(EMPTY_VALUES)
        setImages([])
        setImageError(null)
        onClose()
    }

    const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selected = event.target.files ? Array.from(event.target.files) : []
        const validationError = validateImages(selected)
        if (validationError) {
            setImageError(validationError)
            setImages([])
            if (fileInputRef.current) fileInputRef.current.value = ''
            return
        }
        setImageError(null)
        setImages(selected)
    }

    const applyServerErrors = (error: unknown) => {
        const errorData = getErrorData(error)
        const backendErrors = errorData?.errors ?? []
        let hasFieldError = false

        backendErrors.forEach((backendError) => {
            if (backendError.field && isProductField(backendError.field)) {
                setError(backendError.field, {
                    type: 'server',
                    message: backendError.message || 'Invalid value'
                })
                hasFieldError = true
            }
        })

        if (!hasFieldError) {
            const fallback = error instanceof Error ? error.message : 'Something went wrong'
            toast.error(errorData?.message || fallback)
        }
    }

    const onSubmit = (values: ProductFormData) => {
        if (isPending) return

        // Images are required when creating; optional when editing (existing images kept).
        if (!isEditMode && images.length === 0) {
            setImageError('At least one product image is required')
            return
        }

        if (isEditMode && product) {
            updateProduct({ id: product._id, values, images }, { onSuccess: handleClose, onError: applyServerErrors })
        } else {
            createProduct({ values, images }, { onSuccess: handleClose, onError: applyServerErrors })
        }
    }

    return (
        <AdminModal isOpen={isOpen} onClose={handleClose} title={isEditMode ? 'Update Product' : 'Create Product'} maxWidth="2xl">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="product-name" className="text-sm font-semibold text-foreground">
                        Name
                    </Label>
                    <Input
                        id="product-name"
                        placeholder="Wireless Headphones"
                        aria-invalid={!!errors.name}
                        disabled={isPending}
                        className="h-11 rounded-xl bg-background"
                        {...register('name')}
                    />
                    {errors.name && <p className="text-xs font-medium text-destructive">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="product-description" className="text-sm font-semibold text-foreground">
                        Description
                    </Label>
                    <Textarea
                        id="product-description"
                        placeholder="Describe the product (at least 10 characters)"
                        aria-invalid={!!errors.description}
                        disabled={isPending}
                        className="min-h-28 rounded-xl bg-background"
                        {...register('description')}
                    />
                    {errors.description && <p className="text-xs font-medium text-destructive">{errors.description.message}</p>}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="product-price" className="text-sm font-semibold text-foreground">
                            Price ($)
                        </Label>
                        <Input
                            id="product-price"
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="99.99"
                            aria-invalid={!!errors.price}
                            disabled={isPending}
                            className="h-11 rounded-xl bg-background"
                            {...register('price', { valueAsNumber: true })}
                        />
                        {errors.price && <p className="text-xs font-medium text-destructive">{errors.price.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="product-stock" className="text-sm font-semibold text-foreground">
                            Stock
                        </Label>
                        <Input
                            id="product-stock"
                            type="number"
                            step="1"
                            min="0"
                            placeholder="50"
                            aria-invalid={!!errors.stock}
                            disabled={isPending}
                            className="h-11 rounded-xl bg-background"
                            {...register('stock', { valueAsNumber: true })}
                        />
                        {errors.stock && <p className="text-xs font-medium text-destructive">{errors.stock.message}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="product-category" className="text-sm font-semibold text-foreground">
                            Category
                        </Label>
                        <select
                            id="product-category"
                            aria-invalid={!!errors.category}
                            disabled={isPending || isCategoriesLoading}
                            className={selectClassName}
                            {...register('category')}>
                            <option value="">{isCategoriesLoading ? 'Loading...' : 'Select a category'}</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {errors.category && <p className="text-xs font-medium text-destructive">{errors.category.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="product-brand" className="text-sm font-semibold text-foreground">
                            Brand
                        </Label>
                        <select
                            id="product-brand"
                            aria-invalid={!!errors.brand}
                            disabled={isPending || isBrandsLoading}
                            className={selectClassName}
                            {...register('brand')}>
                            <option value="">{isBrandsLoading ? 'Loading...' : 'Select a brand'}</option>
                            {brands.map((brand) => (
                                <option key={brand._id} value={brand._id}>
                                    {brand.name}
                                </option>
                            ))}
                        </select>
                        {errors.brand && <p className="text-xs font-medium text-destructive">{errors.brand.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="product-images" className="text-sm font-semibold text-foreground">
                        Images {isEditMode && <span className="text-muted-foreground">(optional — replaces current)</span>}
                    </Label>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-xl"
                            disabled={isPending}
                            onClick={() => fileInputRef.current?.click()}>
                            <Upload className="h-4 w-4" />
                            Choose images
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            {images.length > 0
                                ? `${images.length} file${images.length > 1 ? 's' : ''} selected`
                                : 'JPEG, PNG or WEBP · up to 5MB each'}
                        </span>
                    </div>
                    <input
                        id="product-images"
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(',')}
                        multiple
                        className="sr-only"
                        disabled={isPending}
                        onChange={handleFilesChange}
                    />
                    {images.length > 0 && (
                        <ul className="flex flex-wrap gap-2 pt-1">
                            {images.map((file) => (
                                <li
                                    key={file.name}
                                    className="inline-flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">
                                    {file.name}
                                </li>
                            ))}
                        </ul>
                    )}
                    {imageError && <p className="text-xs font-medium text-destructive">{imageError}</p>}
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" className="rounded-xl" onClick={handleClose} disabled={isPending}>
                        <X className="h-4 w-4" />
                        Cancel
                    </Button>
                    <Button type="submit" className="rounded-xl" disabled={isPending}>
                        {isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {isEditMode ? 'Saving...' : 'Creating...'}
                            </>
                        ) : isEditMode ? (
                            <>
                                <Save className="h-4 w-4" />
                                Save Changes
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4" />
                                Create Product
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </AdminModal>
    )
}
