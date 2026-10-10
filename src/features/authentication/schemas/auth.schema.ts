import { z } from 'zod'

// Mirrors the backend's strongPassword rule (mern-backend/src/validations/auth.validations.ts).
const strongPassword = z
    .string()
    .min(6, { message: 'Password must be at least 6 characters long' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number' })
    .regex(/[!@#$%^&*]/, { message: 'Password must contain at least one special character (!@#$%^&*)' })

export const PASSWORD_HINT = 'At least 6 characters, with upper and lower case letters, a number and one of !@#$%^&*'

const sixDigitCode = z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: 'Enter the 6-digit code' })

export const signupSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
    email: z.string().email({ message: 'A valid email is required' }),
    password: strongPassword,
    profile: z.any().optional() // FileList
})

export type SignupFormData = z.infer<typeof signupSchema>

export const loginSchema = z.object({
    email: z.string().email({ message: 'A valid email is required' }),
    password: z.string().min(1, { message: 'Password is required' })
})

export type LoginFormData = z.infer<typeof loginSchema>

export const editProfileSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long' }).optional().or(z.literal('')),
    profile: z.any().optional()
})

export type EditProfileFormData = z.infer<typeof editProfileSchema>

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, { message: 'Current password is required' }),
        newPassword: strongPassword,
        confirmPassword: z.string()
    })
    .refine((data) => data.newPassword === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

export const changeEmailSchema = z.object({
    newEmail: z.string().trim().email({ message: 'A valid email is required' }),
    currentPassword: z.string().min(1, { message: 'Current password is required' })
})

export type ChangeEmailFormData = z.infer<typeof changeEmailSchema>

export const emailCodeSchema = z.object({
    otp: sixDigitCode
})

export type EmailCodeFormData = z.infer<typeof emailCodeSchema>

export const forgotPasswordSchema = z.object({
    email: z.string().trim().email({ message: 'A valid email is required' })
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
    .object({
        otp: sixDigitCode,
        newPassword: strongPassword,
        confirmPassword: z.string()
    })
    .refine((data) => data.newPassword === data.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
