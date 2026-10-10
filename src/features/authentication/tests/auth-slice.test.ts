import { describe, it, expect, beforeEach, vi } from 'vitest'
import { configureStore } from '@reduxjs/toolkit'

import reducer, { loginUser, setTokens, updateUser } from '../slices/auth-slice'
import { authService } from '../services/auth.service'
import { ApiError } from '@/shared/services/api'

describe('loginUser', () => {
    const makeStore = () => configureStore({ reducer: { auth: reducer } })

    it('flags an unverified account so the page can open the code step, without an error banner', async () => {
        const message = 'Please verify your email first. We sent a new code to your email address.'
        vi.spyOn(authService, 'login').mockRejectedValueOnce(
            new ApiError(403, message, { status: 'error', message, data: { needsVerification: true } })
        )
        const store = makeStore()

        const result = await store.dispatch(loginUser({ email: 'jane@example.com', password: 'Old-pass1!' }))

        expect(result.payload).toEqual({ message, needsVerification: true })
        expect(store.getState().auth.error).toBeNull()
    })

    it('reports other failures as an error message', async () => {
        vi.spyOn(authService, 'login').mockRejectedValueOnce(new ApiError(500, 'Invalid credentials', { message: 'Invalid credentials' }))
        const store = makeStore()

        await store.dispatch(loginUser({ email: 'jane@example.com', password: 'wrong' }))

        expect(store.getState().auth.error).toBe('Invalid credentials')
    })
})

const signedIn = {
    user: { id: 'user-1', name: 'Jane', email: 'jane@example.com', profile: 'https://example.com/jane.png' },
    accessToken: 'old-access',
    refreshToken: 'old-refresh',
    isAuthenticated: true,
    isLoading: false,
    error: null
}

describe('auth slice', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('merges profile and email changes into the signed-in user', () => {
        const state = reducer(signedIn, updateUser({ email: 'jane.new@example.com' }))

        expect(state.user).toEqual({ ...signedIn.user, email: 'jane.new@example.com' })
    })

    it('ignores user updates when no user is loaded (e.g. after a page reload)', () => {
        const state = reducer({ ...signedIn, user: null }, updateUser({ name: 'Jane' }))

        expect(state.user).toBeNull()
    })

    it('stores a fresh token pair in state and localStorage', () => {
        const state = reducer(signedIn, setTokens({ accessToken: 'new-access', refreshToken: 'new-refresh' }))

        expect(state).toMatchObject({ accessToken: 'new-access', refreshToken: 'new-refresh', isAuthenticated: true })
        expect(localStorage.getItem('accessToken')).toBe('new-access')
        expect(localStorage.getItem('refreshToken')).toBe('new-refresh')
    })
})
