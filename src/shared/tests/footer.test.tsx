import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'

import Footer from '../components/footer'
import { STORE_CONTACT } from '../config/store'

describe('Footer Component', () => {
    const renderFooter = () =>
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        )

    it('renders the brand name and the same contact details as the contact page', () => {
        renderFooter()
        expect(screen.getByText('Aljo Store')).toBeInTheDocument()
        expect(screen.getByText(STORE_CONTACT.email)).toBeInTheDocument()
        expect(screen.getByText(STORE_CONTACT.phone)).toBeInTheDocument()
        expect(screen.getByText(STORE_CONTACT.address)).toBeInTheDocument()
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

        // 1 brand + 4 social + 10 nav = 15
        expect(allLinks).toHaveLength(15)

        expect(screen.getAllByRole('link', { name: /Sign In|Register|My Orders|Profile/i })).toHaveLength(4)
        expect(screen.getAllByRole('link', { name: /Contact Us|Our Story/i })).toHaveLength(2)
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
