import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
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
export const analyzeWithAI = (description: string) =>
  api.post<{ calories: number; protein: number; carbs: number; fat: number }>('/ai/analyze', { description });

export default api;
