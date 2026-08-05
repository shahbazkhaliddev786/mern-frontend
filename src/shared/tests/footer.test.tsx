import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import Footer from '../components/footer'

describe('Footer Component', () => {
    const renderFooter = () =>
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        )

    it('renders the brand name and address correctly', () => {
        renderFooter()
        expect(screen.getByText('Aljo Store')).toBeInTheDocument()
        expect(screen.getByText(/877 The Bronx, NY/i)).toBeInTheDocument()
    })

    it('renders all section headings', () => {
        renderFooter()
        expect(screen.getByText('My Account')).toBeInTheDocument()
        expect(screen.getByText('Help')).toBeInTheDocument()
        expect(screen.getByText('Shop')).toBeInTheDocument()
    })

    it('renders correct number of navigation links in each section', () => {
        renderFooter()

        const allLinks = screen.getAllByRole('link')

        // 1 brand + 4 social + 12 nav = 17
        expect(allLinks).toHaveLength(17)

        expect(screen.getAllByRole('link', { name: /Sign In|Register|My Orders|Profile/i })).toHaveLength(4)
        expect(screen.getAllByRole('link', { name: /Contact Us|Shipping & Returns|FAQ|Size Guide/i })).toHaveLength(4)
        expect(screen.getAllByRole('link', { name: /All Products|New Arrivals|Best Sellers|Your Cart/i })).toHaveLength(4)
    })

    it('renders the copyright notice with current year', () => {
        renderFooter()
        expect(screen.getByText(/© 2026 Aljo Store\. All rights reserved\./i)).toBeInTheDocument()
    })

    it('matches snapshot', () => {
        const { container } = renderFooter()
        expect(container).toMatchSnapshot()
    })
})
