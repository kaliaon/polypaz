import { DefineLocaleMessage } from 'vue-i18n';
import en from '@/locales/en.json';

// Type for the entire message schema
type MessageSchema = typeof en;

// Declare module augmentation
declare module 'vue-i18n' {
  // Define the default locale message schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // Define the resource schema as generic type
  export interface DefineLocaleMessage {
    [key: string]: DefineLocaleMessage | string
  }
} 