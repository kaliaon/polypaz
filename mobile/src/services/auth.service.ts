/**
 * Authentication Service
 * Handles user authentication operations
 */

import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import {
  LoginCredentials,
  RegisterData,
  AuthTokens,
  UserProfile,
  ApiResponse,
} from '../types';

class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ tokens: AuthTokens; user: UserProfile }>> {
    const response = await apiService.post<{ tokens: AuthTokens; user: UserProfile }>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    if (response.success && response.data) {
      // Save tokens
      await apiService.setTokens(response.data.tokens.access, response.data.tokens.refresh);
    }

    return response;
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<ApiResponse<{ tokens: AuthTokens; user: UserProfile }>> {
    const response = await apiService.post<{ tokens: AuthTokens; user: UserProfile }>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );

    if (response.success && response.data) {
      // Save tokens
      await apiService.setTokens(response.data.tokens.access, response.data.tokens.refresh);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear tokens regardless of API response
      await apiService.clearTokens();
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    return apiService.get<UserProfile>(API_ENDPOINTS.AUTH.PROFILE);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return apiService.isAuthenticated();
  }
}

export default new AuthService();
