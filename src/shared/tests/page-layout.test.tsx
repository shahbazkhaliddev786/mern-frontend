import { screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import PageLayout from '@/shared/layouts/page-layout'
import { renderWithProviders } from './test-utils'

vi.mock('@/features/products/services/cart.service', () => ({
    cartService: {
        getCart: vi.fn().mockResolvedValue({
            _id: 'cart-1',
            user: 'user-1',
            items: [],
            itemsCount: 3,
            subtotal: 0,
            createdAt: '',
            updatedAt: ''
        })
    }
}))

describe('PageLayout Component', () => {
    const renderPageLayout = () => renderWithProviders(<PageLayout />)

    it('renders without crashing and includes Header, main, and Footer', () => {
        renderPageLayout()

        // Semantic HTML roles
        expect(screen.getByRole('banner')).toBeInTheDocument() // usually <header>
        expect(screen.getByRole('main')).toBeInTheDocument()
        expect(screen.getByRole('contentinfo')).toBeInTheDocument() // usually <footer>

        // Confirm Header is mounted (brand link)
        expect(screen.getAllByRole('link', { name: /Aljo Store/i }).length).toBeGreaterThan(0)

        // Confirm Footer is mounted (copyright text)
        expect(screen.getByText(/© 2026 Aljo Store/i)).toBeInTheDocument()
    })

    it('main is empty when rendered standalone (no matching child route)', () => {
        renderPageLayout()

        const main = screen.getByRole('main')
        expect(main).toBeEmptyDOMElement() // Outlet renders nothing by default in isolation
    })

    it('applies correct flex layout classes to root and main', () => {
        const { container } = renderPageLayout()

        const rootDiv = container.firstChild as HTMLElement
        expect(rootDiv).toHaveClass('min-h-screen', 'flex', 'flex-col')

        const mainElement = screen.getByRole('main')
        expect(mainElement).toHaveClass('flex-1')
    })

    it('matches snapshot (standalone)', async () => {
        const { container } = renderPageLayout()
        await waitFor(() => expect(screen.getByText('3')).toBeInTheDocument())
        expect(container).toMatchSnapshot()
    })
})
