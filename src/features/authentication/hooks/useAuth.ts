import { useMutation } from '@tanstack/react-query'
import { authService, type ResetPasswordPayload } from '../services/auth.service'
import type { LoginDto, SignupDto } from '../types'

export const useSignup = () => {
    return useMutation({
        mutationFn: (data: SignupDto) => authService.signup(data)
    })
}

export const useLogin = () => {
    return useMutation({
        mutationFn: (data: LoginDto) => authService.login(data)
    })
}

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: (email: string) => authService.forgotPassword(email)
    })
}

export const useResetPassword = () => {
    return useMutation({
        mutationFn: (data: ResetPasswordPayload) => authService.resetPassword(data)
    })
}
