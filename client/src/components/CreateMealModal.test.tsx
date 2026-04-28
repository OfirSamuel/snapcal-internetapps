import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CreateMealModal } from './CreateMealModal';
import { estimateCalories } from '../lib/aiAnalyzer';

// Mock the API module
vi.mock('../lib/api', () => ({
  createPost: vi.fn(),
  default: { get: vi.fn(), post: vi.fn() },
}));

// Mock the AI analyzer
vi.mock('../lib/aiAnalyzer', () => ({
  estimateCalories: vi.fn(() =>
    Promise.resolve({
      calories: 500,
      protein: 35,
      carbs: 50,
      fat: 15,
    })
  ),
}));

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onSubmit: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('CreateMealModal', () => {
  test('does not render when isOpen is false', () => {
    const { container } = render(
      <CreateMealModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  test('renders form elements when isOpen is true', () => {
    render(<CreateMealModal {...defaultProps} />);

    expect(screen.getByText('Create Meal')).toBeInTheDocument();
    expect(screen.getByText('Meal Photo')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Upload Photo')).toBeInTheDocument();
    expect(screen.getByText(/Analyze with AI/i)).toBeInTheDocument();
    expect(screen.getByText('Publish to Feed')).toBeInTheDocument();
  });

  test('enables Analyze with AI only when description is present', () => {
    render(<CreateMealModal {...defaultProps} />);

    const analyzeButton = screen.getByText(/Analyze with AI/i).closest('button')!;
    expect(analyzeButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText(/Grilled chicken/i);
    fireEvent.change(textarea, { target: { value: 'Chicken salad' } });

    expect(analyzeButton).not.toBeDisabled();
  });

  test('displays AI calorie/macro estimate after analysis', async () => {
    render(<CreateMealModal {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/Grilled chicken/i);
    fireEvent.change(textarea, { target: { value: 'Chicken salad' } });

    const analyzeButton = screen.getByText(/Analyze with AI/i).closest('button')!;
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText(/500/)).toBeInTheDocument();
      expect(screen.getByText(/35g/)).toBeInTheDocument();
    });
  });

  test('publish button is disabled until image, description, and analysis are present', () => {
    render(<CreateMealModal {...defaultProps} />);

    const publishButton = screen.getByText('Publish to Feed');
    expect(publishButton).toBeDisabled();
  });

  test('calls onClose when X button is clicked', () => {
    const onClose = vi.fn();
    render(<CreateMealModal isOpen={true} onClose={onClose} onSubmit={vi.fn()} />);

    // The X button is inside the header
    const closeButtons = screen.getByText('Create Meal').parentElement!.querySelectorAll('button');
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  test('displays error message when AI analysis fails', async () => {
    vi.mocked(estimateCalories).mockRejectedValueOnce(new Error('Network Error'));

    render(<CreateMealModal {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(/Grilled chicken/i);
    fireEvent.change(textarea, { target: { value: 'Some meal' } });

    const analyzeButton = screen.getByText(/Analyze with AI/i).closest('button')!;
    fireEvent.click(analyzeButton);

    await waitFor(() => {
      expect(screen.getByText('AI analysis failed. Please try again.')).toBeInTheDocument();
    });
  });
});
