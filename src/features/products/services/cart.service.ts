import { apiFetch } from '@/shared/services/api'
import type { AddToCartPayload, Cart, CartItem } from '../types'

/** Per-item quantity cap — matches the server's cart schema (mern-backend/src/validations/cart.schema.ts). */
export const MAX_CART_ITEM_QUANTITY = 99

export interface AddToCartResponse {
    message: string
    cart: Cart
}

const EMPTY_CART: Cart = {
    _id: '',
    user: '',
    items: [],
    itemsCount: 0,
    subtotal: 0,
    createdAt: '',
    updatedAt: ''
}

/**
 * Extracts cart data from any possible backend response shape.
 * Receives the FULL raw response — never pre-extract .data before calling this.
 *
 * Handles all these shapes:
 *   { status, message, data: { _id, user, items, ... } }  ← getCart / addToCart
 *   { cart: { _id, user, items, ... } }
 *   { _id, user, items, ... }                              ← direct cart object
 */
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null
}

function normalizeCartResponse(raw: unknown): Cart {
    if (!isRecord(raw)) {
        return { ...EMPTY_CART }
    }

    // Unwrap one level: data → cart → obj itself
    const cartData = raw.data ?? raw.cart ?? raw

    if (!isRecord(cartData) || !Array.isArray(cartData.items)) {
        return { ...EMPTY_CART }
    }

    return {
        _id: (cartData._id as string) ?? '',
        user: (cartData.user as string) ?? '',
        items: cartData.items as CartItem[],
        itemsCount: (cartData.itemsCount as number) ?? (cartData.totalItems as number) ?? cartData.items.length,
        subtotal: (cartData.subtotal as number) ?? 0,
        createdAt: (cartData.createdAt as string) ?? '',
        updatedAt: (cartData.updatedAt as string) ?? ''
    }
}

function extractMessage(raw: unknown, fallback: string): string {
    if (isRecord(raw) && 'message' in raw) {
        const msg = raw.message
        if (typeof msg === 'string' && msg.length > 0) return msg
    }
    return fallback
}

export const cartService = {
    /**
     * Add a product to the cart
     * POST /v1/cart  →  { status, message, data: { items, itemsCount, subtotal } }
     */
    addToCart: async (payload: AddToCartPayload): Promise<AddToCartResponse> => {
        const raw = await apiFetch<unknown>('/v1/cart', {
            method: 'POST',
            body: JSON.stringify(payload)
        })

        return {
            message: extractMessage(raw, 'Added to cart'),
            cart: normalizeCartResponse(raw)
        }
    },

    /**
     * Get the current user's cart
     * GET /v1/cart  →  { status, message, data: { _id, user, items, itemsCount, subtotal, ... } }
     */
    getCart: async (): Promise<Cart> => {
        const raw = await apiFetch<unknown>('/v1/cart', {
            cache: 'no-store'
        })
        return normalizeCartResponse(raw)
    },

    /**
     * Remove an item from the cart
     * DELETE /v1/cart/items/:productId
     */
    removeFromCart: async (productId: string): Promise<{ message: string; cart: Cart }> => {
        const raw = await apiFetch<unknown>(`/v1/cart/items/${productId}`, {
            method: 'DELETE'
        })

        return {
            message: extractMessage(raw, 'Removed from cart'),
            cart: normalizeCartResponse(raw)
        }
    },

    /**
     * Update the quantity of a cart item
     * PATCH /v1/cart/items/:productId
     */
    updateCartItem: async (productId: string, quantity: number): Promise<{ message: string; cart: Cart }> => {
        const raw = await apiFetch<unknown>(`/v1/cart/items/${productId}`, {
            method: 'PATCH',
            body: JSON.stringify({ quantity })
        })

        return {
            message: extractMessage(raw, 'Quantity updated'),
            cart: normalizeCartResponse(raw)
        }
    },

    /**
     * Clear the user's cart
     * DELETE /v1/cart
     */
    clearCart: async (): Promise<{ message: string; cart: Cart }> => {
        const raw = await apiFetch<unknown>('/v1/cart', {
            method: 'DELETE'
        })

        return {
            message: extractMessage(raw, 'Cart cleared'),
            cart: normalizeCartResponse(raw)
        }
    }
}
