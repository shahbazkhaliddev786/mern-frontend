import { useState } from 'react'
import { Star, ShoppingCart, Trash2, PackageCheck, PackageX } from 'lucide-react'
import { useAddToCart } from '../hooks/useAddToCart'
import { useRemoveFromCart } from '../hooks/useRemoveFromCart'
import { useIsInCart } from '../hooks/useIsInCart'
import { ProductQuantitySelector } from './product-quantity-selector'
import { Button } from '@/shared/components/ui/button'
import type { Product } from '../types'

interface ProductInfoProps {
    product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
    const [quantity, setQuantity] = useState(1)
    const addToCartMutation = useAddToCart()
    const removeFromCartMutation = useRemoveFromCart()
    const isInCart = useIsInCart(product._id)

    const isLoading = addToCartMutation.isPending || removeFromCartMutation.isPending
    const inStock = product.stock > 0

    const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : null

    const handleAddToCart = () => {
        addToCartMutation.mutate({ productId: product._id, quantity })
    }

    const handleRemoveFromCart = () => {
        removeFromCartMutation.mutate(product._id)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Category & Brand */}
            <div className="flex items-center gap-3">
                <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                    {product.category.name}
                </span>
                <span className="text-xs font-medium text-muted-foreground">{product.brand.name}</span>
            </div>

            {/* Product Name */}
            <h1 className="font-display text-4xl font-black leading-tight tracking-tight sm:text-5xl">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`h-4 w-4 ${
                                i < Math.floor(product.rating ?? 0) ? 'fill-gold text-gold' : 'fill-muted text-muted-foreground/30'
                            }`}
                        />
                    ))}
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                    {(product.rating ?? 0).toFixed(1)} ({product.reviews ?? 0} reviews)
                </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-primary">${product.price.toFixed(2)}</span>
                {product.originalPrice && (
                    <>
                        <span className="text-lg text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                        <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-bold text-green-600 border border-green-500/20">
                            -{discount}% OFF
                        </span>
                    </>
                )}
            </div>

            {/* Stock Badge */}
            <div className="flex items-center gap-2">
                {inStock ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-bold text-green-600">
                        <PackageCheck className="h-3.5 w-3.5" />
                        In Stock ({product.stock} available)
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                        <PackageX className="h-3.5 w-3.5" />
                        Out of Stock
                    </span>
                )}
            </div>

            {/* Description */}
            <p className="text-base leading-relaxed text-muted-foreground">{product.description}</p>

            {/* Divider */}
            <div className="border-t border-border/50" />

            {/* Quantity Selector */}
            {inStock && !isInCart && (
                <div className="flex flex-col gap-2">
                    <p className="text-sm font-semibold">Quantity</p>
                    <ProductQuantitySelector value={quantity} max={product.stock} onChange={setQuantity} />
                </div>
            )}

            {/* Add / Remove from Cart CTA */}
            {isInCart ? (
                <Button
                    onClick={handleRemoveFromCart}
                    disabled={isLoading}
                    variant="destructive"
                    className="h-14 w-full rounded-2xl text-base font-bold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
                    <Trash2 className="mr-2 h-5 w-5" />
                    {removeFromCartMutation.isPending ? 'Removing...' : 'Remove from Cart'}
                </Button>
            ) : (
                <Button
                    onClick={handleAddToCart}
                    disabled={isLoading || !inStock}
                    variant="accent"
                    className="h-14 w-full rounded-2xl text-base font-bold shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {addToCartMutation.isPending ? 'Adding...' : !inStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
            )}
        </div>
    )
}
