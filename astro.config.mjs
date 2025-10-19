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
          hu: 'hu-HU',
        },
      },
    }),
    compress({
      Image: true,
      SVG: true,
      HTML: {
        'html-minifier-terser': {
          removeComments: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyJS: true,
          minifyCSS: true,
        },
      },
    }),
  ],
  output: 'static',
  vite: {
    build: {
      cssMinify: 'lightningcss',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: false,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
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

