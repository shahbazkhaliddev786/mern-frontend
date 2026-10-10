import { apiFetch, http } from '@/shared/services/api'
import type { ApiResponse } from '@/shared/types/api'
import type { AuthTokens } from '@/features/authentication/types'

export interface UserProfileData {
    id: string
    name: string
    email: string
    profile?: string // Add profile (avatar) if backend supports it
    role?: string
}

export interface ProfileResponse {
    status: string
    message: string
    data: UserProfileData
}

export interface UpdateProfileData {
    name?: string
    profile?: FileList | File
}

export interface ChangePasswordPayload {
    currentPassword: string
    newPassword: string
}

export interface RequestEmailChangePayload {
    newEmail: string
    currentPassword: string
}

export const profileService = {
    /**
     * Get the current user's profile
     * GET /v1/auth/profile
     */
    getUserProfile: async (): Promise<ProfileResponse> => {
        const raw = await apiFetch<unknown>('/v1/auth/profile', {
            method: 'GET'
        })
        return raw as ProfileResponse
    },

    /**
     * Update the current user's profile
     * PATCH /v1/auth/profile
     */
    updateProfile: async (data: UpdateProfileData): Promise<ProfileResponse> => {
        const formData = new FormData()
        if (data.name) formData.append('name', data.name)

        // Check if the user attached a file in the FileList or File
        if (data.profile) {
            if (data.profile instanceof FileList && data.profile.length > 0) {
                formData.append('profile', data.profile[0])
            } else if (data.profile instanceof File) {
                formData.append('profile', data.profile)
            }
        }

        const raw = await apiFetch<unknown>('/v1/auth/profile', {
            method: 'PATCH',
            body: formData
        })
        return raw as ProfileResponse
    },

    /**
     * Change the password (requires the current one). Signs out other devices
     * and returns fresh tokens that keep this one signed in.
     * PATCH /v1/auth/password
     */
    changePassword: (data: ChangePasswordPayload) => http.patch<ApiResponse<AuthTokens>>('/v1/auth/password', data),

    /**
     * Start an email change: emails a code to the new address
     * POST /v1/auth/email-change
     */
    requestEmailChange: (data: RequestEmailChangePayload) => http.post<ApiResponse<void>>('/v1/auth/email-change', data),

    /**
     * Finish an email change with the code sent to the new address
     * POST /v1/auth/email-change/verify
     */
    confirmEmailChange: (otp: string) => http.post<ApiResponse<{ email: string }>>('/v1/auth/email-change/verify', { otp })
}
