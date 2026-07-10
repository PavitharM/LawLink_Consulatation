import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api',
  withCredentials: true, // For HTTP-only cookies (refreshToken)
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('lawlink_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global response error handler
api.interceptors.response.use(
  (response) => response.data, // Simplify standard responses
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized, except if we are on the login page
      if (window.location.pathname !== '/login') {
        localStorage.removeItem('lawlink_token');
        localStorage.removeItem('lawlink_role');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;
