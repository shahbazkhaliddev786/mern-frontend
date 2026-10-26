import { Loader2 } from 'lucide-react'

export default function ToolStatus({ label }: { label: string }) {
    return (
        <div role="status" className="bg-secondary text-secondary-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs">
            <Loader2 className="size-3 animate-spin" aria-hidden />
            {label}
        </div>
    )
}
