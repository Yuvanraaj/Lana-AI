// Backend URL configuration for dev and production
const isDev = import.meta.env.DEV;

// In development: use localhost backend (currently running on port 8002)
// In production: use Render backend URL
const getBackendUrl = () => {
  if (isDev) {
    // Backend is running on port 8002 locally
    return 'http://localhost:8002';
  }
  // Production: use Render backend
  return import.meta.env.VITE_API_BASE_URL || 'https://interview-bot-backend.onrender.com';
};

export const API_BASE_URL = getBackendUrl();
