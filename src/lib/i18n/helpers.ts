/**
 * Helpers para i18n
 */

export const languages = [
  { code: 'es', name: 'ES', fullName: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'EN', fullName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'FR', fullName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'DE', fullName: 'Deutsch', flag: '🇩🇪' },
] as const;

export type LanguageCode = typeof languages[number]['code'];

export const defaultLang: LanguageCode = 'es';

/**
 * Obtiene el código de idioma desde una URL
 */
export function getLangFromUrl(url: URL): LanguageCode {
  const [, lang] = url.pathname.split('/');
  if (lang && languages.some(l => l.code === lang)) {
    return lang as LanguageCode;
  }
  return defaultLang;
}

/**
 * Traduce una ruta al idioma especificado
 */
export function translatePath(path: string, targetLang: LanguageCode): string {
  // Eliminar prefijo de idioma existente
  const pathWithoutLang = path.replace(/^\/(es|en|fr|de)(\/|$)/, '/');
  
  // Si es el idioma por defecto (español), no agregar prefijo
  if (targetLang === defaultLang) {
    return pathWithoutLang || '/';
  }
  
  // Agregar prefijo del idioma objetivo
  return `/${targetLang}${pathWithoutLang || '/'}`;
}

/**
 * Verifica si una ruta es el idioma por defecto
 */
export function isDefaultLang(lang: string): boolean {
  return lang === defaultLang;
}

/**
 * Obtiene el nombre completo del idioma
 */
export function getLanguageName(code: LanguageCode): string {
  return languages.find(l => l.code === code)?.fullName || 'Español';
}

