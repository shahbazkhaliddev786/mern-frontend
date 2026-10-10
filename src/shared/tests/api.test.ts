import { describe, it, expect } from 'vitest'

import { ApiError, getErrorMessage } from '../services/api'

describe('getErrorMessage', () => {
    it('prefers the first field error of a validation failure', () => {
        const error = new ApiError(400, 'Validation errors', {
            success: false,
            message: 'Validation errors',
            errors: [{ field: 'otp', message: 'OTP must be 6 digits' }]
        })

        expect(getErrorMessage(error, 'fallback')).toBe('OTP must be 6 digits')
    })

    it("uses the server's message when there are no field errors", () => {
        const error = new ApiError(400, 'Current password is incorrect', { status: 'error', message: 'Current password is incorrect' })

        expect(getErrorMessage(error, 'fallback')).toBe('Current password is incorrect')
    })

    it('falls back when there is no usable message', () => {
        expect(getErrorMessage(new Error(''), 'fallback')).toBe('fallback')
        expect(getErrorMessage('not an error', 'fallback')).toBe('fallback')
    })
})
