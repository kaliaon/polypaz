/**
 * Secure Storage Service
 * Handles encrypted storage for sensitive data like tokens
 * Uses AsyncStorage with a simple encryption layer for token security
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple encryption/decryption using base64 and XOR cipher
// For production, consider using expo-secure-store or react-native-encrypted-storage
class StorageService {
  private encryptionKey = 'polypaz-secure-key-2024'; // In production, use a more secure key management

  /**
   * Base64 encode (React Native compatible)
   */
  private base64Encode(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
  }

  /**
   * Base64 decode (React Native compatible)
   */
  private base64Decode(str: string): string {
    return decodeURIComponent(escape(atob(str)));
  }

  /**
   * Simple XOR encryption
   */
  private encrypt(text: string): string {
    try {
      const encrypted = text
        .split('')
        .map((char, i) => {
          const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
          return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
        })
        .join('');
      return this.base64Encode(encrypted);
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Fallback to plain text in case of error
    }
  }

  /**
   * Simple XOR decryption
   */
  private decrypt(encryptedText: string): string {
    try {
      const decrypted = this.base64Decode(encryptedText);
      return decrypted
        .split('')
        .map((char, i) => {
          const keyChar = this.encryptionKey.charCodeAt(i % this.encryptionKey.length);
          return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
        })
        .join('');
    } catch (error) {
      console.error('Decryption error:', error);
      // Return empty string to trigger re-authentication
      return '';
    }
  }

  /**
   * Save encrypted value to storage
   */
  async setSecure(key: string, value: string): Promise<void> {
    try {
      const encrypted = this.encrypt(value);
      await AsyncStorage.setItem(key, encrypted);
    } catch (error) {
      console.error(`Error saving secure data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get and decrypt value from storage
   */
  async getSecure(key: string): Promise<string | null> {
    try {
      const encrypted = await AsyncStorage.getItem(key);
      if (!encrypted) return null;
      const decrypted = this.decrypt(encrypted);
      // If decryption failed (returns empty string), clear the corrupted data
      if (decrypted === '') {
        await this.remove(key);
        return null;
      }
      return decrypted;
    } catch (error) {
      console.error(`Error getting secure data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Save plain value to storage
   */
  async set(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get plain value from storage
   */
  async get(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting data for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Save JSON object to storage
   */
  async setObject(key: string, value: any): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonString);
    } catch (error) {
      console.error(`Error saving object for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get JSON object from storage
   */
  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await AsyncStorage.getItem(key);
      if (!jsonString) return null;
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error(`Error getting object for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove value from storage
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all data from storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Check if key exists in storage
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error(`Error checking key ${key}:`, error);
      return false;
    }
  }
}

export default new StorageService();
