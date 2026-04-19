import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { MealCard } from './MealCard';
import type { Meal } from '../types';

const baseMeal: Meal = {
  id: 'meal-1',
  userId: 'user-1',
  user: {
    id: 'user-1',
    name: 'Test User',
    username: '@testuser',
    avatar: 'https://example.com/avatar.png',
  },
  imageUrl: 'https://example.com/meal.jpg',
  description: 'Grilled chicken with rice',
  calories: 550,
  protein: 40,
  carbs: 60,
  fat: 12,
  likes: 10,
  comments: 3,
  isLiked: false,
  createdAt: new Date().toISOString(),
};

describe('MealCard', () => {
  test('renders user avatar, name, and username', () => {
    render(<MealCard meal={baseMeal} onLike={vi.fn()} onCommentClick={vi.fn()} />);

    expect(screen.getByText('Test User')).toBeInTheDocument();
    // Username appears in header and description
    const usernameEls = screen.getAllByText('@testuser');
    expect(usernameEls.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByAltText('Test User')).toHaveAttribute('src', baseMeal.user.avatar);
  });

  test('renders meal image and description', () => {
    render(<MealCard meal={baseMeal} onLike={vi.fn()} onCommentClick={vi.fn()} />);

    expect(screen.getByAltText('Grilled chicken with rice')).toHaveAttribute('src', baseMeal.imageUrl);
    expect(screen.getByText('Grilled chicken with rice')).toBeInTheDocument();
  });

  test('renders calorie count and macro breakdown', () => {
    render(<MealCard meal={baseMeal} onLike={vi.fn()} onCommentClick={vi.fn()} />);

    expect(screen.getByText('550')).toBeInTheDocument();
    expect(screen.getByText('40g')).toBeInTheDocument();
    expect(screen.getByText('60g')).toBeInTheDocument();
    expect(screen.getByText('12g')).toBeInTheDocument();
  });

  test('toggles like state on click', () => {
    const onLike = vi.fn();
    render(<MealCard meal={baseMeal} onLike={onLike} onCommentClick={vi.fn()} />);

    fireEvent.click(screen.getByText('10'));
    expect(onLike).toHaveBeenCalledWith('meal-1');
  });

  test('calls onCommentClick with correct post ID', () => {
    const onComment = vi.fn();
    render(<MealCard meal={baseMeal} onLike={vi.fn()} onCommentClick={onComment} />);

    fireEvent.click(screen.getByText('3'));
    expect(onComment).toHaveBeenCalledWith('meal-1');
  });

  test('does not render macros when not provided', () => {
    const mealNoMacros: Meal = { ...baseMeal, protein: undefined, carbs: undefined, fat: undefined };
    render(<MealCard meal={mealNoMacros} onLike={vi.fn()} onCommentClick={vi.fn()} />);

    expect(screen.queryByText('P:')).not.toBeInTheDocument();
  });
});
