import { useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ShoppingBag } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useQueryClient } from '@tanstack/react-query'
import { cartService } from '@/features/products/services/cart.service'
export function OrderSuccessPage() {
    const [searchParams] = useSearchParams()
    const sessionId = searchParams.get('session_id')
    const queryClient = useQueryClient()
    const hasCleared = useRef(false)

    useEffect(() => {
        if (sessionId && !hasCleared.current) {
            hasCleared.current = true
            cartService
                .clearCart()
                .then(() => {
                    queryClient.invalidateQueries({ queryKey: ['cart'] })
                })
                .catch(() => {})
        }
    }, [sessionId, queryClient])

    return (
        <section className="container mx-auto px-4 py-16 flex justify-center min-h-[60vh] items-center">
            <div className="max-w-md w-full rounded-3xl border border-border bg-card p-10 text-center shadow-elegant">
                <div className="mx-auto mb-6 h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-9 w-9 text-green-500" />
                </div>
                <h1 className="font-display text-3xl font-bold mb-2">Order Confirmed!</h1>
                <p className="text-muted-foreground mb-8">
                    Thank you for your purchase. We've received your order and will begin processing it right away.
                </p>

                {sessionId && (
                    <div className="bg-secondary/50 rounded-xl p-4 mb-8 text-sm break-all text-muted-foreground">
                        <span className="font-semibold block mb-1 text-foreground">Order Reference:</span>
                        {sessionId}
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <Button asChild variant="accent" className="w-full">
                        <Link to="/products">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    )
}
