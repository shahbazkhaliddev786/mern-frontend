import { useMyOrdersQuery } from '../hooks/useMyOrdersQuery'
import { OrderCard } from '../components/order-card'
import { Loader2, ShoppingBag, PackageX } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Link } from 'react-router-dom'

export function UserDashboardPage() {
    const { data, isLoading, isError, error } = useMyOrdersQuery()

    if (isLoading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        )
    }

    if (isError) {
        return (
            <section className="container mx-auto px-4 py-12 md:py-24 max-w-4xl text-center">
                <div className="bg-destructive/5 border border-destructive/20 rounded-[2.5rem] p-12">
                    <PackageX className="h-16 w-16 text-destructive mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-destructive mb-2">Failed to load orders</h2>
                    <p className="text-muted-foreground mb-8">{error?.message || 'Something went wrong.'}</p>
                </div>
            </section>
        )
    }

    const orders = data?.data || []

    return (
        <section className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
            <div className="mb-12">
                <h1 className="font-display text-4xl font-black sm:text-5xl tracking-tight">My Orders</h1>
                <p className="text-muted-foreground mt-4 text-lg">Track your orders and view their current status.</p>
            </div>

            {orders.length === 0 ? (
                <div className="bg-card border border-border rounded-[2.5rem] p-16 text-center shadow-sm">
                    <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-4">No orders found</h2>
                    <p className="text-muted-foreground mb-10 max-w-md mx-auto">
                        You haven't placed any orders yet. Start shopping and discover our amazing products!
                    </p>
                    <Link to="/products">
                        <Button
                            variant="accent"
                            className="rounded-2xl h-14 px-10 text-lg font-bold shadow-glow transition-all hover:scale-105 active:scale-95">
                            Explore Products
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-8">
                    {orders.map((order) => (
                        <OrderCard key={order._id} order={order} />
                    ))}
                </div>
            )}
        </section>
    )
}
