import apiClient, { getCsrfCookie } from './apiClient';
import type { User, LoginCredentials, RegisterCredentials, SingleResponse } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<User> {
    // Get CSRF token first - essential for Sanctum SPA authentication
    try {
      await getCsrfCookie();
    } catch (error) {
      console.warn('Failed to fetch CSRF token:', error);
      // Continue anyway, token might be in cookies
    }
    
    // Brief delay to ensure cookie is set
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await apiClient.post<SingleResponse<User>>('/api/auth/login', credentials);
    return response.data.data;
  },

  async register(credentials: RegisterCredentials): Promise<User> {
    // Get CSRF token first
    try {
      await getCsrfCookie();
    } catch (error) {
      console.warn('Failed to fetch CSRF token:', error);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = await apiClient.post<SingleResponse<User>>('/api/auth/register', credentials);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/auth/logout');
  },

  async getMe(): Promise<User> {
    // Adicionar headers para evitar cache de resposta autenticada
    const response = await apiClient.get<SingleResponse<User>>('/api/auth/me', {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    });
    return response.data.data;
  },
};

export default authService;
