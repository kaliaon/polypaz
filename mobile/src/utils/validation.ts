/**
 * Validation Utilities
 * Common validation functions for forms
 */

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements: At least 8 characters
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Get password validation message
 */
export const getPasswordValidationMessage = (password: string): string | null => {
  if (password.length === 0) return null;
  if (password.length < 8) return 'Password must be at least 8 characters';
  return null;
};

/**
 * Validate username
 * Requirements: 3-20 characters, alphanumeric and underscores only
 */
export const isValidUsername = (username: string): boolean => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Get username validation message
 */
export const getUsernameValidationMessage = (username: string): string | null => {
  if (username.length === 0) return null;
  if (username.length < 3) return 'Username must be at least 3 characters';
  if (username.length > 20) return 'Username must be less than 20 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return 'Username can only contain letters, numbers, and underscores';
  }
  return null;
};

/**
 * Check if passwords match
 */
export const doPasswordsMatch = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword && password.length > 0;
};
