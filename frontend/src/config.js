// Cnetral place for environment-driven config
// VITE_API_BASE_URL is set in Netlify/Vercel's dashboard for production:
// locally its unset, falls to dev backend
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';