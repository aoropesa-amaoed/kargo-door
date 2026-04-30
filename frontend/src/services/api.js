import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(async (config) => {
  const authStore = useAuthStore();
  const rawToken = authStore.token;
  // `token` can be either the raw string or a Pinia ref depending on how the store is accessed.
  const token =
    rawToken && typeof rawToken === 'object' && 'value' in rawToken
      ? rawToken.value
      : rawToken;

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${String(token).trim()}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(async (response) => {
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default api