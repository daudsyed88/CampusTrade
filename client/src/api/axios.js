import axios from 'axios';

const api = axios.create({
  // Keep API origin configurable; defaults to local backend.
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
});

// Attach JWT token from localStorage to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('campustrade_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server returns 401, clear the stored token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('campustrade_token');
      localStorage.removeItem('campustrade_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
