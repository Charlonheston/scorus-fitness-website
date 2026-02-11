import type { APIRoute } from 'astro';
import { getArticles, type StrapiArticle } from '@lib/strapi';

const site = 'https://scorusfitness.com';

// Idiomas soportados
const supportedLocales = ['es', 'en', 'fr', 'de', 'hu'] as const;

// Todas las páginas estáticas del sitio organizadas por idioma
const staticPages: Record<string, string[]> = {
  es: [
    '', // home
    'academia',
    'academia/re-born',
    'academia/scorus-campus',
    'academia/seminarios',
    'biografia',
    'blog',
    'contacto',
    'gym',
    'servicios',
    'servicios/asesoramiento-online',
    'servicios/consultoria-online',
    'servicios/entrenamiento-personal',
    'servicios/seminarios',
    'servicios/talleres',
    'servicios/video-cursos',
  ],
  en: [
    '',
    'academy',
    'academy/re-born',
    'academy/scorus-campus',
    'academy/seminars',
    'academy/video-courses',
    'biography',
    'blog',
    'contact',
    'gym',
    'services',
    'services/online-consulting',
    'services/online-counseling',
    'services/personal-training',
    'services/seminars',
    'services/video-courses',
    'services/workshops',
  ],
  fr: [
    '',
    'academie',
    'academie/cours-video',
    'academie/re-born',
    'academie/scorus-campus',
    'academie/seminaires',
    'biographie',
    'blog',
    'contact',
    'gym',
    'services',
    'services/ateliers',
    'services/coaching-en-ligne',
    'services/conseil-en-ligne',
    'services/cours-video',
    'services/entrainement-personnel',
    'services/seminaires',
  ],
  de: [
    '',
    'akademie',
    'akademie/re-born',
    'akademie/scorus-campus',
    'akademie/seminare',
    'akademie/videokurse',
    'biografie',
    'blog',
    'dienstleistungen',
    'dienstleistungen/online-beratung-coaching',
    'dienstleistungen/online-beratung',
    'dienstleistungen/personliches-training',
    'dienstleistungen/seminare',
    'dienstleistungen/video-kurse',
    'dienstleistungen/workshops',
    'gym',
    'kontakt',
  ],
  hu: [
    '',
    'akademia',
    'akademia/re-born',
    'akademia/scorus-campus',
    'akademia/szeminarium',
    'akademia/videokursusok',
    'blog',
    'eletrajz',
    'gym',
    'kapcsolat',
    'szolgaltatasok',
    'szolgaltatasok/online-tanacsadas-coaching',
    'szolgaltatasok/online-tanacsadas',
    'szolgaltatasok/szemelyi-edzes',
    'szolgaltatasok/szeminariumok',
    'szolgaltatasok/video-kurzusok',
    'szolgaltatasok/workshopok',
  ],
};

// Mapeo de rutas equivalentes entre idiomas (para hreflang)
const routeEquivalents: Record<string, Record<string, string>> = {
  '': { es: '', en: '', fr: '', de: '', hu: '' },
  'servicios': { es: 'servicios', en: 'services', fr: 'services', de: 'dienstleistungen', hu: 'szolgaltatasok' },
  'academia': { es: 'academia', en: 'academy', fr: 'academie', de: 'akademie', hu: 'akademia' },
  'biografia': { es: 'biografia', en: 'biography', fr: 'biographie', de: 'biografie', hu: 'eletrajz' },
  'contacto': { es: 'contacto', en: 'contact', fr: 'contact', de: 'kontakt', hu: 'kapcsolat' },
  'blog': { es: 'blog', en: 'blog', fr: 'blog', de: 'blog', hu: 'blog' },
  'gym': { es: 'gym', en: 'gym', fr: 'gym', de: 'gym', hu: 'gym' },
};

export const GET: APIRoute = async () => {
  const urls: string[] = [];
  
  // 1. Generar URLs para páginas estáticas con hreflang
  for (const [lang, pagePaths] of Object.entries(staticPages)) {
    for (const path of pagePaths) {
      const fullPath = path ? `${lang}/${path}` : lang;
      const priority = path === '' ? '1.0' : '0.8';
      const changefreq = path === '' ? 'daily' : 'weekly';
      
      // Generar hreflang links para páginas equivalentes
      let hreflangLinks = '';
      const baseRoute = path.split('/')[0] || '';
      
      if (routeEquivalents[baseRoute]) {
        for (const locale of supportedLocales) {
          const equivalentPath = routeEquivalents[baseRoute][locale];
          if (equivalentPath !== undefined) {
            const altPath = path ? `${locale}/${path.replace(baseRoute, equivalentPath)}` : locale;
            hreflangLinks += `
      <xhtml:link rel="alternate" hreflang="${locale}" href="${site}/${altPath}/" />`;
          }
        }
        // x-default apunta a español
        hreflangLinks += `
      <xhtml:link rel="alternate" hreflang="x-default" href="${site}/es/${path ? path : ''}/" />`;
      }
      
      urls.push(`
    <url>
      <loc>${site}/${fullPath}/</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>${hreflangLinks}
    </url>`);
    }
  }
  
  // 2. Obtener y añadir artículos del blog dinámicamente desde Strapi
  try {
    // Obtener artículos de todos los idiomas
    const articlesByLocale: Record<string, StrapiArticle[]> = {};
    
    for (const locale of supportedLocales) {
      try {
        const articles = await getArticles(locale);
        articlesByLocale[locale] = articles;
      } catch (error) {
        console.error(`Error fetching articles for locale ${locale}:`, error);
        articlesByLocale[locale] = [];
      }
    }
    
    // Generar URLs para artículos del blog
    for (const [locale, articles] of Object.entries(articlesByLocale)) {
      for (const article of articles) {
        const slug = article.attributes.slug;
        const updatedAt = article.attributes.updatedAt || article.attributes.createdAt;
        const lastmod = new Date(updatedAt).toISOString().split('T')[0];
        
        // Generar hreflang para las localizaciones del artículo
        let hreflangLinks = '';
        const localizations = article.attributes.localizations?.data || [];
        
        // Incluir el artículo actual
        hreflangLinks += `
      <xhtml:link rel="alternate" hreflang="${locale}" href="${site}/${locale}/blog/${slug}/" />`;
        
        // Incluir las localizaciones
        for (const loc of localizations) {
          const locLocale = loc.attributes?.locale || (loc as any).locale;
          const locSlug = loc.attributes?.slug || (loc as any).slug;
          if (locLocale && locSlug) {
            hreflangLinks += `
      <xhtml:link rel="alternate" hreflang="${locLocale}" href="${site}/${locLocale}/blog/${locSlug}/" />`;
          }
        }
        
        // x-default apunta a español si existe
        const esVersion = localizations.find((loc: any) => 
          (loc.attributes?.locale || loc.locale) === 'es'
        );
        if (esVersion) {
          const esSlug = esVersion.attributes?.slug || (esVersion as any).slug;
          hreflangLinks += `
      <xhtml:link rel="alternate" hreflang="x-default" href="${site}/es/blog/${esSlug}/" />`;
        } else if (locale === 'es') {
          hreflangLinks += `
      <xhtml:link rel="alternate" hreflang="x-default" href="${site}/es/blog/${slug}/" />`;
        }
        
        urls.push(`
    <url>
      <loc>${site}/${locale}/blog/${slug}/</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>${hreflangLinks}
    </url>`);
      }
    }
  } catch (error) {
    console.error('Error generating blog URLs for sitemap:', error);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
