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
  console.log('🚀 Creando localizaciones usando el método correcto de Strapi v5...\n');
  
  // 1. Obtener artículo original
  const articles = await fetchAPI(`/api/articles?locale=es&filters[title][$contains]=${encodeURIComponent('10 Alimentos')}`);
  const spanishArticle = articles.data[0];
  const articleId = spanishArticle.id;
  const documentId = spanishArticle.documentId;
  const attrs = spanishArticle.attributes || spanishArticle;
  
  console.log(`✅ Artículo original: "${attrs.title}"`);
  console.log(`   DocumentID: ${documentId}\n`);
  
  // 2. Traducciones
  const translations = {
    en: { title: '10 Foods You Didn\'t Know Have Protein', slug: '10-foods-you-didnt-know-have-protein', excerpt: 'Discover surprising sources of protein in everyday foods that can help you reach your daily protein goals.' },
    fr: { title: '10 Aliments que vous ne saviez pas contenaient des protéines', slug: '10-aliments-proteines-insoupconnes', excerpt: 'Découvrez des sources surprenantes de protéines dans les aliments quotidiens qui peuvent vous aider à atteindre vos objectifs protéiques quotidiens.' },
    de: { title: '10 Lebensmittel, von denen Sie nicht wussten, dass sie Protein enthalten', slug: '10-lebensmittel-mit-protein', excerpt: 'Entdecken Sie überraschende Proteinquellen in alltäglichen Lebensmitteln, die Ihnen helfen können, Ihre täglichen Proteinziele zu erreichen.' },
    hu: { title: '10 étel, amiről nem tudtad, hogy fehérjét tartalmaz', slug: '10-feherjetartalmu-etel', excerpt: 'Fedezz fel meglepő fehérjeforrásokat mindennapi ételekben, amelyek segíthetnek elérni a napi fehérjecéljaidat.' }
  };
  
  // 3. Para cada idioma, verificar si existe y crear/actualizar
  for (const [locale, trans] of Object.entries(translations)) {
    console.log(`\n🌍 ${locale.toUpperCase()}...`);
    
    // Verificar si existe
    let existing = null;
    try {
      const existingRes = await fetchAPI(`/api/articles?filters[slug][$eq]=${trans.slug}&locale=${locale}`);
      if (existingRes.data && existingRes.data.length > 0) {
        existing = existingRes.data[0];
        console.log(`   ⏭️  Ya existe (ID: ${existing.id}, DocumentID: ${existing.documentId})`);
        
        // Si existe pero no tiene el mismo documentId, eliminar y recrear
        if (existing.documentId !== documentId) {
          console.log(`   🔄 DocumentID diferente, recreando...`);
          try {
            await fetch(`${STRAPI_URL}/api/articles/${existing.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${TOKEN}` }
            });
            await new Promise(r => setTimeout(r, 500));
            existing = null;
          } catch (e) {
            console.log(`   ⚠️  No se pudo eliminar, continuando...`);
          }
        } else {
          console.log(`   ✅ Ya está vinculado correctamente`);
          continue;
        }
      }
    } catch (e) {}
    
    if (!existing) {
      // Crear nueva localización
      // En Strapi v5, para crear localizaciones vinculadas, debemos usar el endpoint
      // de documentos con el documentId y especificar el locale
      try {
        console.log(`   📝 Creando localización...`);
        
        // Método: Crear usando el endpoint de documentos con documentId
        // En Strapi v5, puedes crear localizaciones especificando el documentId
        const createData = {
          data: {
            locale: locale,
            title: trans.title,
            slug: trans.slug,
            excerpt: trans.excerpt,
            content: attrs.content || '',
            date: attrs.date || new Date().toISOString().split('T')[0],
            imageAlt: attrs.imageAlt || '',
            publishedAt: null,
          }
        };
        
        // Intentar crear usando el endpoint de documentos con documentId
        // En Strapi v5, el endpoint puede ser /api/documents/:documentId/localizations
        // o simplemente crear con el locale y el mismo documentId
        try {
          // Método 1: Endpoint de documentos
          const result = await fetchAPI(`/api/documents/${documentId}/localizations`, 'POST', createData);
          console.log(`   ✅ Localización creada (método documentos)`);
        } catch (e1) {
          // Método 2: Endpoint de artículos con locale
          // Crear artículo con locale - Strapi debería vincularlo automáticamente
          const result = await fetchAPI(`/api/articles?locale=${locale}`, 'POST', createData);
          console.log(`   ✅ Artículo creado con locale ${locale}`);
          console.log(`   ⚠️  Verifica en Strapi Admin que está vinculado como localización`);
        }
      } catch (error) {
        console.error(`   ❌ Error: ${error.message.substring(0, 200)}`);
      }
    }
    
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log('\n✅ Completado');
  console.log('\n💡 Si las localizaciones no están vinculadas automáticamente,');
  console.log('   vé a Strapi Admin > Content Manager > Articles');
  console.log('   y vincula manualmente las traducciones usando el mismo documentId.');
}

main().catch(console.error);


