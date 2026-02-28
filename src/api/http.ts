import axios from 'axios';
import { ElNotification } from 'element-plus';

function normalizeBaseURL(raw: string | undefined): string {
  const fallback = 'http://localhost:3000/api';
  const value = (raw || '').trim() || fallback;
  if (value === fallback) return fallback;
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  return `https://${value}`;
}

/** Базовый URL API (для страницы интеграции и скрипта встраивания). */
export function getApiBase(): string {
  return normalizeBaseURL(import.meta.env.VITE_API_BASE_URL);
}

export const api = axios.create({
  baseURL: getApiBase(),
  timeout: 30000,
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
    const isTimeout = error?.code === 'ECONNABORTED' || error?.message?.includes('timeout');
    const message = isTimeout
      ? 'Сервер не отвечает. Проверьте, что бэкенд запущен и доступен по указанному адресу.'
      : error?.response?.data?.error?.message ||
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
