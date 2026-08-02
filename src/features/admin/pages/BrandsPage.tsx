import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { DataTable, type Column } from '../components/table/DataTable'
import { BrandFormModal } from '../components/brand-form-modal/BrandFormModal'
import { DeleteBrandDialog } from '../components/delete-brand-dialog/DeleteBrandDialog'
import { useBrands } from '@/shared/hooks/use-catalog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import type { Brand } from '@/features/products/types'

function formatDate(value?: string) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

export function BrandsPage() {
    const [search, setSearch] = useState('')
    const [isFormOpen, setIsFormOpen] = useState(false)
    const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
    const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null)

    const { data: brands = [], isLoading } = useBrands()

    // Backend returns the full, pre-sorted brand list with no query params —
    // this filters the already-fetched array client-side, no extra network call.
    const filteredBrands = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return brands
        return brands.filter((brand) => brand.name.toLowerCase().includes(term))
    }, [brands, search])

    const openCreateModal = () => {
        setEditingBrand(null)
        setIsFormOpen(true)
    }

    const openEditModal = (brand: Brand) => {
        setEditingBrand(brand)
        setIsFormOpen(true)
    }

    const closeFormModal = () => {
        setIsFormOpen(false)
        setEditingBrand(null)
    }

    const columns: Column<Brand>[] = [
        { header: 'Name', accessorKey: 'name' },
        { header: 'Created', cell: (brand) => formatDate(brand.createdAt) },
        {
            header: 'Actions',
            className: 'text-right',
            cell: (brand) => (
                <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => openEditModal(brand)}>
                        <Pencil className="h-4 w-4" />
                        Update
                    </Button>
                    <Button type="button" variant="destructive" size="sm" className="rounded-xl" onClick={() => setDeletingBrand(brand)}>
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
                    <h1 className="font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl">Brands</h1>
                    <p className="mt-2 text-lg text-muted-foreground">Manage your store's brands here.</p>
                </div>
                <Button className="rounded-xl" onClick={openCreateModal}>
                    <Plus className="h-4 w-4" />
                    Create Brand
                </Button>
            </div>

            <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder="Search brands..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="h-11 rounded-xl bg-background pl-9"
                />
            </div>

            <DataTable
                columns={columns}
                data={filteredBrands}
                isLoading={isLoading}
                emptyMessage="Try adjusting your search, or create your first brand."
                keyExtractor={(brand) => brand._id}
            />

            <BrandFormModal isOpen={isFormOpen} onClose={closeFormModal} brand={editingBrand} />
            <DeleteBrandDialog isOpen={Boolean(deletingBrand)} onClose={() => setDeletingBrand(null)} brand={deletingBrand} />
        </div>
    )
}
