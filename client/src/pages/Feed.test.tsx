import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Feed from './Feed';

// Mock the API
const mockFetchPosts = vi.fn();
const mockFetchRecipeOfTheDay = vi.fn();
vi.mock('../lib/api', () => ({
  fetchPosts: (...args: unknown[]) => mockFetchPosts(...args),
  fetchRecipeOfTheDay: () => mockFetchRecipeOfTheDay(),
  fetchPostById: vi.fn(),
  createPost: vi.fn(),
  default: { get: vi.fn(), post: vi.fn() },
}));

const renderFeed = () =>
  render(
    <MemoryRouter>
      <AuthProvider>
        <Feed />
      </AuthProvider>
    </MemoryRouter>
  );

const mockRecipe = {
  title: 'Test Recipe',
  calories: 300,
  cookTime: '10 min',
  protein: 25,
  carbs: 35,
  fat: 10,
  ingredients: ['ingredient 1', 'ingredient 2'],
  instructions: ['step 1', 'step 2'],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFetchRecipeOfTheDay.mockResolvedValue({ data: mockRecipe });
});

describe('Feed', () => {
  test('renders header and recipe of the day', async () => {
    mockFetchPosts.mockResolvedValue({ data: [] });

    renderFeed();

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });
    expect(screen.getAllByText('SnapCal').length).toBeGreaterThan(0);
  });

  test('opens recipe detail modal on click', async () => {
    mockFetchPosts.mockResolvedValue({ data: [] });

    renderFeed();

    await waitFor(() => {
      expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Test Recipe'));

    await waitFor(() => {
      expect(screen.getByText('ingredient 1')).toBeInTheDocument();
      expect(screen.getByText('step 1')).toBeInTheDocument();
    });
  });

  test('hides recipe section when API fails', async () => {
    mockFetchRecipeOfTheDay.mockRejectedValue(new Error('API error'));
    mockFetchPosts.mockResolvedValue({ data: [] });

    renderFeed();

    await waitFor(() => {
      expect(screen.getAllByText('SnapCal').length).toBeGreaterThan(0);
    });
    expect(screen.queryByText('Recipe of the Day')).not.toBeInTheDocument();
  });

  test('renders meal cards after successful fetch', async () => {
    mockFetchPosts.mockResolvedValue({
      data: [
        {
          _id: 'post-1',
          author: { _id: 'u1', username: 'chef', avatar: 'https://example.com/a.png' },
          imageUrl: '/uploads/food.jpg',
          description: 'Healthy bowl',
          calories: 400,
          likes: [],
          commentsCount: 2,
          createdAt: new Date().toISOString(),
        },
      ],
    });

    renderFeed();

    await waitFor(() => {
      expect(screen.getByText('Healthy bowl')).toBeInTheDocument();
    });
  });

  test('shows empty state when API returns empty array', async () => {
    mockFetchPosts.mockResolvedValue({ data: [] });

    renderFeed();

    await waitFor(() => {
      expect(screen.getByText('No meals to show yet.')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully without crashing', async () => {
    mockFetchRecipeOfTheDay.mockRejectedValue(new Error('Recipe error'));
    mockFetchPosts.mockRejectedValue(new Error('Network error'));

    renderFeed();

    // Should not crash — header still visible
    await waitFor(() => {
      expect(screen.getAllByText('SnapCal').length).toBeGreaterThan(0);
    });
  });
});
