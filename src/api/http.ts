import axios from 'axios';
import { ElNotification } from 'element-plus';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.error?.message ||
      error?.response?.data?.message ||
      error.message ||
      'Unknown API error';
    ElNotification({
      title: 'Ошибка',
      message,
      type: 'error',
    });
    return Promise.reject(error);
  },
);
