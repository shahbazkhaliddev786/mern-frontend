import { http } from '@/shared/services/api'
import type { ApiResponse } from '@/shared/types/api'
import type { AuthResponse, LoginDto } from '../types'

export interface SignupPayload {
    name: string
    email: string
    password?: string
    profile?: FileList | string
}

export interface VerifyOtpPayload {
    email: string
    otp: string
}

export interface ResendOtpPayload {
    email: string
}

export const authService = {
    /**
     * Register a new user
     */
    signup: (data: SignupPayload) => {
        const formData = new FormData()
        formData.append('name', data.name)
        formData.append('email', data.email)
        if (data.password) formData.append('password', data.password)

        // Check if the user attached a file in the FileList
        if (data.profile && data.profile.length > 0) {
            formData.append('profile', data.profile[0])
        }

        return http.post<ApiResponse<void>>('/v1/auth/register', formData)
    },

    /**
     * Login an existing user
     */
    login: (data: LoginDto) => http.post<ApiResponse<AuthResponse>>('/v1/auth/login', data),

    /**
     * Verify the email OTP and complete registration (logs the user in)
     */
    verifyOtp: (data: VerifyOtpPayload) => http.post<ApiResponse<AuthResponse>>('/v1/auth/verify-otp', data),

    /**
     * Resend a fresh verification OTP to the user's email
     */
    resendOtp: (data: ResendOtpPayload) => http.post<ApiResponse<void>>('/v1/auth/resend-otp', data)
}
