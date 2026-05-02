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
  mealName?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
}

export interface PostCommentAuthor {
  _id?: string;
  username?: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
}

export interface PostComment {
  _id: string;
  postId: string;
  author: PostCommentAuthor;
  text: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Recipe {
  title: string;
  calories: number;
  cookTime: string;
  protein: number;
  carbs: number;
  fat: number;
  ingredients: string[];
  instructions: string[];
}
