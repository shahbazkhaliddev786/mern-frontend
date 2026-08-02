import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authService, type SignupPayload, type VerifyOtpPayload } from '../services/auth.service'
import type { AuthUser, LoginDto } from '../types'

export const signupUser = createAsyncThunk('auth/signup', async (data: SignupPayload, { rejectWithValue }) => {
    try {
        const response = await authService.signup(data)
        return response
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to sign up'
        return rejectWithValue(message)
    }
})

export const verifyOtp = createAsyncThunk('auth/verifyOtp', async (data: VerifyOtpPayload, { rejectWithValue }) => {
    try {
        const response = await authService.verifyOtp(data)
        return response.data
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to verify OTP'
        // Backend currently returns a generic 500 for thrown errors (see global error handler),
        // so surface a meaningful message for the most common failure.
        if (message === 'Internal Server Error') {
            return rejectWithValue('Invalid or expired OTP. Please try again.')
        }
        return rejectWithValue(message)
    }
})

export const resendOtp = createAsyncThunk('auth/resendOtp', async (email: string, { rejectWithValue }) => {
    try {
        await authService.resendOtp({ email })
        return true
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to resend OTP'
        if (message === 'Internal Server Error') {
            return rejectWithValue('Could not resend the code. Please try again.')
        }
        return rejectWithValue(message)
    }
})

export const loginUser = createAsyncThunk('auth/login', async (data: LoginDto, { rejectWithValue }) => {
    try {
        const response = await authService.login(data)
        return response.data
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to log in'
        if (message === 'Internal Server Error') {
            return rejectWithValue('Login failed: Please verify your email first or check your credentials.')
        }
        return rejectWithValue(message)
    }
})

interface AuthState {
    user: AuthUser | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

const getStoredToken = (key: 'accessToken' | 'refreshToken') => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
}

const initialState: AuthState = {
    user: null,
    accessToken: getStoredToken('accessToken'),
    refreshToken: getStoredToken('refreshToken'),
    isAuthenticated: Boolean(getStoredToken('accessToken')),
    isLoading: false,
    error: null
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null
            state.accessToken = null
            state.refreshToken = null
            state.isAuthenticated = false

            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Signup Cases
            .addCase(signupUser.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(signupUser.fulfilled, (state) => {
                state.isLoading = false
                // User needs to check email for OTP, they are not strictly logged in yet
            })
            .addCase(signupUser.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            // Login Cases
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user
                state.accessToken = action.payload.accessToken
                state.refreshToken = action.payload.refreshToken
                state.isAuthenticated = true

                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', action.payload.accessToken)
                    if (action.payload.refreshToken) {
                        localStorage.setItem('refreshToken', action.payload.refreshToken)
                    }
                }
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            // Verify OTP Cases (auto-login on success)
            .addCase(verifyOtp.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user
                state.accessToken = action.payload.accessToken
                state.refreshToken = action.payload.refreshToken
                state.isAuthenticated = true

                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', action.payload.accessToken)
                    if (action.payload.refreshToken) {
                        localStorage.setItem('refreshToken', action.payload.refreshToken)
                    }
                }
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            // Resend OTP Cases
            .addCase(resendOtp.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(resendOtp.fulfilled, (state) => {
                state.isLoading = false
            })
            .addCase(resendOtp.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
    }
})

export const { logout } = authSlice.actions

export default authSlice.reducer
