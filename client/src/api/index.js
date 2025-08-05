import axios from 'axios';

const api = axios.create({
  baseURL: 'https://drop24-backend.onrender.com/api',
  withCredentials: false,
  timeout: 30000, // 30 second timeout
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      // Optionally redirect to login
      window.location.href = '/';
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      console.error('Request timeout');
    } else if (!error.response) {
      // Network error
      console.error('Network error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
