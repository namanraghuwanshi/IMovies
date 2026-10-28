// Axios Instance Configuration
// Centralized HTTP client configured with base URL and JWT auth headers
import axios from 'axios';

const API = axios.create({
  baseURL: "https://imovies-backend-7u99.onrender.com",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Automatically attach JWT token to every request if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
