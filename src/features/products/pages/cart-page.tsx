import { Link } from 'react-router-dom'
import { ArrowRight, Loader2, ShoppingBag } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import CartItemQuantity from '@/features/products/components/cart-item-quantity'
import { useCart } from '@/features/products/hooks/useCart'
import { useClearCart } from '@/features/products/hooks/useClearCart'
import { Trash2 } from 'lucide-react'

export default function CartPage() {
    const { data: cart, isLoading, isError, error } = useCart()
    const clearCartMutation = useClearCart()
    const cartItems = cart?.items ?? []
    const subtotal = cart?.subtotal ?? cartItems.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0)

    if (isLoading) {
        return (
            <section className="container mx-auto px-4 py-16">
                <div className="rounded-3xl border border-border bg-card p-10 text-center">
                    <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-primary" />
                    <p className="text-lg font-medium">Loading your cart...</p>
                </div>
            </section>
        )
    }

    if (isError) {
        return (
            <section className="container mx-auto px-4 py-16">
                <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-10 text-center">
                    <p className="text-xl font-semibold text-destructive">Unable to load your cart</p>
                    <p className="mt-2 text-muted-foreground">{(error as Error)?.message || 'Please try again later.'}</p>
                    <div className="mt-6 flex justify-center gap-3">
                        <Button asChild variant="secondary">
                            <Link to="/products">Continue Shopping</Link>
                        </Button>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="container mx-auto px-4 py-16">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Your Cart</p>
                    <h1 className="font-display text-4xl font-bold sm:text-5xl">Shopping Bag</h1>
                </div>
                <div className="flex items-center gap-3">
                    {cartItems.length > 0 && (
                        <Button
                            variant="outline"
                            className="text-destructive border-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => clearCartMutation.mutate()}
                            disabled={clearCartMutation.isPending}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {clearCartMutation.isPending ? 'Clearing...' : 'Clear Cart'}
                        </Button>
                    )}
                    <Button asChild>
                        <Link to="/products" className="inline-flex items-center gap-2">
                            <ArrowRight className="h-4 w-4" /> Continue Shopping
                        </Link>
                    </Button>
                </div>
            </div>

            {cartItems.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-muted-foreground/40 bg-background p-16 text-center">
                    <ShoppingBag className="mx-auto mb-6 h-12 w-12 text-muted-foreground" />
                    <h2 className="text-2xl font-semibold">Your cart is empty</h2>
                    <p className="mt-2 text-muted-foreground">Add a few items to your bag and they’ll appear here.</p>
                    <div className="mt-6 flex justify-center">
                        <Button asChild>
                            <Link to="/products">Browse Products</Link>
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid gap-8 xl:grid-cols-[1.75fr_0.95fr]">
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item._id}
                                className="grid gap-4 rounded-3xl border border-border bg-card p-6 shadow-soft md:grid-cols-[140px_1fr_140px] md:items-center">
                                <div className="overflow-hidden rounded-3xl bg-secondary">
                                    {item.product.images?.[0] ? (
                                        <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="flex h-full min-h-35 items-center justify-center text-sm text-muted-foreground">
                                            No image available
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">{item.product.category.name}</p>
                                        <h2 className="text-xl font-semibold">{item.product.name}</h2>
                                    </div>
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                            <span>Unit price: ${item.product.price.toFixed(2)}</span>
                                        </div>
                                        <CartItemQuantity productId={item.product._id} currentQuantity={item.quantity} stock={item.product.stock} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-start justify-between gap-3 text-right md:items-end">
                                    <p className="text-lg font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {item.quantity} item{item.quantity > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <aside className="rounded-3xl border border-border bg-card p-6 shadow-elegant xl:sticky xl:top-24 h-fit">
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Order summary</p>
                                <h2 className="mt-2 font-display text-3xl font-semibold">${subtotal.toFixed(2)}</h2>
                            </div>

                            <div className="rounded-3xl bg-background p-4 text-sm text-muted-foreground">
                                <p className="font-medium text-foreground">Subtotal includes:</p>
                                <ul className="mt-3 space-y-2">
                                    <li>Prices and quantities from your cart</li>
                                    <li>Taxes and shipping calculated at checkout</li>
                                </ul>
                            </div>

                            <Button asChild variant="accent" className="w-full" disabled={cartItems.length === 0}>
                                <Link to="/checkout">Proceed to Checkout</Link>
                            </Button>
                            <Button asChild variant="secondary" className="w-full">
                                <Link to="/products">Continue Shopping</Link>
                            </Button>
                        </div>
                    </aside>
                </div>
            )}
        </section>
    )
}
