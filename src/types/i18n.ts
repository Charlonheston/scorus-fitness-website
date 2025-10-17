/**
 * Tipos relacionados con internacionalización
 */

export type Locale = 'es' | 'en' | 'fr' | 'de';

export const locales: Locale[] = ['es', 'en', 'fr', 'de'];

export const defaultLocale: Locale = 'es';

export interface LocaleConfig {
  code: Locale;
  name: string;
  flag: string;
  nativeName: string;
}

export const localeConfigs: Record<Locale, LocaleConfig> = {
  es: {
    code: 'es',
    name: 'Spanish',
    flag: '🇪🇸',
    nativeName: 'Español',
  },
  en: {
    code: 'en',
    name: 'English',
    flag: '🇬🇧',
    nativeName: 'English',
  },
  fr: {
    code: 'fr',
    name: 'French',
    flag: '🇫🇷',
    nativeName: 'Français',
  },
  de: {
    code: 'de',
    name: 'German',
    flag: '🇩🇪',
    nativeName: 'Deutsch',
  },
};

export interface TranslationKeys {
  [key: string]: string | TranslationKeys;
}

