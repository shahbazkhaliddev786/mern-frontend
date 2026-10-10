import { describe, it, expect, beforeEach } from 'vitest'

import reducer, { setTokens, updateUser } from '../slices/auth-slice'

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
