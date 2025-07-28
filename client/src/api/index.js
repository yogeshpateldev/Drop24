import axios from 'axios';

const api = axios.create({
  baseURL: 'https://drop24-backend.onrender.com',
  withCredentials:false // Adjust if your backend is on a different port
});

export default api;
