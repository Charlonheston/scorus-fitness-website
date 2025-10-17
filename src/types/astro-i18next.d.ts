/**
 * Type declarations for astro-i18next
 * Solución temporal para el error de tipos del paquete
 */

declare module 'astro-i18next' {
  export interface AstroI18nextConfig {
    defaultLocale: string;
    locales: string[];
    routes?: Record<string, Record<string, string>>;
    namespaces?: string[];
    defaultNamespace?: string;
  }

  export interface I18nextInstance {
    language: string;
    t(key: string, options?: any): string;
    changeLanguage(lng: string): Promise<void>;
  }

  export const l18next: I18nextInstance;

  export function t(key: string, options?: any): string;
  export function changeLanguage(lng: string): Promise<void>;
  export function localizePath(path: string, locale?: string): string;
  export function localizeUrl(url: string, locale?: string): string;

  export default function astroI18next(config?: Partial<AstroI18nextConfig>): any;
}

