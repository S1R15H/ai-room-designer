import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Wizard from '../components/Wizard'

// Mock the Upload component since it uses drag-and-drop which is hard to test in JSDOM
jest.mock('../components/Upload', () => {
    return function MockUpload({ onNext }: { onNext: () => void }) {
        return (
            <div>
                <h1>Upload Step</h1>
                <button onClick={onNext}>Next Step</button>
            </div>
        )
    }
})

describe('Wizard Component', () => {
    it('renders the initial upload step', () => {
        render(<Wizard />)
        expect(screen.getByText('Upload Step')).toBeInTheDocument()
    })

    it('navigates to the next step', () => {
        render(<Wizard />)

        // Click next on the mocked upload step
        fireEvent.click(screen.getByText('Next Step'))

        // Should verify we are on the Style step
        expect(screen.getByText(/Which design style resonates with you most?/i)).toBeInTheDocument()
    })
})
