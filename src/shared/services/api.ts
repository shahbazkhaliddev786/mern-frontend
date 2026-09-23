// @/shared/services/api.ts
const BASE_URL = '/api'

function getStoredAccessToken() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
}

function extractErrorMessage(data: unknown, fallback: string): string {
    if (data && typeof data === 'object' && 'message' in data) {
        const msg = (data as Record<string, unknown>).message
        if (typeof msg === 'string' && msg.length > 0) return msg
    }
    return fallback
}

class ApiError extends Error {
    status: number
    data?: unknown

    constructor(status: number, message: string, data?: unknown) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.data = data
    }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

    const isFormData = options.body instanceof FormData

    const headers = new Headers(options.headers || {})
    const token = getStoredAccessToken()
    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
    }
    if (!isFormData && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
    })

    // Handle non-JSON 204 No Content
    if (response.status === 204) {
        return {} as T
    }

    let responseData: unknown

    try {
        responseData = await response.json()
    } catch {
        responseData = await response.text().catch(() => null)
    }

    if (!response.ok) {
        throw new ApiError(response.status, extractErrorMessage(responseData, response.statusText), responseData)
    }

    return responseData as T
}

export const http = {
    /** GET  */
    get: <T>(endpoint: string, options: RequestInit = {}) => apiFetch<T>(endpoint, { ...options, method: 'GET' }),

    /** GET by ID  */
    getById: <T>(endpoint: string, id: string | number, options?: RequestInit) => apiFetch<T>(`${endpoint}/${id}`, { ...options, method: 'GET' }),

    /** POST  */
    post: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
        apiFetch<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
        }),

    /** PUT  */
    put: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
        apiFetch<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
        }),

    /** PATCH */
    patch: <T>(endpoint: string, body?: unknown, options?: RequestInit) =>
        apiFetch<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined
        }),

    /** DELETE */
    delete: <T>(endpoint: string, options?: RequestInit) => apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),

    /** DELETE by ID */
    deleteById: <T = void>(endpoint: string, id: string | number, options?: RequestInit) =>
        apiFetch<T>(`${endpoint}/${id}`, { ...options, method: 'DELETE' })
}

export const get = http.get
export const getById = http.getById
export const post = http.post
export const put = http.put
export const patch = http.patch
export const del = http.delete
export const deleteById = http.deleteById

export { ApiError }
