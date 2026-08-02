import type { ReactNode } from 'react'
import { Loader2, Inbox } from 'lucide-react'

export interface Column<T> {
    header: string
    accessorKey?: keyof T
    cell?: (item: T) => ReactNode
    className?: string
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    isLoading?: boolean
    emptyMessage?: string
    keyExtractor: (item: T) => string | number
}

export function DataTable<T>({ columns, data, isLoading = false, emptyMessage = 'No data available', keyExtractor }: DataTableProps<T>) {
    if (isLoading) {
        return (
            <div className="flex min-h-[400px] w-full items-center justify-center rounded-[2rem] border border-border bg-card">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-[2rem] border border-border bg-card p-8 text-center shadow-soft">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 mb-4">
                    <Inbox className="h-10 w-10 text-muted-foreground/50" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No records found</h3>
                <p className="mt-2 text-muted-foreground">{emptyMessage}</p>
            </div>
        )
    }

    return (
        <div className="w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
            <div className="overflow-x-auto">
                <table className="w-full whitespace-nowrap text-left text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/30">
                            {columns.map((col, idx) => (
                                <th key={idx} className={`px-6 py-4 font-semibold text-muted-foreground ${col.className || ''}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => (
                            <tr key={keyExtractor(item)} className="transition-colors hover:bg-muted/30">
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx} className={`px-6 py-4 text-foreground ${col.className || ''}`}>
                                        {col.cell ? col.cell(item) : col.accessorKey ? (item[col.accessorKey] as ReactNode) : null}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
