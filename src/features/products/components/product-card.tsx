import { Link } from 'react-router-dom'
import { Star, ShoppingCart, Trash2 } from 'lucide-react'
import { useAddToCart } from '../hooks/useAddToCart'
import { useRemoveFromCart } from '../hooks/useRemoveFromCart'
import { useIsInCart } from '../hooks/useIsInCart'
import type { Product } from '../types'

interface ProductCardProps {
    product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
    const addToCartMutation = useAddToCart()
    const removeFromCartMutation = useRemoveFromCart()
    const isInCart = useIsInCart(product._id)

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        addToCartMutation.mutate({ productId: product._id, quantity: 1 })
    }

    const handleRemoveFromCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        removeFromCartMutation.mutate(product._id)
    }

    const isLoading = addToCartMutation.isPending || removeFromCartMutation.isPending

    return (
        <div className="group">
            <Link to={`/products/${product._id}`}>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary mb-3 shadow-soft transition-shadow duration-300 group-hover:shadow-elegant">
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />
                    {product.originalPrice && (
                        <span className="absolute top-3 left-3 bg-accent-2 text-accent-2-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full shadow-soft">
                            Sale
                        </span>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{product.category.name}</p>
                    <h3 className="font-medium text-card-foreground group-hover:text-accent transition-colors">{product.name}</h3>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                            <Star
                                key={i}
                                className={`h-3 w-3 ${i < Math.floor(product.rating ?? 0) ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`}
                            />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">({product.reviews ?? 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">${product.price}</span>
                        {product.originalPrice && <span className="text-sm text-muted-foreground line-through">${product.originalPrice}</span>}
                    </div>
                </div>
            </Link>
            <div className="mt-2 flex items-center gap-2">
                <button
                    onClick={isInCart ? handleRemoveFromCart : handleAddToCart}
                    disabled={isLoading}
                    className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                        isInCart
                            ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                            : 'bg-accent text-accent-foreground shadow-soft hover:bg-accent/90 hover:shadow-glow'
                    }`}>
                    {isInCart ? (
                        <>
                            <Trash2 className="h-4 w-4" />
                            {removeFromCartMutation.isPending ? 'Removing...' : 'Remove'}
                        </>
                    ) : (
                        <>
                            <ShoppingCart className="h-4 w-4" />
                            {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
