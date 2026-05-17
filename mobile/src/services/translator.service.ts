/**
 * Translator Service
 * Uses MyMemory Translation API (free, no API key required)
 * https://mymemory.translated.net/doc/spec.php
 */

import axios from 'axios';
import { Language } from '../types';

const MYMEMORY_BASE_URL = 'https://api.mymemory.translated.net/get';

// MyMemory accepts ISO 639-1 codes; Kazakh requires the regional variant.
const LANGUAGE_CODES: Record<Language, string> = {
  english: 'en-US',
  russian: 'ru-RU',
  kazakh: 'kk-KZ',
  spanish: 'es-ES',
};

export const SUPPORTED_LANGUAGES: { value: Language; label: string; flag: string }[] = [
  { value: 'english', label: 'English', flag: '🇬🇧' },
  { value: 'russian', label: 'Russian', flag: '🇷🇺' },
  { value: 'kazakh', label: 'Kazakh', flag: '🇰🇿' },
  { value: 'spanish', label: 'Spanish', flag: '🇪🇸' },
];

interface MyMemoryResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  responseStatus: number;
  responseDetails?: string;
}

export interface TranslationResult {
  success: boolean;
  text?: string;
  error?: string;
}

class TranslatorService {
  async translate(text: string, from: Language, to: Language): Promise<TranslationResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      return { success: false, error: 'Please enter text to translate' };
    }
    if (from === to) {
      return { success: true, text: trimmed };
    }

    try {
      const response = await axios.get<MyMemoryResponse>(MYMEMORY_BASE_URL, {
        params: {
          q: trimmed,
          langpair: `${LANGUAGE_CODES[from]}|${LANGUAGE_CODES[to]}`,
        },
        timeout: 15000,
      });

      const data = response.data;
      if (data.responseStatus !== 200 || !data.responseData?.translatedText) {
        return {
          success: false,
          error: data.responseDetails || 'Translation failed',
        };
      }

      return { success: true, text: data.responseData.translatedText };
    } catch (error: any) {
      const message =
        error.response?.data?.responseDetails ||
        error.message ||
        'Network error. Please try again.';
      return { success: false, error: message };
    }
  }
}

export default new TranslatorService();
