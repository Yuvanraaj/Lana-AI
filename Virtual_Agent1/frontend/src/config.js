// Backend URL configuration
//
// Priority order:
//   1. VITE_API_BASE_URL env var  (explicit override — Render/Vercel/staging)
//   2. localhost:PORT              (local dev without Docker)
//   3. ''  (empty string)          (Docker — nginx proxies /api/ → node-backend)
//
const isDev = import.meta.env.DEV;

const getBackendUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  if (isDev) return `http://localhost:${import.meta.env.VITE_BACKEND_PORT || '8001'}`;
  return ''; // Docker/nginx: requests to /api/... are proxied automatically
};

export const API_BASE_URL = getBackendUrl();

// Resume Analyzer FastAPI backend
// Docker/nginx: /resume-api/... is proxied to python-backend:8000
// Local dev: direct to localhost:8000
export const RESUME_API_URL =
  import.meta.env.VITE_RESUME_API_URL ||
  (isDev ? `http://localhost:${import.meta.env.VITE_RESUME_API_PORT || '8000'}` : '/resume-api');
