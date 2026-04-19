import { render, screen, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Feed from './Feed';

// Mock the API
const mockFetchPosts = vi.fn();
vi.mock('../lib/api', () => ({
  fetchPosts: (...args: unknown[]) => mockFetchPosts(...args),
  createPost: vi.fn(),
  default: { get: vi.fn(), post: vi.fn() },
}));

// Mock the mock data
vi.mock('../lib/mockData', () => ({
  currentUser: {
    id: 'user-1',
    name: 'Test User',
    username: '@test',
    avatar: 'https://example.com/avatar.png',
  },
  recipeOfTheDay: {
    title: 'Test Recipe',
    imageUrl: 'https://example.com/recipe.jpg',
    calories: 300,
    cookTime: '10 min',
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Feed', () => {
  test('renders header and recipe of the day', async () => {
    mockFetchPosts.mockResolvedValue({ data: [] });

    render(<Feed />);

    expect(screen.getByText('SnapCal')).toBeInTheDocument();
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
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

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('Healthy bowl')).toBeInTheDocument();
    });
  });

  test('shows no more meals when API returns empty array', async () => {
    mockFetchPosts.mockResolvedValue({ data: [] });

    render(<Feed />);

    await waitFor(() => {
      expect(screen.getByText('No more meals to load')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully without crashing', async () => {
    mockFetchPosts.mockRejectedValue(new Error('Network error'));

    render(<Feed />);

    // Should not crash — header still visible
    await waitFor(() => {
      expect(screen.getByText('SnapCal')).toBeInTheDocument();
    });
  });
});
