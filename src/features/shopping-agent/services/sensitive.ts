// Card numbers and credentials are stopped in the browser before a message is sent (backend
// spec 016), so they never leave the customer's device. A copy of the backend's patterns
// (mern-backend src/agent/guard.ts), which stays as the backstop; keep the two in step.

export const SENSITIVE_HINT = "For your security, don't share card numbers or passwords here. Payment happens only on Stripe's checkout page."

const CARD = /(?<![\w-])[2-6](?:[ -]?\d){12,18}(?![\w-])/g

const CREDENTIALS = [
    /\beyJ[\w-]{8,}\.[\w-]{8,}\.[\w-]{8,}/,
    /\b[rs]k_(?:live|test)_[A-Za-z0-9]{8,}/,
    /\b(?:password|passwd|pwd)\s*(?:is|:|=)\s*(?=\S*\d)\S{6,}/i
]

function passesLuhn(digits: string): boolean {
    let sum = 0
    for (let i = 0; i < digits.length; i++) {
        let digit = Number(digits[digits.length - 1 - i])
        if (i % 2 === 1) {
            digit *= 2
            if (digit > 9) digit -= 9
        }
        sum += digit
    }
    return sum % 10 === 0
}

/** True when the text holds a card number or a credential. */
export function containsSensitive(text: string): boolean {
    for (const match of text.matchAll(CARD)) {
        const digits = match[0].replace(/\D/g, '')
        if (digits.length >= 13 && digits.length <= 19 && passesLuhn(digits)) return true
    }
    return CREDENTIALS.some((pattern) => pattern.test(text))
}
