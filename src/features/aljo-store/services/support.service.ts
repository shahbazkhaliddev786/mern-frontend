import { http } from '@/shared/services/api'
import type { ApiResponse } from '@/shared/types/api'

export interface SupportRequestPayload {
    name: string
    email: string
    subject: string
    message: string
}

export const supportService = {
    /**
     * Send a message to the support inbox
     * POST /v1/support — when signed in, the server uses the account's name and email instead of the payload's
     */
    submit: (payload: SupportRequestPayload) => http.post<ApiResponse<void>>('/v1/support', payload)
}
