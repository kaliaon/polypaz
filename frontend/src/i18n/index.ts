import { createI18n } from 'vue-i18n';
import en from '@/locales/en.json';

// Define available locales and their names
export const availableLocales = [
  {
    code: 'en',
    name: 'English',
  },
  // Add more languages as needed
  // { code: 'es', name: 'Español' },
  // { code: 'fr', name: 'Français' },
  // { code: 'de', name: 'Deutsch' },
];

// Type for messages structure
type MessageSchema = typeof en;

// Create i18n instance
const i18n = createI18n<[MessageSchema], 'en'>({
  legacy: false, // use Composition API
  locale: 'en', // set locale
  fallbackLocale: 'en', // set fallback locale
  messages: {
    en, // load English by default
  },
  // If you need to enable UTF-8 in numbers
  // numberFormats: {},
  // If you need date/time formatting
  // datetimeFormats: {},
});

// Function to load locale dynamically
export async function loadLocale(locale: string): Promise<boolean> {
  // Check if the locale is already loaded
  const isLocaleLoaded = Array.isArray(i18n.global.availableLocales)
    ? i18n.global.availableLocales.includes(locale)
    : Object.values(i18n.global.availableLocales).includes(locale);
  
  if (!isLocaleLoaded) {
    try {
      // Dynamic import of the locale file
      const messages = await import(`@/locales/${locale}.json`);
      
      // Add locale messages
      i18n.global.setLocaleMessage(locale, messages.default);
      
      return true;
    } catch (error) {
      console.error(`Failed to load locale: ${locale}`, error);
      return false;
    }
  }
  
  return true;
}

// Function to change locale
export async function setLocale(locale: string): Promise<boolean> {
  const isLoaded = await loadLocale(locale);
  
  if (isLoaded) {
    i18n.global.locale.value = locale;
    document.querySelector('html')?.setAttribute('lang', locale);
    localStorage.setItem('user-locale', locale);
    return true;
  }
  
  return false;
}

// Initialize with saved locale or browser preference
export async function initializeI18n(): Promise<void> {
  const savedLocale = localStorage.getItem('user-locale');
  const browserLocale = navigator.language.split('-')[0];
  
  // Try to use saved locale first, then browser locale, then fallback to default
  if (savedLocale) {
    await setLocale(savedLocale);
  } else if (browserLocale && availableLocales.some(l => l.code === browserLocale)) {
    await setLocale(browserLocale);
  }
}

export default i18n; 