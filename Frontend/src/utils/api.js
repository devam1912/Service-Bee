import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:9876',
});

console.log("🐝 Hive API Base URL:", api.defaults.baseURL);

// Add interceptors for tokens and global error handling
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired or invalid. Clearing session.");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optional: window.location.href = "/login" if not already there
    }
    return Promise.reject(error);
  }
);

export default api;
