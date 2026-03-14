// Use environment variable for backend URL in production, fallback to localhost for development
const isDev = import.meta.env.DEV;
// In development, use relative paths so Vite proxy handles it
// In production, use the env variable or absolute path
const defaultBackend = isDev ? "" : "/api";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || defaultBackend;
