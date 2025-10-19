import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import astroI18next from 'astro-i18next';
import compress from 'astro-compress';

// https://astro.build/config
export default defineConfig({
  // site: 'https://scorusfitness.com', // Comentado temporalmente - Descomentar cuando tengas tu dominio
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
    compress({
      Image: false, // Astro maneja esto
      SVG: true,
      HTML: true,
      CSS: true,
      JavaScript: true,
      Fonts: true,
    }),
  ],
  output: 'static',
  image: {
    // Optimización nativa de Astro
    service: {
      entrypoint: 'astro/assets/services/sharp',
      config: {
        limitInputPixels: false,
      },
    },
  },
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
  experimental: {
    // Habilitar optimizaciones experimentales
  },
});

