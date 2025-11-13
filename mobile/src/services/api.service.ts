/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT } from '../config/api.config';
import { ApiError, ApiResponse } from '../types';

class ApiService {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // If error is 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            if (newAccessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            await this.clearTokens();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    // Load tokens from storage on initialization
    this.loadTokens();
  }

  /**
   * Load tokens from AsyncStorage
   */
  private async loadTokens(): Promise<void> {
    try {
      const access = await AsyncStorage.getItem('access_token');
      const refresh = await AsyncStorage.getItem('refresh_token');
      this.accessToken = access;
      this.refreshToken = refresh;
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  }

  /**
   * Save tokens to AsyncStorage
   */
  async setTokens(access: string, refresh: string): Promise<void> {
    try {
      this.accessToken = access;
      this.refreshToken = refresh;
      await AsyncStorage.setItem('access_token', access);
      await AsyncStorage.setItem('refresh_token', refresh);
    } catch (error) {
      console.error('Error saving tokens:', error);
    }
  }

  /**
   * Clear tokens from memory and storage
   */
  async clearTokens(): Promise<void> {
    try {
      this.accessToken = null;
      this.refreshToken = null;
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshToken) {
      return null;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
        refresh: this.refreshToken,
      });

      const newAccessToken = response.data.access;
      this.accessToken = newAccessToken;
      await AsyncStorage.setItem('access_token', newAccessToken);

      return newAccessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  /**
   * Generic GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.get<T>(url, config);
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Generic POST request
   */
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.post<T>(url, data, config);
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.put<T>(url, data, config);
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.axiosInstance.delete<T>(url, config);
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Handle API errors
   */
  private handleError<T>(error: any): ApiResponse<T> {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const apiError: ApiError = {
        message: axiosError.response?.data?.message || axiosError.message || 'An error occurred',
        errors: axiosError.response?.data?.errors,
        status: axiosError.response?.status || 500,
      };

      return {
        error: apiError,
        success: false,
      };
    }

    // Non-axios error
    return {
      error: {
        message: error.message || 'An unexpected error occurred',
        status: 500,
      },
      success: false,
    };
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }
}

// Export singleton instance
export default new ApiService();
