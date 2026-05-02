import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import { RecipeOfTheDay } from './RecipeOfTheDay';
import type { Recipe } from '../types';

const recipe: Recipe = {
  title: 'High-Protein Overnight Oats',
  calories: 385,
  cookTime: '5 min prep',
  protein: 28,
  carbs: 45,
  fat: 12,
  ingredients: ['oats', 'protein powder'],
  instructions: ['mix', 'refrigerate'],
};

describe('RecipeOfTheDay', () => {
  test('renders recipe title, calories, and cook time', () => {
    render(<RecipeOfTheDay recipe={recipe} onClick={() => {}} />);

    expect(screen.getByText('High-Protein Overnight Oats')).toBeInTheDocument();
    expect(screen.getByText('385 cal')).toBeInTheDocument();
    expect(screen.getByText('5 min prep')).toBeInTheDocument();
    expect(screen.getByText('Recipe of the Day')).toBeInTheDocument();
  });

  test('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<RecipeOfTheDay recipe={recipe} onClick={handleClick} />);

    fireEvent.click(screen.getByText('High-Protein Overnight Oats'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
