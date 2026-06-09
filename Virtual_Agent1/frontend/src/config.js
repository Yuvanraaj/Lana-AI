// Backend URL configuration for dev and production
const isDev = import.meta.env.DEV;

// In development: detect actual backend port (tries 8001, 8002, 8003)
// In production: use Render backend URL
const getBackendUrl = () => {
  if (isDev) {
    // Try to detect which port backend is actually running on
    // Backend defaults to 8001 but can fallback to 8002, 8003 if ports are in use
    const backendPort = import.meta.env.VITE_BACKEND_PORT || '8001';
    return `http://localhost:${backendPort}`;
  }
  // Production: use Render backend
  // NOTE: Use the current Render service URL (matches the service shown in Render dashboard)
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';
};

export const API_BASE_URL = getBackendUrl();
