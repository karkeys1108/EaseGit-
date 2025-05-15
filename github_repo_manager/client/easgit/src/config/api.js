// API configuration
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Base URL for API requests
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000/api' 
  : 'https://easegit-a-git-repo-manager.onrender.com/api';

// Auth header format
export const getAuthHeader = (token) => {
  return {
    Authorization: `Bearer ${token}`
  };
};
