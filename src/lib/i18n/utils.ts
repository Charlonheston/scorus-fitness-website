/**
 * Utilidades de i18n
 */

import type { Locale } from '@/types/i18n';
import { defaultLocale, locales } from './config';

/**
 * Obtiene el locale de una URL
 */
export function getLocaleFromUrl(url: URL): Locale {
  const [, locale] = url.pathname.split('/');
  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  return defaultLocale;
}

/**
 * Genera una URL localizada
 */
export function getLocalizedUrl(path: string, locale: Locale): string {
  // Remover barra inicial si existe
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // Si es el locale por defecto, no incluir en la URL
  if (locale === defaultLocale) {
    return `/${cleanPath}`;
  }
  
  return `/${locale}/${cleanPath}`;
}

/**
 * Obtiene las URLs alternativas para otros idiomas
 */
export function getAlternateUrls(path: string, currentLocale: Locale) {
  return locales
    .filter((locale) => locale !== currentLocale)
    .map((locale) => ({
      locale,
      url: getLocalizedUrl(path, locale),
    }));
}

/**
 * Valida si un locale es válido
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

