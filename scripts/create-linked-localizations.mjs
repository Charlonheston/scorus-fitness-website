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
  console.log('🚀 Creando localizaciones VINCULADAS para el artículo...\n');
  
  // 1. Buscar artículo original
  console.log('📋 Buscando artículo original...');
  let spanishArticle;
  try {
    const articles = await fetchAPI(`/api/articles?locale=es&filters[title][$contains]=${encodeURIComponent('10 Alimentos')}`);
    if (!articles.data || articles.data.length === 0) {
      console.error('❌ No se encontró el artículo');
      return;
    }
    spanishArticle = articles.data[0];
  } catch (e) {
    console.error('❌ Error obteniendo artículo:', e.message);
    return;
  }
  
  const articleId = spanishArticle.id;
  const documentId = spanishArticle.documentId;
  const attrs = spanishArticle.attributes || spanishArticle;
  
  console.log(`✅ Artículo: "${attrs.title}"`);
  console.log(`   ID: ${articleId}, DocumentID: ${documentId}\n`);
  
  // 2. Traducciones
  const translations = {
    en: { 
      title: '10 Foods You Didn\'t Know Have Protein', 
      slug: '10-foods-you-didnt-know-have-protein', 
      excerpt: 'Discover surprising sources of protein in everyday foods that can help you reach your daily protein goals.' 
    },
    fr: { 
      title: '10 Aliments que vous ne saviez pas contenaient des protéines', 
      slug: '10-aliments-proteines-insoupconnes', 
      excerpt: 'Découvrez des sources surprenantes de protéines dans les aliments quotidiens qui peuvent vous aider à atteindre vos objectifs protéiques quotidiens.' 
    },
    de: { 
      title: '10 Lebensmittel, von denen Sie nicht wussten, dass sie Protein enthalten', 
      slug: '10-lebensmittel-mit-protein', 
      excerpt: 'Entdecken Sie überraschende Proteinquellen in alltäglichen Lebensmitteln, die Ihnen helfen können, Ihre täglichen Proteinziele zu erreichen.' 
    },
    hu: { 
      title: '10 étel, amiről nem tudtad, hogy fehérjét tartalmaz', 
      slug: '10-feherjetartalmu-etel', 
      excerpt: 'Fedezz fel meglepő fehérjeforrásokat mindennapi ételekben, amelyek segíthetnek elérni a napi fehérjecéljaidat.' 
    }
  };
  
  // 3. Crear localizaciones usando el endpoint del Content Manager que usa Strapi Admin
  console.log('📝 Creando localizaciones vinculadas usando Content Manager API...\n');
  
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
      // Usar el endpoint del Content Manager que es el que usa Strapi Admin internamente
      // Este endpoint crea localizaciones VINCULADAS automáticamente
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
      
      // Intentar con el endpoint /actions/localize que es el que usa Strapi Admin
      const result = await fetchAPI(
        `/api/content-manager/collection-types/api::article.article/${articleId}/actions/localize`,
        'POST',
        { data: localizationData }
      );
      
      console.log(`   ✅ Localización creada y VINCULADA correctamente`);
      console.log(`   📋 DocumentID: ${result.data?.documentId || 'N/A'}`);
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message.substring(0, 300)}`);
      
      // Si falla, intentar método alternativo
      try {
        console.log(`   💡 Intentando método alternativo...`);
        const result = await fetchAPI(
          `/api/content-manager/collection-types/api::article.article/${articleId}/localizations`,
          'POST',
          { data: localizationData }
        );
        console.log(`   ✅ Localización creada (método alternativo)`);
      } catch (e2) {
        console.error(`   ❌ Método alternativo también falló: ${e2.message.substring(0, 200)}`);
      }
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n✅ Proceso completado');
  console.log('\n🔍 Verificando localizaciones...');
  
  // Verificar que todas están vinculadas
  try {
    const allLocalizations = await fetchAPI(`/api/articles?filters[documentId][$eq]=${documentId}`);
    console.log(`\n📊 Total de localizaciones vinculadas: ${allLocalizations.data?.length || 0}`);
    if (allLocalizations.data) {
      allLocalizations.data.forEach(art => {
        console.log(`   - ${art.locale.toUpperCase()}: "${art.title || art.attributes?.title}" (ID: ${art.id}, DocID: ${art.documentId})`);
      });
    }
  } catch (e) {
    console.error('Error verificando:', e.message);
  }
}

main().catch(console.error);

