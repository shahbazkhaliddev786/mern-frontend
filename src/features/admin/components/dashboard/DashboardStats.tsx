import type { ReactNode } from 'react'

interface DashboardStatCardProps {
    title: string
    value: string
    icon: ReactNode
    trend?: string
    trendUp?: boolean
}

export function DashboardStatCard({ title, value, icon, trend, trendUp }: DashboardStatCardProps) {
    return (
        <div className="flex flex-col gap-4 rounded-[2.5rem] border border-border bg-card p-6 shadow-soft transition-all hover:shadow-elegant">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">{icon}</div>
            </div>
            <div>
                <p className="font-display text-4xl font-black text-foreground tracking-tight">{value}</p>
                {trend && (
                    <p className="mt-2 text-sm font-medium">
                        <span className={trendUp ? 'text-green-500' : 'text-destructive'}>{trend}</span>{' '}
                        <span className="text-muted-foreground">vs last month</span>
                    </p>
                )}
            </div>
        </div>
    )
}
