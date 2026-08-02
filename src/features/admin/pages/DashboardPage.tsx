import { Link } from 'react-router-dom'
import { DollarSign, Loader2, Package, ShoppingBag, Users } from 'lucide-react'
import { DashboardStatCard } from '../components/dashboard/DashboardStats'
import { RevenueChart } from '../components/revenue-chart/RevenueChart'
import { OrdersStatusSummary } from '../components/orders-status-summary/OrdersStatusSummary'
import { DataTable, type Column } from '../components/table/DataTable'
import { useDashboardSummary } from '../hooks/useDashboardSummary'
import { useAdminOrders } from '../hooks/useAdminOrders'
import type { DashboardTrend } from '../types/dashboard.types'
import type { AdminOrderSummary, OrderStatus } from '../types/order.types'

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
    pending: 'bg-muted text-muted-foreground',
    processing: 'bg-amber-100 text-amber-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-destructive/10 text-destructive'
}

function formatDate(value?: string) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

function formatCurrency(value: number) {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatCount(value: number) {
    return value.toLocaleString()
}

function trendProps(trend?: DashboardTrend): { trend?: string; trendUp?: boolean } {
    if (!trend || trend.changePct === null) {
        return trend ? { trend: 'New', trendUp: true } : {}
    }
    const sign = trend.changePct >= 0 ? '+' : ''
    return { trend: `${sign}${trend.changePct}%`, trendUp: trend.changePct >= 0 }
}

const recentOrdersColumns: Column<AdminOrderSummary>[] = [
    { header: 'Order ID', cell: (order) => `#${order._id.slice(-8)}` },
    {
        header: 'Customer',
        cell: (order) => (
            <div>
                <p className="font-medium text-foreground">{order.user?.name ?? 'Unknown'}</p>
                <p className="text-xs text-muted-foreground">{order.user?.email}</p>
            </div>
        )
    },
    { header: 'Date', cell: (order) => formatDate(order.createdAt) },
    { header: 'Total', cell: (order) => formatCurrency(order.total) },
    {
        header: 'Status',
        cell: (order) => (
            <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_BADGE_CLASSES[order.status] ?? 'bg-muted text-muted-foreground'}`}>
                {order.status}
            </span>
        )
    }
]

export function DashboardPage() {
    const { data, isLoading } = useDashboardSummary()
    const summary = data?.data

    const { data: recentOrdersData, isLoading: isLoadingRecentOrders } = useAdminOrders({
        page: 1,
        limit: 5
    })
    const recentOrders = recentOrdersData?.data.orders ?? []

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">Dashboard</h1>
                <p className="mt-2 text-lg text-muted-foreground">Welcome back! Here's an overview of your store.</p>
            </div>

            {isLoading ? (
                <div className="flex min-h-[160px] items-center justify-center rounded-[2.5rem] border border-border bg-card">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <DashboardStatCard
                        title="Total Revenue"
                        value={formatCurrency(summary?.totals.revenue ?? 0)}
                        icon={<DollarSign className="h-6 w-6" />}
                        {...trendProps(summary?.trends.revenue)}
                    />
                    <DashboardStatCard
                        title="Total Orders"
                        value={formatCount(summary?.totals.orders ?? 0)}
                        icon={<ShoppingBag className="h-6 w-6" />}
                        {...trendProps(summary?.trends.orders)}
                    />
                    <DashboardStatCard
                        title="Total Users"
                        value={formatCount(summary?.totals.users ?? 0)}
                        icon={<Users className="h-6 w-6" />}
                        {...trendProps(summary?.trends.users)}
                    />
                    <DashboardStatCard title="Products" value={formatCount(summary?.totals.products ?? 0)} icon={<Package className="h-6 w-6" />} />
                </div>
            )}

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <div className="col-span-1 rounded-[2.5rem] border border-border bg-card p-8 shadow-soft lg:col-span-2">
                    <h3 className="mb-6 text-xl font-bold">Revenue Overview</h3>
                    {isLoading ? (
                        <div className="flex min-h-[260px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <RevenueChart data={summary?.revenueSeries ?? []} />
                    )}
                </div>

                <div className="col-span-1 rounded-[2.5rem] border border-border bg-card p-8 shadow-soft">
                    <h3 className="mb-6 text-xl font-bold">Orders by Status</h3>
                    {isLoading ? (
                        <div className="flex min-h-[200px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <OrdersStatusSummary
                            data={
                                summary?.ordersByStatus ?? {
                                    pending: 0,
                                    processing: 0,
                                    shipped: 0,
                                    delivered: 0,
                                    cancelled: 0
                                }
                            }
                        />
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">Recent Orders</h2>
                    <Link to="/admin/orders" className="text-sm font-semibold text-primary hover:underline">
                        View all orders →
                    </Link>
                </div>
                <DataTable
                    columns={recentOrdersColumns}
                    data={recentOrders}
                    isLoading={isLoadingRecentOrders}
                    emptyMessage="No orders yet."
                    keyExtractor={(order) => order._id}
                />
            </div>
        </div>
    )
}
