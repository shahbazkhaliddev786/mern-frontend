import { type Order } from '../services/orders.service'
import { Card, CardContent, CardHeader } from '@/shared/components/ui/card'
import { Package, Clock, CheckCircle2, Truck, AlertCircle } from 'lucide-react'

const statusConfig = {
    pending: { label: 'Pending', icon: Clock, color: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' },
    processing: { label: 'Processing', icon: Package, color: 'bg-blue-500/10 text-blue-600 border-blue-500/20' },
    shipped: { label: 'Shipped', icon: Truck, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
    delivered: { label: 'Delivered', icon: CheckCircle2, color: 'bg-green-500/10 text-green-600 border-green-500/20' },
    cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'bg-red-500/10 text-red-600 border-red-500/20' }
}

interface OrderCardProps {
    order: Order
}

export function OrderCard({ order }: OrderCardProps) {
    const status = statusConfig[order.status] || statusConfig.pending
    const StatusIcon = status.icon

    const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long'
    }).format(new Date(order.createdAt))

    return (
        <Card className="rounded-[2rem] border-border bg-card shadow-soft overflow-hidden hover:shadow-elegant transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20 px-6 py-5">
                <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-2xl ${status.color} border`}>
                        <StatusIcon className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                            Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm font-bold text-foreground mt-0.5">{formattedDate}</p>
                    </div>
                </div>
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.color}`}>
                    {status.label}
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="space-y-5">
                    {order.items.map((item) => (
                        <div key={item._id} className="flex items-center gap-5">
                            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-[1.25rem] border border-border bg-muted/30">
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-base font-bold text-foreground truncate">{item.name}</p>
                                <p className="text-sm font-medium text-muted-foreground mt-1">
                                    <span className="text-primary font-bold">{item.quantity}</span> × ${item.price.toFixed(2)}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-base font-black text-foreground">${(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-dashed border-border/60 flex justify-between items-end">
                    <div className="space-y-1">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Paid</p>
                        <p className="text-3xl font-black text-primary leading-none">${order.total.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-medium text-muted-foreground italic">Payment via Stripe</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
