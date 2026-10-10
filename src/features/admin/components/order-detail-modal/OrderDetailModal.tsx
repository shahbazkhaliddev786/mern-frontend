import { useState } from 'react'
import { ImageOff, Loader2, Pencil, Plus, Save, Trash2, X } from 'lucide-react'
import { AdminModal } from '../modal/AdminModal'
import { DeleteOrderDialog } from '../delete-order-dialog/DeleteOrderDialog'
import { useAdminOrder } from '../../hooks/useAdminOrder'
import { useUpdateOrderStatus } from '../../hooks/useUpdateOrderStatus'
import { useUpdateOrderDetails } from '../../hooks/useUpdateOrderDetails'
import { useAdminProducts } from '../../hooks/useAdminProducts'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { getOrderItemProductId, type AdminOrderShippingAddress, type OrderStatus } from '../../types/order.types'

interface OrderDetailModalProps {
    isOpen: boolean
    onClose: () => void
    orderId: string | null
    onDeleted?: () => void
}

interface EditableItem {
    product: string
    name: string
    price: number
    quantity: number
    image?: string
}

const STATUS_OPTIONS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
    pending: 'bg-muted text-muted-foreground',
    processing: 'bg-amber-100 text-amber-700',
    shipped: 'bg-blue-100 text-blue-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-destructive/10 text-destructive'
}

const EMPTY_ADDRESS: AdminOrderShippingAddress = {
    fullName: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: ''
}

function formatDate(value?: string) {
    if (!value) return '—'
    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

const inputClassName = 'h-10 rounded-lg bg-background text-sm'

export function OrderDetailModal({ isOpen, onClose, orderId, onDeleted }: OrderDetailModalProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | null>(null)
    const [loadedOrderId, setLoadedOrderId] = useState<string | null>(null)

    const [isEditing, setIsEditing] = useState(false)
    const [editAddress, setEditAddress] = useState<AdminOrderShippingAddress>(EMPTY_ADDRESS)
    const [editTax, setEditTax] = useState('0')
    const [editShipping, setEditShipping] = useState('0')
    const [editItems, setEditItems] = useState<EditableItem[]>([])
    const [newProductId, setNewProductId] = useState('')
    const [newQuantity, setNewQuantity] = useState('1')

    const { data, isLoading } = useAdminOrder(orderId)
    const order = data?.data
    const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateOrderStatus()
    const { mutate: updateDetails, isPending: isSavingDetails } = useUpdateOrderDetails()
    const { data: productsData } = useAdminProducts({ page: 1, limit: 100 })
    const availableProducts = productsData?.data.products ?? []

    // Reset the local selection whenever a different order's data has loaded
    // (adjusting state during render, per React's guidance, instead of an effect).
    if (order && order._id !== loadedOrderId) {
        setLoadedOrderId(order._id)
        setSelectedStatus(order.status)
        setIsEditing(false)
    }

    const currentSelection = selectedStatus ?? order?.status ?? 'pending'

    const handleUpdateStatus = () => {
        if (!order || currentSelection === order.status) return
        updateStatus({ orderId: order._id, status: currentSelection })
    }

    const startEditing = () => {
        if (!order) return
        setEditAddress({
            fullName: order.shippingAddress?.fullName ?? '',
            address: order.shippingAddress?.address ?? '',
            apartment: order.shippingAddress?.apartment ?? '',
            city: order.shippingAddress?.city ?? '',
            state: order.shippingAddress?.state ?? '',
            postalCode: order.shippingAddress?.postalCode ?? '',
            country: order.shippingAddress?.country ?? '',
            phone: order.shippingAddress?.phone ?? ''
        })
        setEditTax(String(order.tax))
        setEditShipping(String(order.shipping))
        setEditItems(
            order.items.map((item) => ({
                product: getOrderItemProductId(item.product),
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            }))
        )
        setNewProductId('')
        setNewQuantity('1')
        setIsEditing(true)
    }

    const cancelEditing = () => setIsEditing(false)

    const updateItemQuantity = (product: string, quantity: number) => {
        if (quantity < 1) return
        setEditItems((items) => items.map((item) => (item.product === product ? { ...item, quantity } : item)))
    }

    const removeItem = (product: string) => {
        setEditItems((items) => items.filter((item) => item.product !== product))
    }

    const addItem = () => {
        if (!newProductId) return
        const product = availableProducts.find((p) => p._id === newProductId)
        if (!product) return
        if (editItems.some((item) => item.product === newProductId)) return

        const quantity = Math.max(1, Number(newQuantity) || 1)
        setEditItems((items) => [
            ...items,
            {
                product: product._id,
                name: product.name,
                price: product.price,
                quantity,
                image: product.images?.[0]
            }
        ])
        setNewProductId('')
        setNewQuantity('1')
    }

    const displayItems: EditableItem[] = isEditing
        ? editItems
        : (order?.items.map((item) => ({
              product: getOrderItemProductId(item.product),
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image: item.image
          })) ?? [])

    const editSubtotal = editItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const editTaxValue = Number(editTax) || 0
    const editShippingValue = Number(editShipping) || 0
    const editTotal = editSubtotal + editTaxValue + editShippingValue

    const handleSave = () => {
        if (!order || editItems.length === 0) return

        updateDetails(
            {
                orderId: order._id,
                updates: {
                    shippingAddress: editAddress,
                    tax: editTaxValue,
                    shipping: editShippingValue,
                    items: editItems.map((item) => ({ product: item.product, quantity: item.quantity }))
                }
            },
            { onSuccess: () => setIsEditing(false) }
        )
    }

    return (
        <>
            <AdminModal isOpen={isOpen} onClose={onClose} title={order ? `Order #${order._id.slice(-8)}` : 'Order'} maxWidth="2xl">
                {isLoading ? (
                    <div className="flex min-h-[200px] items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : !order ? (
                    <div className="flex min-h-[200px] items-center justify-center text-center text-muted-foreground">Order not found.</div>
                ) : (
                    <div className="space-y-5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <p className="font-semibold text-foreground">{order.user?.name ?? 'Unknown customer'}</p>
                                <p className="text-sm text-muted-foreground">{order.user?.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_BADGE_CLASSES[order.status] ?? 'bg-muted text-muted-foreground'}`}>
                                    {order.status}
                                </span>
                                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize text-muted-foreground">
                                    Payment: {order.paymentStatus}
                                </span>
                            </div>
                        </div>

                        {/* Shipping address */}
                        <div className="rounded-2xl border border-border p-4 text-sm">
                            <p className="font-semibold text-foreground">Shipping Address</p>
                            {isEditing ? (
                                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1 sm:col-span-2">
                                        <Label className="text-xs">Full name</Label>
                                        <Input
                                            value={editAddress.fullName}
                                            onChange={(e) => setEditAddress((a) => ({ ...a, fullName: e.target.value }))}
                                            className={inputClassName}
                                        />
                                    </div>
                                    <div className="space-y-1 sm:col-span-2">
                                        <Label className="text-xs">Address</Label>
                                        <Input
                                            value={editAddress.address}
                                            onChange={(e) => setEditAddress((a) => ({ ...a, address: e.target.value }))}
                                            className={inputClassName}
                                        />
                                    </div>
                                    <div className="space-y-1 sm:col-span-2">
                                        <Label className="text-xs">Apartment, suite, etc.</Label>
                                        <Input
                                            value={editAddress.apartment}
                                            onChange={(e) => setEditAddress((a) => ({ ...a, apartment: e.target.value }))}
                                            className={inputClassName}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">City</Label>
                                        <Input
                                            value={editAddress.city}
                                            onChange={(e) => setEditAddress((a) => ({ ...a, city: e.target.value }))}
                                            className={inputClassName}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">State / province</Label>
                                        <Input
                                            value={editAddress.state}
                                            onChange={(e) => setEditAddress((a) => ({ ...a, state: e.target.value }))}
                                            className={inputClassName}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Postal code</Label>
                                        <Input
                                            value={editAddress.postalCode}
                                            onChange={(e) => setEditAddress((a) => ({ ...a, postalCode: e.target.value }))}
                                            className={inputClassName}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Country</Label>
                                        <Input
                                            value={editAddress.country}
                                            onChange={(e) => setEditAddress((a) => ({ ...a, country: e.target.value }))}
                                            className={inputClassName}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Phone</Label>
                                        <Input
                                            value={editAddress.phone}
                                            onChange={(e) => setEditAddress((a) => ({ ...a, phone: e.target.value }))}
                                            className={inputClassName}
                                        />
                                    </div>
                                </div>
                            ) : order.shippingAddress ? (
                                <p className="mt-1 text-muted-foreground">
                                    {order.shippingAddress.fullName}
                                    <br />
                                    {order.shippingAddress.address}
                                    {order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}, {order.shippingAddress.city}
                                    {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ''}
                                    {order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ''}
                                    <br />
                                    {order.shippingAddress.country}
                                    {order.shippingAddress.phone ? ` · ${order.shippingAddress.phone}` : ''}
                                </p>
                            ) : (
                                <p className="mt-1 text-muted-foreground">No shipping address on file.</p>
                            )}
                        </div>

                        {/* Items */}
                        <div className="overflow-x-auto">
                            <table className="w-full whitespace-nowrap text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border text-muted-foreground">
                                        <th className="pb-2 pr-4 font-semibold">Product</th>
                                        <th className="pb-2 pr-4 font-semibold">Price</th>
                                        <th className="pb-2 pr-4 font-semibold">Qty</th>
                                        <th className="pb-2 pr-4 font-semibold">Total</th>
                                        {isEditing && <th className="pb-2 font-semibold" />}
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayItems.map((item) => (
                                        <tr key={item.product} className="border-b border-border last:border-0">
                                            <td className="py-3 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                        {item.image ? (
                                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                                                                <ImageOff className="h-5 w-5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-foreground">{item.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">${item.price}</td>
                                            <td className="py-3 pr-4 text-muted-foreground">
                                                {isEditing ? (
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItemQuantity(item.product, Number(e.target.value))}
                                                        className="h-9 w-20 rounded-lg bg-background text-sm"
                                                    />
                                                ) : (
                                                    item.quantity
                                                )}
                                            </td>
                                            <td className="py-3 pr-4 font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</td>
                                            {isEditing && (
                                                <td className="py-3">
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => removeItem(item.product)}
                                                        aria-label="Remove item">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {isEditing && (
                                <div className="mt-3 flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-border p-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Add product</Label>
                                        <select
                                            value={newProductId}
                                            onChange={(e) => setNewProductId(e.target.value)}
                                            className="h-10 rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                                            <option value="">Select a product</option>
                                            {availableProducts
                                                .filter((p) => !editItems.some((item) => item.product === p._id))
                                                .map((p) => (
                                                    <option key={p._id} value={p._id}>
                                                        {p.name} (${p.price})
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Qty</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={newQuantity}
                                            onChange={(e) => setNewQuantity(e.target.value)}
                                            className="h-10 w-20 rounded-lg bg-background text-sm"
                                        />
                                    </div>
                                    <Button type="button" variant="outline" className="rounded-lg" onClick={addItem} disabled={!newProductId}>
                                        <Plus className="h-4 w-4" />
                                        Add item
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="space-y-1 border-t border-border pt-4 text-sm">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Subtotal</span>
                                <span>${(isEditing ? editSubtotal : order.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Tax</span>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editTax}
                                        onChange={(e) => setEditTax(e.target.value)}
                                        className="h-9 w-28 rounded-lg bg-background text-right text-sm"
                                    />
                                ) : (
                                    <span>${order.tax.toFixed(2)}</span>
                                )}
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>Shipping</span>
                                {isEditing ? (
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editShipping}
                                        onChange={(e) => setEditShipping(e.target.value)}
                                        className="h-9 w-28 rounded-lg bg-background text-right text-sm"
                                    />
                                ) : (
                                    <span>${order.shipping.toFixed(2)}</span>
                                )}
                            </div>
                            <div className="flex justify-between text-base font-bold text-foreground">
                                <span>Total</span>
                                <span>${(isEditing ? editTotal : order.total).toFixed(2)}</span>
                            </div>
                            <p className="pt-1 text-xs text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="rounded-xl"
                                            onClick={cancelEditing}
                                            disabled={isSavingDetails}>
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </Button>
                                        <Button
                                            type="button"
                                            className="rounded-xl"
                                            onClick={handleSave}
                                            disabled={isSavingDetails || editItems.length === 0}>
                                            {isSavingDetails ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            Save Changes
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button type="button" variant="outline" className="rounded-xl" onClick={startEditing}>
                                            <Pencil className="h-4 w-4" />
                                            Edit Order
                                        </Button>
                                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => setIsDeleteDialogOpen(true)}>
                                            <Trash2 className="h-4 w-4" />
                                            Delete Order
                                        </Button>
                                    </>
                                )}
                            </div>

                            {!isEditing && (
                                <div className="flex items-center gap-2">
                                    <select
                                        value={currentSelection}
                                        onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}
                                        disabled={isUpdatingStatus}
                                        className="h-11 rounded-xl border border-input bg-background px-3 text-sm capitalize text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                                        {STATUS_OPTIONS.map((status) => (
                                            <option key={status} value={status} className="capitalize">
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        type="button"
                                        className="rounded-xl"
                                        disabled={isUpdatingStatus || currentSelection === order.status}
                                        onClick={handleUpdateStatus}>
                                        {isUpdatingStatus ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Update Status
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </AdminModal>

            <DeleteOrderDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                orderId={order?._id ?? null}
                onDeleted={() => {
                    onClose()
                    onDeleted?.()
                }}
            />
        </>
    )
}
