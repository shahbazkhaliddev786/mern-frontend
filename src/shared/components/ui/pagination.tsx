import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

const DOTS = 'dots'

function range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Build a compact, scalable list of page items with ellipses.
 * Always shows the first and last page, the current page, and `siblingCount`
 * pages on each side of it — collapsing the rest into ellipses. Works for any
 * number of pages without overflowing the control.
 */
export function getPaginationRange(currentPage: number, totalPages: number, siblingCount = 1): (number | typeof DOTS)[] {
    // first + last + current + 2*siblings + 2 ellipsis placeholders
    const totalPageNumbers = siblingCount * 2 + 5

    if (totalPageNumbers >= totalPages) {
        return range(1, totalPages)
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1)
    const rightSibling = Math.min(currentPage + siblingCount, totalPages)

    const showLeftDots = leftSibling > 2
    const showRightDots = rightSibling < totalPages - 1

    if (!showLeftDots && showRightDots) {
        const leftItemCount = 3 + 2 * siblingCount
        return [...range(1, leftItemCount), DOTS, totalPages]
    }

    if (showLeftDots && !showRightDots) {
        const rightItemCount = 3 + 2 * siblingCount
        return [1, DOTS, ...range(totalPages - rightItemCount + 1, totalPages)]
    }

    return [1, DOTS, ...range(leftSibling, rightSibling), DOTS, totalPages]
}

const itemBase =
    'inline-flex items-center justify-center size-9 rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-40'

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    /** Pages to show on each side of the current page. Defaults to 1. */
    siblingCount?: number
    className?: string
}

export function Pagination({ currentPage, totalPages, onPageChange, siblingCount = 1, className }: PaginationProps) {
    if (totalPages <= 1) return null

    const pages = getPaginationRange(currentPage, totalPages, siblingCount)

    const goTo = (page: number) => {
        if (page < 1 || page > totalPages || page === currentPage) return
        onPageChange(page)
    }

    return (
        <nav role="navigation" aria-label="Pagination" className={cn('flex items-center justify-center gap-1.5', className)}>
            <button
                type="button"
                onClick={() => goTo(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Go to previous page"
                className={cn(itemBase, 'border border-border bg-background hover:bg-accent hover:text-accent-foreground')}>
                <ChevronLeft className="size-4" />
            </button>

            {pages.map((page, index) =>
                page === DOTS ? (
                    <span key={`dots-${index}`} className="inline-flex size-9 items-center justify-center text-muted-foreground" aria-hidden="true">
                        &#8230;
                    </span>
                ) : (
                    <button
                        key={page}
                        type="button"
                        onClick={() => goTo(page)}
                        aria-label={`Go to page ${page}`}
                        aria-current={page === currentPage ? 'page' : undefined}
                        className={cn(
                            itemBase,
                            page === currentPage
                                ? 'border border-accent bg-accent text-accent-foreground shadow-soft'
                                : 'border border-border bg-background hover:bg-accent hover:text-accent-foreground'
                        )}>
                        {page}
                    </button>
                )
            )}

            <button
                type="button"
                onClick={() => goTo(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Go to next page"
                className={cn(itemBase, 'border border-border bg-background hover:bg-accent hover:text-accent-foreground')}>
                <ChevronRight className="size-4" />
            </button>
        </nav>
    )
}
