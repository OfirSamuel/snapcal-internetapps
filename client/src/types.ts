export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
}

export interface Meal {
  id: string;
  userId: string;
  user: User;
  imageUrl: string;
  description: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export interface Comment {
  id: string;
  mealId: string;
  user: User;
  text: string;
  createdAt: string;
}

export interface Recipe {
  title: string;
  imageUrl: string;
  calories: number;
  cookTime: string;
}
