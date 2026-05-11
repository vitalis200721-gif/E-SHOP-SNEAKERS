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
      const code = error.response?.data?.code;
      const stored = localStorage.getItem('token');
      if (stored && (code === 'TOKEN_EXPIRED' || code === 'USER_GONE' || code === 'TOKEN_INVALID')) {
        localStorage.removeItem('token');
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: { code } }));
      }
    }
    return Promise.reject(error);
  }
);

export default api;
