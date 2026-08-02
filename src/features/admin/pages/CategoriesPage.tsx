import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { DataTable, type Column } from '../components/table/DataTable'
import { CategoryFormModal } from '../components/category-form-modal/CategoryFormModal'
import { DeleteCategoryDialog } from '../components/delete-category-dialog/DeleteCategoryDialog'
import { useCategories } from '@/shared/hooks/use-catalog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import type { Category } from '@/features/products/types'

function formatDate(value?: string) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export function CategoriesPage() {
    const [search, setSearch] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

    const { data: categories = [], isLoading } = useCategories()

    // Backend returns the full, pre-sorted category list with no query params —
    // this filters the already-fetched array client-side, no extra network call.
    const filteredCategories = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return categories
        return categories.filter((category) => category.name.toLowerCase().includes(term))
    }, [categories, search])

    const openCreateModal = () => {
        setEditingCategory(null)
        setIsFormOpen(true)
    }

    const openEditModal = (category: Category) => {
        setEditingCategory(category)
        setIsFormOpen(true)
    }

    const closeFormModal = () => {
        setIsFormOpen(false)
        setEditingCategory(null)
    }

    const columns: Column<Category>[] = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Created', cell: (category) => formatDate(category.createdAt) },
        {
            header: 'Actions',
            className: 'text-right',
            cell: (category) => (
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => openEditModal(category)}>
                        <Pencil className="h-4 w-4" />
                        Update
                    </Button>
                    <Button type="button" variant="destructive" size="sm" className="rounded-xl" onClick={() => setDeletingCategory(category)}>
                        <Trash2 className="h-4 w-4" />
                        Delete
                    </Button>
                </div>
            )
        }
    ]

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">Categories</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Manage your store's categories here.</p>
                </div>
                <Button className="rounded-xl" onClick={openCreateModal}>
                    <Plus className="h-4 w-4" />
                    Create Category
                </Button>
            </div>

            <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search categories..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-11 rounded-xl bg-background pl-9"
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredCategories}
                isLoading={isLoading}
                emptyMessage="Try adjusting your search, or create your first category."
                keyExtractor={(category) => category._id}
            />

            <CategoryFormModal isOpen={isFormOpen} onClose={closeFormModal} category={editingCategory} />
            <DeleteCategoryDialog isOpen={Boolean(deletingCategory)} onClose={() => setDeletingCategory(null)} category={deletingCategory} />
        </div>
    )
}
