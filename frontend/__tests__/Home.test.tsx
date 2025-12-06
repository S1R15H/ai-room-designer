import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home Page', () => {
    it('renders the main title', () => {
        render(<Home />)
        const heading = screen.getByRole('heading', { level: 1 })
        expect(heading).toBeInTheDocument()
        expect(heading).toHaveTextContent('Room Designer')
    })

    it('renders the upload area', () => {
        render(<Home />)
        const uploadText = screen.getByText(/click to upload/i)
        expect(uploadText).toBeInTheDocument()
    })
})
