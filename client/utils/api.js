import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const stored = localStorage.getItem('token');
      if (stored) {
        localStorage.removeItem('token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
