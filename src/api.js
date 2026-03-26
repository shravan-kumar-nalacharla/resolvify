// API base URL - uses env variable in production, falls back to Render URL if env is missing
const API_BASE = import.meta.env.VITE_API_BASE || 'https://resolvify-backend-1.onrender.com';

export default API_BASE;
