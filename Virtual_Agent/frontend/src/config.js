// Backend URL configuration for dev and production
const isDev = import.meta.env.DEV;

// In development: empty string (use relative paths)
// In production: use environment variable OR hardcoded backend URL
const defaultBackend = isDev 
  ? "" 
  : (import.meta.env.VITE_API_BASE_URL || "https://interview-bot-backend.onrender.com");

export const API_BASE_URL = defaultBackend;
