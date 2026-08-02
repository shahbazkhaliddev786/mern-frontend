import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks'
import { fetchProducts } from '@/features/products/slices/products-slice'
import HeroCarousel from '@/features/aljo-store/components/hero-carousel'
import ExploreCategorySection from '@/features/aljo-store/components/explore-category-section'
import PopularProductsSection from '@/features/aljo-store/components/popular-products-section'
import SpecialPackageSection from '@/features/aljo-store/components/special-package-section'
import OurCreationSection from '@/features/aljo-store/components/our-creation-section'
import BenefitsSection from '@/features/aljo-store/components/benefits-section'
import TestimonialsSection from '@/features/aljo-store/components/testimonials-section'
import NewsletterSection from '@/features/aljo-store/components/newsletter-section'

export default function HomePage() {
    const dispatch = useAppDispatch()
    const { items } = useAppSelector((state) => state.products)

    // Load products once so all data-driven sections share the store.
    useEffect(() => {
        if (items.length === 0) {
            dispatch(fetchProducts())
        }
    }, [dispatch, items.length])

    return (
        <>
            <HeroCarousel />
            <ExploreCategorySection />
            <PopularProductsSection />
            <SpecialPackageSection />
            <OurCreationSection />
            <BenefitsSection />
            <TestimonialsSection />
            <NewsletterSection />
        </>
    )
}
