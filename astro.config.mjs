import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import astroI18next from 'astro-i18next';

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
  ],
  output: 'static',
  image: {
    // Optimización de imágenes
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
      // Optimizar imágenes estáticas
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            let extType = assetInfo.name.split('.').at(-1);
            if (/png|jpe?g|gif|svg|webp|avif/i.test(extType)) {
              extType = 'img';
            }
            return `assets/${extType}/[name]-[hash][extname]`;
          },
        },
      },
    },
    ssr: {
      external: ['sharp'],
    },
  },
  experimental: {
    // Habilitar optimizaciones experimentales si están disponibles
  },
});

