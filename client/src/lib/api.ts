import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export const fetchPosts = (page: number) => api.get(`/posts?page=${page}`);
export const createPost = (formData: FormData) => api.post('/posts', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export default api;
