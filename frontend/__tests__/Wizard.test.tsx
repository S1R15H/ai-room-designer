import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import Wizard from '../components/Wizard';

// Mock API functions
jest.mock('../lib/api', () => ({
  initSession: jest.fn().mockResolvedValue({
    thread_id: 'test-thread-id',
    original_url: 'http://test.com/original.jpg',
  }),
  getSessionHistory: jest.fn().mockResolvedValue({
    original_url: 'http://test.com/original.jpg',
    generated_url: 'http://test.com/generated.jpg',
    items: [],
  }),
  generateRoomDesign: jest.fn(),
}));

jest.mock('../components/Upload', () => {
  return function MockUpload({
    onNext,
    onFileSelect,
  }: {
    onNext: () => void;
    onFileSelect: (file: File) => void;
  }) {
    return (
      <div>
        <h1>Upload Step</h1>
        <button
          onClick={() =>
            onFileSelect(
              new File(['(⌐□_□)'], 'test.png', { type: 'image/png' })
            )
          }
        >
          Select File
        </button>
        <button onClick={onNext}>Next Step</button>
      </div>
    );
  };
});

describe('Wizard Component', () => {
  it('renders the initial upload step', () => {
    render(<Wizard />);
    expect(screen.getByText('Upload Step')).toBeInTheDocument();
  });

  it('navigates to the next step', async () => {
    render(<Wizard />);

    // Click select file first to set the file state
    fireEvent.click(screen.getByText('Select File'));

    // Click next on the mocked upload step
    fireEvent.click(screen.getByText('Next Step'));

    // Should verify we are on the Style step
    expect(
      await screen.findByText(/Which design style resonates with you most?/i)
    ).toBeInTheDocument();
  });
});
