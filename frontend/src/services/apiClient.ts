import axios, { AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Helper function to extract CSRF token from cookie
const getXsrfTokenFromCookie = (): string | null => {
  const name = 'XSRF-TOKEN=';
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let cookie of cookieArray) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return null;
};

// Request interceptor to handle XSRF token
apiClient.interceptors.request.use((config) => {
  // Get XSRF token from cookie
  const xsrfToken = getXsrfTokenFromCookie();
  
  if (xsrfToken) {
    config.headers['X-XSRF-TOKEN'] = xsrfToken;
  }
  
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Don't handle 401 here - let the components handle authentication state
    // This prevents infinite redirects when checking auth status
    return Promise.reject(error);
  }
);

export const getCsrfCookie = async () => {
  return apiClient.get('/sanctum/csrf-cookie');
};

export default apiClient;
