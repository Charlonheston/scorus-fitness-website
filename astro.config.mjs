import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import astroI18next from 'astro-i18next';
import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: 'https://scorusfitness.com', // URL base para el sitemap y SEO
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
  output: 'server', // Permite SSR (antes era 'hybrid' en Astro 4)
  adapter: vercel({
    webAnalytics: {
      enabled: true
    },
    edgeMiddleware: false
  }),
  image: {
    // Optimización de imágenes con Sharp estándar
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
    // Configuración de calidad de imágenes optimizada para PageSpeed
    remotePatterns: [],
    domains: [],
  },
  build: {
    // Inlinear assets pequeños para reducir requests
    inlineStylesheets: 'auto',
    // Optimizaciones de assets
    assets: '_astro',
  },
  compressHTML: true,
  vite: {
    build: {
      // Minimización CSS con Lightning CSS
      cssMinify: 'lightningcss',
      // Minimización JS
      minify: 'esbuild',
      // Optimizar chunks
      rollupOptions: {
        output: {
          // Organizar assets por tipo
          assetFileNames: (assetInfo) => {
            let extType = assetInfo.name.split('.').at(-1);
            if (/png|jpe?g|gif|svg|webp|avif/i.test(extType)) {
              extType = 'img';
            }
            return `assets/${extType}/[name]-[hash][extname]`;
          },
          // Optimizar chunks de código
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
          },
        },
      },
      // Habilitar source maps solo en dev
      sourcemap: false,
      // Optimizar tamaño del bundle
      chunkSizeWarningLimit: 1000,
    },
    ssr: {
      external: ['sharp'],
    },
    // Optimizaciones adicionales
    optimizeDeps: {
      include: ['react', 'react-dom'],
    },
  },
  // experimental: {
  //   // Opciones experimentales para Astro 5+
  // },
});

