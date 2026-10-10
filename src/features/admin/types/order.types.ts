export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed'

export interface AdminOrderUser {
    _id: string
    name: string
    email: string
}

export interface AdminOrderSummary {
    _id: string
    user: AdminOrderUser
    status: OrderStatus
    paymentStatus: PaymentStatus
    total: number
    itemsCount: number
    createdAt: string
}

export interface AdminOrderItemProduct {
    _id: string
    name?: string
    price?: number
    images?: string[]
}

export interface AdminOrderItem {
    _id: string
    // The backend's getOrderById populates this field, so it arrives as an
    // object — it is never a plain string on read. Use `getOrderItemProductId`
    // to extract the id safely.
    product: string | AdminOrderItemProduct
    name: string
    price: number
    quantity: number
    image?: string
}

export function getOrderItemProductId(product: AdminOrderItem['product']): string {
    return typeof product === 'string' ? product : product._id
}

export interface AdminOrderShippingAddress {
    fullName: string
    address: string
    apartment?: string
    city: string
    state?: string
    postalCode?: string
    country?: string
    phone?: string
}

export interface AdminOrderDetail {
    _id: string
    user: AdminOrderUser
    items: AdminOrderItem[]
    subtotal: number
    tax: number
    shipping: number
    total: number
    status: OrderStatus
    paymentStatus: PaymentStatus
    paymentMethod: 'stripe' | 'cod'
    shippingAddress: AdminOrderShippingAddress
    createdAt: string
    updatedAt: string
}
