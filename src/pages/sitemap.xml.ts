import type { APIRoute } from 'astro';

const site = 'https://scorusfitness.com';

// Todas las páginas del sitio organizadas por idioma
const pages = {
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

export const GET: APIRoute = async () => {
  const urls: string[] = [];
  
  // Generar URLs para cada idioma
  for (const [lang, pagePaths] of Object.entries(pages)) {
    for (const path of pagePaths) {
      const fullPath = path ? `${lang}/${path}` : lang;
      urls.push(`
    <url>
      <loc>${site}/${fullPath}/</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${path === '' ? '1.0' : '0.8'}</priority>
    </url>`);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
