import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { RecipeDetailModal } from './RecipeDetailModal';
import type { Recipe } from '../types';

const recipe: Recipe = {
  title: 'Quinoa Power Bowl',
  calories: 420,
  cookTime: '20 min',
  protein: 28,
  carbs: 45,
  fat: 14,
  ingredients: ['1 cup quinoa', '200g chicken breast', '1 avocado', 'Mixed greens'],
  instructions: ['Cook quinoa according to package', 'Grill chicken until done', 'Slice avocado', 'Assemble bowl with all ingredients'],
};

describe('RecipeDetailModal', () => {
  test('renders recipe title and macros', () => {
    render(<RecipeDetailModal recipe={recipe} onClose={() => {}} />);

    expect(screen.getByText('Quinoa Power Bowl')).toBeInTheDocument();
    expect(screen.getByText('420')).toBeInTheDocument();
    expect(screen.getByText('28')).toBeInTheDocument();
    expect(screen.getByText('45')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('20 min')).toBeInTheDocument();
  });

  test('renders all ingredients', () => {
    render(<RecipeDetailModal recipe={recipe} onClose={() => {}} />);

    expect(screen.getByText('1 cup quinoa')).toBeInTheDocument();
    expect(screen.getByText('200g chicken breast')).toBeInTheDocument();
    expect(screen.getByText('1 avocado')).toBeInTheDocument();
    expect(screen.getByText('Mixed greens')).toBeInTheDocument();
  });

  test('renders all instructions', () => {
    render(<RecipeDetailModal recipe={recipe} onClose={() => {}} />);

    expect(screen.getByText('Cook quinoa according to package')).toBeInTheDocument();
    expect(screen.getByText('Grill chicken until done')).toBeInTheDocument();
    expect(screen.getByText('Slice avocado')).toBeInTheDocument();
    expect(screen.getByText('Assemble bowl with all ingredients')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(<RecipeDetailModal recipe={recipe} onClose={handleClose} />);

    fireEvent.click(screen.getByLabelText('Close'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  test('calls onClose when overlay is clicked', () => {
    const handleClose = vi.fn();
    const { container } = render(<RecipeDetailModal recipe={recipe} onClose={handleClose} />);

    const overlay = container.querySelector('.fixed.inset-0');
    if (overlay) fireEvent.click(overlay);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
