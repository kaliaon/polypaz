/**
 * Error Handler Utility
 * Centralized error handling and formatting
 */

import { ApiError } from '../types';

/**
 * Format API error for display
 */
export const formatApiError = (error: ApiError | undefined): string => {
  if (!error) return 'An unknown error occurred';

  // If there are field-specific errors, format them
  if (error.errors) {
    const fieldErrors = Object.entries(error.errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('\n');
    return fieldErrors || error.message;
  }

  return error.message;
};

/**
 * Check if error is network-related
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error?.message?.toLowerCase().includes('network') ||
    error?.message?.toLowerCase().includes('timeout') ||
    error?.status === 0
  );
};

/**
 * Check if error is authentication-related
 */
export const isAuthError = (error: ApiError | undefined): boolean => {
  return error?.status === 401 || error?.status === 403;
};

/**
 * Get user-friendly error message
 */
export const getUserFriendlyError = (error: ApiError | undefined): string => {
  if (!error) return 'Something went wrong. Please try again.';

  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }

  if (isAuthError(error)) {
    return 'Session expired. Please log in again.';
  }

  if (error.status === 404) {
    return 'The requested resource was not found.';
  }

  if (error.status === 500) {
    return 'Server error. Please try again later.';
  }

  return formatApiError(error);
};

/**
 * Log error for debugging
 */
export const logError = (context: string, error: any): void => {
  if (__DEV__) {
    console.error(`[${context}]`, error);
  }
  // In production, send to error tracking service (e.g., Sentry)
};
