import type { Meal, User, Recipe } from '../types';

export const currentUser: User = {
  id: 'user-1',
  name: 'Alex Chen',
  username: '@alexchen',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
};

export const mockUsers: User[] = [
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    username: '@sarahfitness',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  },
  {
    id: 'user-3',
    name: 'Mike Rodriguez',
    username: '@mikelifts',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
  },
];

export const initialMeals: Meal[] = [
  {
    id: 'meal-1',
    userId: 'user-2',
    user: mockUsers[0],
    imageUrl: 'https://images.unsplash.com/photo-1762631934518-f75e233413ca?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZ3JpbGxlZCUyMGNoaWNrZW4lMjBtZWFsfGVufDF8fHx8MTc3NTczNDkwM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Grilled chicken breast with 200g white rice and steamed broccoli',
    calories: 585,
    protein: 52,
    carbs: 68,
    fat: 8,
    likes: 24,
    comments: 5,
    isLiked: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'meal-2',
    userId: 'user-3',
    user: mockUsers[1],
    imageUrl: 'https://images.unsplash.com/photo-1625480499375-27220a672237?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2Zhc3QlMjBzbW9vdGhpZSUyMGJvd2x8ZW58MXx8fHwxNzc1NjMwMTMyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Acai smoothie bowl with granola, banana, and strawberries',
    calories: 380,
    protein: 12,
    carbs: 62,
    fat: 14,
    likes: 42,
    comments: 8,
    isLiked: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
];

export const recipeOfTheDay: Recipe = {
  title: 'High-Protein Overnight Oats',
  imageUrl: 'https://images.unsplash.com/photo-1517673400267-ae03058f1b28?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvdmVybmlnaHQlMjBvYXRzfGVufDF8fHx8MTc3NTczNDkwNXww&ixlib=rb-4.1.0&q=80&w=400',
  calories: 385,
  cookTime: '5 min prep',
};
