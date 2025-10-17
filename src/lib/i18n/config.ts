/**
 * Configuración de internacionalización
 */

import type { Locale } from '@/types/i18n';

export const defaultLocale: Locale = 'es';

export const locales: Locale[] = ['es', 'en', 'fr', 'de'];

export const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
};

export const localeFlags: Record<Locale, string> = {
  es: '🇪🇸',
  en: '🇬🇧',
  fr: '🇫🇷',
  de: '🇩🇪',
};

