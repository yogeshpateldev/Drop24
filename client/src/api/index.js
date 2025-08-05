import axios from 'axios';
import { supabase } from '../lib/supabase';

const api = axios.create({
  baseURL: 'https://drop24-backend.onrender.com/api',
  withCredentials: false
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, sign out user
      supabase.auth.signOut();
    }
    return Promise.reject(error);
  }
);

export default api;
