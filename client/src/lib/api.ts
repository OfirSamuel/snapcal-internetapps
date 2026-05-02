import axios from 'axios';
import { getAccessToken } from './authStorage';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

const authPathsWithoutBearer = ['/auth/register', '/auth/login', '/auth/google', '/auth/refresh'];

api.interceptors.request.use((config) => {
  const url = typeof config.url === 'string' ? config.url : '';
  const skipAuth = authPathsWithoutBearer.some((path) => url.includes(path));
  const token = getAccessToken();

  if (!skipAuth && token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const fetchPosts = (page: number, author?: string) => {
  const params = new URLSearchParams({ page: String(page) });
  if (author) params.set('author', author);
  return api.get(`/posts?${params.toString()}`);
};
export const createPost = (formData: FormData) => api.post('/posts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updatePost = (id: string, formData: FormData) => api.put(`/posts/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deletePost = (id: string) => api.delete(`/posts/${id}`);
export const toggleLike = (id: string) => api.post(`/posts/${id}/like`);
export const fetchCommentsByPost = (postId: string) => api.get(`/comments/post/${postId}`);
export const createComment = (postId: string, text: string) =>
  api.post('/comments', { postId, text });
export const analyzeWithAI = (description: string) =>
  api.post<{ mealName: string; calories: number; protein: number; carbs: number; fat: number }>('/ai/analyze', { description });

export const analyzeImageWithAI = (imageFile: File) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  return api.post<{ mealName: string; calories: number; protein: number; carbs: number; fat: number }>('/ai/analyze-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const fetchRecipeOfTheDay = () =>
  api.get<{
    title: string;
    calories: number;
    cookTime: string;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
    instructions: string[];
  }>('/ai/recipe-of-the-day');

export default api;
