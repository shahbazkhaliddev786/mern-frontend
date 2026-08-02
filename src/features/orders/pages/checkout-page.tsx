import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCart } from '@/features/products/hooks/useCart'
import { useCheckout } from '../hooks/useCheckout'
import { shippingSchema, type ShippingAddress } from '../schemas/shipping-schema'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CheckoutPage() {
    const { data: cart, isLoading: isCartLoading } = useCart()
    const checkoutMutation = useCheckout()

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<ShippingAddress>({
        resolver: zodResolver(shippingSchema)
    })

    const onSubmit = (data: ShippingAddress) => {
        const payload = {
            shippingAddress: data,
            items: cartItems.map((item) => ({
                product: item.product._id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                image: item.product.images?.[0] || ''
            })),
            subtotal,
            tax: 0,
            shipping: 0,
            total: subtotal
        }
        checkoutMutation.mutate(payload)
    }

    const cartItems = cart?.items ?? []
    const subtotal = cart?.subtotal ?? cartItems.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0)

    if (isCartLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-semibold mb-4">Your cart is empty</h2>
                <Button asChild>
                    <Link to="/products">Browse Products</Link>
                </Button>
            </div>
        )
    }

    return (
        <section className="container mx-auto px-4 py-16">
            <div className="mb-10">
                <Button asChild variant="ghost" className="mb-4 pl-0 hover:bg-transparent">
                    <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="h-4 w-4" /> Back to Cart
                    </Link>
                </Button>
                <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Checkout</p>
                <h1 className="font-display text-4xl font-bold sm:text-5xl">Shipping & Payment</h1>
            </div>

            <div className="grid gap-8 xl:grid-cols-[1fr_0.6fr] items-start">
                {/* Shipping Form */}
                <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-soft">
                    <h2 className="text-xl font-semibold mb-6">Shipping Address</h2>

                    <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input id="fullName" placeholder="John Doe" {...register('fullName')} />
                            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Input id="address" placeholder="123 Main St" {...register('address')} />
                            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input id="city" placeholder="New York" {...register('city')} />
                                {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="postalCode">Postal Code</Label>
                                <Input id="postalCode" placeholder="10001" {...register('postalCode')} />
                                {errors.postalCode && <p className="text-sm text-destructive">{errors.postalCode.message}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="country">Country</Label>
                                <Input id="country" placeholder="United States" {...register('country')} />
                                {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone (Optional)</Label>
                                <Input id="phone" placeholder="+1 234 567 8900" {...register('phone')} />
                                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <aside className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-elegant sticky top-24">
                    <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

                    <div className="space-y-4 mb-6">
                        {cartItems.map((item) => (
                            <div key={item._id} className="flex justify-between text-sm">
                                <span className="text-muted-foreground flex-1 pr-4 truncate">
                                    {item.quantity}x {item.product.name}
                                </span>
                                <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border pt-4 space-y-3 mb-8">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span>Calculated at next step</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold pt-2">
                            <span>Total</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <Button type="submit" variant="accent" form="checkout-form" className="w-full" disabled={checkoutMutation.isPending}>
                        {checkoutMutation.isPending ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" /> Processing...
                            </span>
                        ) : (
                            'Proceed to Payment'
                        )}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">
                        You will be securely redirected to Stripe to complete your purchase.
                    </p>
                </aside>
            </div>
        </section>
    )
}
