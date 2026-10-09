import { Minus, Plus } from 'lucide-react'
import { useUpdateCartItem } from '../hooks/useUpdateCartItem'
import { MAX_CART_ITEM_QUANTITY } from '../services/cart.service'

interface CartItemQuantityProps {
    productId: string
    currentQuantity: number
    stock: number
}

export default function CartItemQuantity({ productId, currentQuantity, stock }: CartItemQuantityProps) {
    const updateMutation = useUpdateCartItem()
    const maxQuantity = Math.min(stock, MAX_CART_ITEM_QUANTITY)

    const handleQuantityChange = (newQuantity: number) => {
        if (newQuantity > 0 && newQuantity <= maxQuantity) {
            updateMutation.mutate({ productId, quantity: newQuantity })
        }
    }

    const canDecrement = currentQuantity > 1
    const canIncrement = currentQuantity < maxQuantity

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => handleQuantityChange(currentQuantity - 1)}
                disabled={!canDecrement || updateMutation.isPending}
                className="rounded-md border border-border p-1 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Decrease quantity">
                <Minus className="h-4 w-4" />
            </button>

            <input
                type="number"
                value={currentQuantity}
                onChange={(e) => {
                    const value = parseInt(e.target.value, 10)
                    if (!isNaN(value)) {
                        handleQuantityChange(value)
                    }
                }}
                disabled={updateMutation.isPending}
                className="w-12 border border-border rounded-md text-center py-1 px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                min="1"
                max={maxQuantity}
            />

            <button
                onClick={() => handleQuantityChange(currentQuantity + 1)}
                disabled={!canIncrement || updateMutation.isPending}
                className="rounded-md border border-border p-1 hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Increase quantity">
                <Plus className="h-4 w-4" />
            </button>
        </div>
    )
}
