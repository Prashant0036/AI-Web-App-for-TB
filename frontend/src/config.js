// Centralized API configuration for TB Risk AI
// On Render, we use the production URL; locally we fallback to localhost:10000

export const API_BASE_URL = import.meta.env.VITE_API_URL || "https://tbrisk-ai.onrender.com" || "http://127.0.0.1:10000";

export const API_URLS = {
  PROCESS: `${API_BASE_URL}/process`,
  ANALYZE_REPORT: `${API_BASE_URL}/analyze-report`,
  HISTORY: `${API_BASE_URL}/history`,
  SHARED_REPORT: (id) => `${API_BASE_URL}/shared-report/${id}`,
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    SIGNUP: `${API_BASE_URL}/auth/signup`,
  }
};
