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

async function waitForDeletion(articleId, maxAttempts = 10) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await fetchAPI(`/api/articles/${articleId}`);
      // Si todavía existe, esperar
      await new Promise(r => setTimeout(r, 500));
    } catch (e) {
      // Si da 404, ya fue eliminado
      if (e.message.includes('404')) {
        return true;
      }
    }
  }
  return false;
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
  console.log(`   ID: ${articleId}, DocumentID: ${documentId}\n`);
  
  // 2. Eliminar TODAS las traducciones existentes y esperar confirmación
  console.log('🗑️  Eliminando todas las traducciones existentes...');
  const slugs = {
    en: '10-foods-you-didnt-know-have-protein',
    fr: '10-aliments-proteines-insoupconnes',
    de: '10-lebensmittel-mit-protein',
    hu: '10-feherjetartalmu-etel'
  };
  
  const toDelete = [];
  for (const [locale, slug] of Object.entries(slugs)) {
    try {
      const existing = await fetchAPI(`/api/articles?filters[slug][$eq]=${slug}&locale=${locale}`);
      if (existing.data && existing.data.length > 0) {
        const art = existing.data[0];
        if (art.documentId !== documentId) {
          toDelete.push({ id: art.id, locale, slug });
        }
      }
    } catch (e) {}
  }
  
  for (const item of toDelete) {
    console.log(`   🗑️  Eliminando ${item.locale.toUpperCase()} (ID: ${item.id})...`);
    try {
      await fetch(`${STRAPI_URL}/api/articles/${item.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      await waitForDeletion(item.id);
      console.log(`   ✅ ${item.locale.toUpperCase()} eliminado`);
    } catch (e) {
      console.log(`   ⚠️  Error eliminando ${item.locale}: ${e.message.substring(0, 100)}`);
    }
  }
  
  console.log('✅ Limpieza completada\n');
  
  // 3. Crear localizaciones usando el método correcto
  // En Strapi v5, para crear localizaciones vinculadas correctamente,
  // debemos usar el endpoint del plugin i18n o crear con una estructura específica
  
  const translations = {
    en: { title: '10 Foods You Didn\'t Know Have Protein', slug: '10-foods-you-didnt-know-have-protein', excerpt: 'Discover surprising sources of protein in everyday foods that can help you reach your daily protein goals.' },
    fr: { title: '10 Aliments que vous ne saviez pas contenaient des protéines', slug: '10-aliments-proteines-insoupconnes', excerpt: 'Découvrez des sources surprenantes de protéines dans les aliments quotidiens qui peuvent vous aider à atteindre vos objectifs protéiques quotidiens.' },
    de: { title: '10 Lebensmittel, von denen Sie nicht wussten, dass sie Protein enthalten', slug: '10-lebensmittel-mit-protein', excerpt: 'Entdecken Sie überraschende Proteinquellen in alltäglichen Lebensmitteln, die Ihnen helfen können, Ihre täglichen Proteinziele zu erreichen.' },
    hu: { title: '10 étel, amiről nem tudtad, hogy fehérjét tartalmaz', slug: '10-feherjetartalmu-etel', excerpt: 'Fedezz fel meglepő fehérjeforrásokat mindennapi ételekben, amelyek segíthetnek elérni a napi fehérjecéljaidat.' }
  };
  
  console.log('📝 Creando localizaciones...\n');
  
  const createdArticles = [];
  
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
      
      // Crear artículo con locale
      const result = await fetchAPI(`/api/articles?locale=${locale}`, 'POST', {
        data: localizationData
      });
      
      const newId = result.data?.id;
      const newDocId = result.data?.documentId;
      
      console.log(`   ✅ Artículo creado (ID: ${newId}, DocumentID: ${newDocId})`);
      createdArticles.push({ locale, id: newId, documentId: newDocId });
      
      await new Promise(r => setTimeout(r, 500));
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message.substring(0, 300)}`);
    }
  }
  
  console.log('\n📋 Resumen de artículos creados:');
  createdArticles.forEach(a => {
    console.log(`   ${a.locale.toUpperCase()}: ID ${a.id}, DocumentID ${a.documentId}`);
  });
  
  console.log('\n⚠️  IMPORTANTE: Los artículos fueron creados pero NO están vinculados como localizaciones.');
  console.log('   Para vincularlos correctamente:');
  console.log('   1. Ve a Strapi Admin > Content Manager > Articles');
  console.log('   2. Abre el artículo original en español');
  console.log('   3. Usa el selector de idiomas en la parte superior derecha');
  console.log('   4. Para cada idioma, selecciona "Link existing entry" y elige el artículo correspondiente');
  console.log('\n   O alternativamente, elimina estos artículos y créalos manualmente');
  console.log('   usando el selector de idiomas en Strapi Admin.');
}

main().catch(console.error);


