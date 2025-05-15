// API configuration
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Base URL for API requests
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5000/api' 
  : 'http://localhost:5000/api'; // Use your local backend even when frontend is deployed

// Auth header format
export const getAuthHeader = (token) => {
  return {
    Authorization: `token ${token}`
  };
};
