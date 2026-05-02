import type { ReactElement } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { CreateMealModal } from './CreateMealModal';
import { AuthProvider } from '../context/AuthContext';
import { estimateCaloriesFromImage } from '../lib/aiAnalyzer';

vi.mock('../lib/api', () => ({
  createPost: vi.fn(() =>
    Promise.resolve({
      data: {
        _id: 'new-post-1',
        imageUrl: '/uploads/x.jpg',
        description: 'Test Meal',
        calories: 500,
        createdAt: new Date().toISOString(),
      },
    })
  ),
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('../lib/aiAnalyzer', () => ({
  estimateCaloriesFromImage: vi.fn(() =>
    Promise.resolve({
      mealName: 'Test Meal',
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

const renderModal = (ui: ReactElement) => render(<AuthProvider>{ui}</AuthProvider>);

function uploadMealPhoto(container: HTMLElement) {
  const input = container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(['fake'], 'meal.jpg', { type: 'image/jpeg' });
  fireEvent.change(input, { target: { files: [file] } });
}

describe('CreateMealModal', () => {
  test('does not render when isOpen is false', () => {
    const { container } = renderModal(
      <CreateMealModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(container.innerHTML).toBe('');
  });

  test('renders form elements when isOpen is true', () => {
    renderModal(<CreateMealModal {...defaultProps} />);

    expect(screen.getByText('Create Meal')).toBeInTheDocument();
    expect(screen.getByText('Meal Photo')).toBeInTheDocument();
    expect(screen.getByText('Upload a meal photo to scan')).toBeInTheDocument();
    expect(screen.getByText('Publish to Feed')).toBeInTheDocument();
  });

  test('displays AI estimate after photo upload', async () => {
    const { container } = renderModal(<CreateMealModal {...defaultProps} />);

    uploadMealPhoto(container);

    await waitFor(() => {
      expect(screen.getByText('Test Meal')).toBeInTheDocument();
      expect(screen.getByText('500 kcal')).toBeInTheDocument();
      expect(screen.getByText(/35g/)).toBeInTheDocument();
    });
  });

  test('publish button is disabled until image is analyzed', () => {
    const { container } = renderModal(<CreateMealModal {...defaultProps} />);

    const publishButton = screen.getByText('Publish to Feed');
    expect(publishButton).toBeDisabled();

    uploadMealPhoto(container);

    return waitFor(() => {
      expect(publishButton).not.toBeDisabled();
    });
  });

  test('calls onClose when X button is clicked', () => {
    const onClose = vi.fn();
    renderModal(<CreateMealModal isOpen={true} onClose={onClose} onSubmit={vi.fn()} />);

    const closeButtons = screen.getByText('Create Meal').parentElement!.querySelectorAll('button');
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalled();
  });

  test('displays error message when AI analysis fails', async () => {
    vi.mocked(estimateCaloriesFromImage).mockRejectedValueOnce(new Error('Network Error'));

    const { container } = renderModal(<CreateMealModal {...defaultProps} />);

    uploadMealPhoto(container);

    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
      expect(screen.getByText('Retry analysis')).toBeInTheDocument();
    });
  });
});
