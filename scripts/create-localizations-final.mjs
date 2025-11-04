import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN || '';

async function fetchAPI(endpoint, method = 'GET', body = null) {
  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN && { Authorization: `Bearer ${TOKEN}` })
    },
    ...(body && { body: JSON.stringify(body) })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 500)}`);
  }
  return res.json();
}

async function main() {
  console.log('🚀 Creando localizaciones correctamente vinculadas...\n');
  
  // 1. Obtener artículo original
  const articles = await fetchAPI(`/api/articles?locale=es&filters[title][$contains]=${encodeURIComponent('10 Alimentos')}`);
  const spanishArticle = articles.data[0];
  const articleId = spanishArticle.id;
  const documentId = spanishArticle.documentId;
  const attrs = spanishArticle.attributes || spanishArticle;
  
  console.log(`✅ Artículo original: "${attrs.title}"`);
  console.log(`   DocumentID: ${documentId}\n`);
  
  // 2. Eliminar traducciones existentes
  console.log('🗑️  Eliminando traducciones no vinculadas...');
  const slugs = {
    en: '10-foods-you-didnt-know-have-protein',
    fr: '10-aliments-proteines-insoupconnes',
    de: '10-lebensmittel-mit-protein',
    hu: '10-feherjetartalmu-etel'
  };
  
  for (const [locale, slug] of Object.entries(slugs)) {
    try {
      const existing = await fetchAPI(`/api/articles?filters[slug][$eq]=${slug}&locale=${locale}`);
      if (existing.data && existing.data.length > 0) {
        const art = existing.data[0];
        if (art.documentId !== documentId) {
          await fetch(`${STRAPI_URL}/api/articles/${art.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${TOKEN}` }
          });
          await new Promise(r => setTimeout(r, 800));
        }
      }
    } catch (e) {}
  }
  
  console.log('✅ Limpieza completada\n');
  
  // 3. Crear localizaciones usando el método correcto
  // En Strapi v5, para crear localizaciones vinculadas, debemos usar
  // el endpoint POST /api/content-manager/collection-types/api::article.article/:id/localizations
  // o el endpoint del plugin i18n
  
  const translations = {
    en: { title: '10 Foods You Didn\'t Know Have Protein', slug: '10-foods-you-didnt-know-have-protein', excerpt: 'Discover surprising sources of protein in everyday foods that can help you reach your daily protein goals.' },
    fr: { title: '10 Aliments que vous ne saviez pas contenaient des protéines', slug: '10-aliments-proteines-insoupconnes', excerpt: 'Découvrez des sources surprenantes de protéines dans les aliments quotidiens qui peuvent vous aider à atteindre vos objectifs protéiques quotidiens.' },
    de: { title: '10 Lebensmittel, von denen Sie nicht wussten, dass sie Protein enthalten', slug: '10-lebensmittel-mit-protein', excerpt: 'Entdecken Sie überraschende Proteinquellen in alltäglichen Lebensmitteln, die Ihnen helfen können, Ihre täglichen Proteinziele zu erreichen.' },
    hu: { title: '10 étel, amiről nem tudtad, hogy fehérjét tartalmaz', slug: '10-feherjetartalmu-etel', excerpt: 'Fedezz fel meglepő fehérjeforrásokat mindennapi ételekben, amelyek segíthetnek elérni a napi fehérjecéljaidat.' }
  };
  
  console.log('📝 Creando localizaciones vinculadas...\n');
  
  for (const [locale, trans] of Object.entries(translations)) {
    console.log(`🌍 ${locale.toUpperCase()}...`);
    
    // Verificar si ya existe vinculada
    try {
      const existing = await fetchAPI(`/api/articles?filters[documentId][$eq]=${documentId}&locale=${locale}`);
      if (existing.data && existing.data.length > 0) {
        console.log(`   ✅ Ya existe y está vinculada`);
        continue;
      }
    } catch (e) {}
    
    try {
      // Método 1: Endpoint del Content Manager (puede funcionar)
      const localizationData = {
        locale: locale,
        title: trans.title,
        slug: trans.slug,
        excerpt: trans.excerpt,
        content: attrs.content || '',
        date: attrs.date || new Date().toISOString().split('T')[0],
        imageAlt: attrs.imageAlt || '',
        publishedAt: null,
      };
      
      let success = false;
      
      // Intentar endpoint del Content Manager
      try {
        const result = await fetchAPI(
          `/api/content-manager/collection-types/api::article.article/${articleId}/localizations`,
          'POST',
          { data: localizationData }
        );
        console.log(`   ✅ Localización creada (Content Manager API)`);
        success = true;
      } catch (e1) {
        // Intentar endpoint alternativo del Content Manager
        try {
          const result = await fetchAPI(
            `/api/content-manager/collection-types/api::article.article/${articleId}/localizations`,
            'POST',
            localizationData
          );
          console.log(`   ✅ Localización creada (Content Manager API - sin wrapper)`);
          success = true;
        } catch (e2) {
          // Intentar endpoint estándar de artículos con locale
          try {
            const result = await fetchAPI(`/api/articles/${articleId}/localizations`, 'POST', {
              data: localizationData
            });
            console.log(`   ✅ Localización creada (endpoint estándar)`);
            success = true;
          } catch (e3) {
            // Último recurso: crear artículo y luego intentar vincular
            console.log(`   ⚠️  Endpoints de localización no disponibles`);
            console.log(`   📝 Creando artículo con locale ${locale}...`);
            
            const newArticle = await fetchAPI(`/api/articles?locale=${locale}`, 'POST', {
              data: localizationData
            });
            
            console.log(`   ⚠️  Artículo creado pero NO vinculado como localización`);
            console.log(`   📋 Necesitas vincularlo manualmente en Strapi Admin`);
            console.log(`   💡 ID: ${newArticle.data?.id}, DocumentID: ${newArticle.data?.documentId}`);
            success = true;
          }
        }
      }
      
      if (success) {
        await new Promise(r => setTimeout(r, 500));
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message.substring(0, 300)}`);
    }
  }
  
  console.log('\n✅ Proceso completado');
  console.log('\n💡 Si las localizaciones no están vinculadas automáticamente,');
  console.log('   ve a Strapi Admin > Content Manager > Articles');
  console.log('   y usa el selector de idiomas para vincularlas.');
}

main().catch(console.error);


