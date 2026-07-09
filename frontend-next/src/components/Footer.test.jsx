import { render, screen } from '@testing-library/react'
import Footer from './Footer'
import '@testing-library/jest-dom'

describe('Footer Component', () => {
    it('renders the brand name', () => {
        render(<Footer />)
        // Using a matcher function because of nested spans
        const brandName = screen.getByText((content, element) => {
            return element.tagName.toLowerCase() === 'span' && content.includes('DiaCare')
        })
        expect(brandName).toBeInTheDocument()
    })

    it('contains the slogan', () => {
        render(<Footer />)
        expect(screen.getByText(/Redonner le sourire/i)).toBeInTheDocument()
    })

    it('contains navigation links', () => {
        render(<Footer />)
        expect(screen.getByText(/À Propos/i)).toBeInTheDocument()
        expect(screen.getByText(/Services/i)).toBeInTheDocument()
    })

    it('contains contact info', () => {
        render(<Footer />)
        expect(screen.getByText(/diacarekids@gmail.com/i)).toBeInTheDocument()
    })

    it('contains copyright info', () => {
        render(<Footer />)
        expect(screen.getByText(/© 2026/i)).toBeInTheDocument()
    })
})
