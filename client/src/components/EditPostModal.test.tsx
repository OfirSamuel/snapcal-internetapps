import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { EditPostModal } from './EditPostModal';
import type { Meal } from '../types';

vi.mock('../lib/api', () => ({
  updatePost: vi.fn(),
}));

import { updatePost } from '../lib/api';

const baseMeal: Meal = {
  id: 'post-1',
  userId: 'user-1',
  user: {
    id: 'user-1',
    name: 'Test User',
    username: 'testuser',
    avatar: 'https://example.com/avatar.png',
  },
  imageUrl: 'http://localhost:3000/uploads/meal.jpg',
  description: 'Grilled chicken with rice',
  calories: 550,
  protein: 40,
  carbs: 60,
  fat: 12,
  likes: 5,
  comments: 2,
  isLiked: false,
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('EditPostModal', () => {
  test('does not render when isOpen is false', () => {
    const { container } = render(
      <EditPostModal isOpen={false} meal={baseMeal} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  test('renders with pre-filled values', () => {
    render(<EditPostModal isOpen={true} meal={baseMeal} onClose={vi.fn()} onSave={vi.fn()} />);

    expect(screen.getByText('Edit Post')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Grilled chicken with rice')).toBeInTheDocument();
    expect(screen.getByDisplayValue('550')).toBeInTheDocument();
    expect(screen.getByDisplayValue('40')).toBeInTheDocument();
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12')).toBeInTheDocument();
  });

  test('shows error when calories is empty', async () => {
    render(<EditPostModal isOpen={true} meal={baseMeal} onClose={vi.fn()} onSave={vi.fn()} />);

    fireEvent.change(screen.getByDisplayValue('550'), { target: { value: '' } });
    fireEvent.click(screen.getByText('Save Changes'));

    expect(await screen.findByText('Calories must be a positive number.')).toBeInTheDocument();
    expect(updatePost).not.toHaveBeenCalled();
  });

  test('calls updatePost with correct FormData on submit', async () => {
    (updatePost as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: {
        _id: 'post-1',
        description: 'Updated description',
        calories: 600,
        protein: 45,
        carbs: 55,
        fat: 15,
        imageUrl: '/uploads/meal.jpg',
      },
    });

    const onSave = vi.fn();
    render(<EditPostModal isOpen={true} meal={baseMeal} onClose={vi.fn()} onSave={onSave} />);

    fireEvent.change(screen.getByDisplayValue('Grilled chicken with rice'), {
      target: { value: 'Updated description' },
    });
    fireEvent.change(screen.getByDisplayValue('550'), { target: { value: '600' } });
    fireEvent.click(screen.getByText('Save Changes'));

    await waitFor(() => {
      expect(updatePost).toHaveBeenCalledWith('post-1', expect.any(FormData));
    });

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({ description: 'Updated description', calories: 600 })
      );
    });
  });

  test('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn();
    render(<EditPostModal isOpen={true} meal={baseMeal} onClose={onClose} onSave={vi.fn()} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  test('displays error message on API failure', async () => {
    (updatePost as ReturnType<typeof vi.fn>).mockRejectedValue({
      response: { data: { message: 'Server error' } },
    });

    render(<EditPostModal isOpen={true} meal={baseMeal} onClose={vi.fn()} onSave={vi.fn()} />);
    fireEvent.click(screen.getByText('Save Changes'));

    expect(await screen.findByText('Server error')).toBeInTheDocument();
  });
});
