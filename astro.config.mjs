import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import astroI18next from 'astro-i18next';

// https://astro.build/config
export default defineConfig({
  site: 'https://scorusfitness.com',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    react(),
    mdx(),
    astroI18next(),
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
          en: 'en-US',
          fr: 'fr-FR',
          de: 'de-DE',
        },
      },
    }),
  ],
  output: 'static',
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
  experimental: {
    // Habilitar optimizaciones experimentales si están disponibles
  },
});

