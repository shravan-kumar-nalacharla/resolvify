// API base URL - uses env variable in production, falls back to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export default API_BASE;
