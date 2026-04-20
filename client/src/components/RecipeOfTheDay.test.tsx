import { render, screen } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { RecipeOfTheDay } from './RecipeOfTheDay';
import type { Recipe } from '../types';

const recipe: Recipe = {
  title: 'High-Protein Overnight Oats',
  imageUrl: 'https://example.com/oats.jpg',
  calories: 385,
  cookTime: '5 min prep',
};

describe('RecipeOfTheDay', () => {
  test('renders recipe title, image, calories, and cook time', () => {
    render(<RecipeOfTheDay recipe={recipe} />);

    expect(screen.getByText('High-Protein Overnight Oats')).toBeInTheDocument();
    expect(screen.getByAltText('High-Protein Overnight Oats')).toHaveAttribute('src', recipe.imageUrl);
    expect(screen.getByText('385 cal')).toBeInTheDocument();
    expect(screen.getByText('5 min prep')).toBeInTheDocument();
    expect(screen.getByText('Recipe of the Day')).toBeInTheDocument();
  });
});
