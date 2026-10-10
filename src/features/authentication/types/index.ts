export interface AuthUser {
    id: string // From the backend response
    name: string
    email: string
    profile?: string
    isVerified?: boolean
    role?: 'user' | 'admin'
}

export interface SignupDto {
    name: string
    email: string
    password?: string
    profile?: string
}

export interface LoginDto {
    email: string
    password?: string
}

export interface AuthResponse {
    accessToken: string
    refreshToken: string
    user: AuthUser
}

export type AuthTokens = Pick<AuthResponse, 'accessToken' | 'refreshToken'>
