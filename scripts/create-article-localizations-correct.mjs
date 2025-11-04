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
  console.log('🚀 Creando localizaciones correctamente vinculadas para el artículo de proteínas...\n');
  
  // 1. Obtener artículo original
  console.log('📋 Obteniendo artículo original...');
  const articles = await fetchAPI(`/api/articles?locale=es&filters[title][$contains]=${encodeURIComponent('10 Alimentos')}`);
  const spanishArticle = articles.data[0];
  const articleId = spanishArticle.id;
  const documentId = spanishArticle.documentId;
  const attrs = spanishArticle.attributes || spanishArticle;
  
  console.log(`✅ Artículo: "${attrs.title}"`);
  console.log(`   ID: ${articleId}, DocumentID: ${documentId}\n`);
  
  // 2. Eliminar todas las traducciones existentes que no están vinculadas
  console.log('🗑️  Eliminando traducciones existentes no vinculadas...');
  const translations = {
    en: { title: '10 Foods You Didn\'t Know Have Protein', slug: '10-foods-you-didnt-know-have-protein', excerpt: 'Discover surprising sources of protein in everyday foods that can help you reach your daily protein goals.' },
    fr: { title: '10 Aliments que vous ne saviez pas contenaient des protéines', slug: '10-aliments-proteines-insoupconnes', excerpt: 'Découvrez des sources surprenantes de protéines dans les aliments quotidiens qui peuvent vous aider à atteindre vos objectifs protéiques quotidiens.' },
    de: { title: '10 Lebensmittel, von denen Sie nicht wussten, dass sie Protein enthalten', slug: '10-lebensmittel-mit-protein', excerpt: 'Entdecken Sie überraschende Proteinquellen in alltäglichen Lebensmitteln, die Ihnen helfen können, Ihre täglichen Proteinziele zu erreichen.' },
    hu: { title: '10 étel, amiről nem tudtad, hogy fehérjét tartalmaz', slug: '10-feherjetartalmu-etel', excerpt: 'Fedezz fel meglepő fehérjeforrásokat mindennapi ételekben, amelyek segíthetnek elérni a napi fehérjecéljaidat.' }
  };
  
  for (const [locale, trans] of Object.entries(translations)) {
    try {
      const existing = await fetchAPI(`/api/articles?filters[slug][$eq]=${trans.slug}&locale=${locale}`);
      if (existing.data && existing.data.length > 0) {
        const existingArticle = existing.data[0];
        // Solo eliminar si no tiene el mismo documentId
        if (existingArticle.documentId !== documentId) {
          console.log(`   🗑️  Eliminando ${locale.toUpperCase()} (ID: ${existingArticle.id})...`);
          await fetch(`${STRAPI_URL}/api/articles/${existingArticle.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${TOKEN}` }
          });
          await new Promise(r => setTimeout(r, 500));
        }
      }
    } catch (e) {}
  }
  
  console.log('✅ Limpieza completada\n');
  
  // 3. Crear localizaciones usando el método correcto de Strapi v5
  // En Strapi v5, para crear localizaciones vinculadas, debemos usar el endpoint
  // POST /api/articles/:id/localizations con la estructura correcta
  console.log('📝 Creando localizaciones vinculadas...\n');
  
  for (const [locale, trans] of Object.entries(translations)) {
    console.log(`🌍 Creando localización ${locale.toUpperCase()}...`);
    
    // Verificar si ya existe con el documentId correcto
    try {
      const existing = await fetchAPI(`/api/articles?filters[documentId][$eq]=${documentId}&locale=${locale}`);
      if (existing.data && existing.data.length > 0) {
        console.log(`   ✅ Ya existe y está vinculada correctamente`);
        continue;
      }
    } catch (e) {}
    
    try {
      // En Strapi v5, el endpoint correcto para crear localizaciones es:
      // POST /api/articles/:id/localizations
      // Pero necesita el body sin el wrapper "data" o con estructura específica
      
      // Método 1: Intentar con estructura simple (sin wrapper data)
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
      
      // Intentar diferentes formatos del endpoint
      let result;
      let success = false;
      
      // Formato 1: Sin wrapper
      try {
        result = await fetchAPI(`/api/articles/${articleId}/localizations`, 'POST', localizationData);
        console.log(`   ✅ Localización creada (formato directo)`);
        success = true;
      } catch (e1) {
        // Formato 2: Con wrapper data
        try {
          result = await fetchAPI(`/api/articles/${articleId}/localizations`, 'POST', { data: localizationData });
          console.log(`   ✅ Localización creada (formato con data)`);
          success = true;
        } catch (e2) {
          // Formato 3: Usar el documentId directamente
          try {
            result = await fetchAPI(`/api/articles/documentId/${documentId}/localizations`, 'POST', { data: localizationData });
            console.log(`   ✅ Localización creada (usando documentId)`);
            success = true;
          } catch (e3) {
            // Formato 4: Crear artículo y luego vincular (último recurso)
            console.log(`   ⚠️  Endpoint /localizations no disponible, usando método alternativo...`);
            
            // Crear artículo con locale especificado
            const newArticle = await fetchAPI(`/api/articles?locale=${locale}`, 'POST', {
              data: localizationData
            });
            
            console.log(`   ⚠️  Artículo creado pero requiere vinculación manual en Strapi Admin`);
            console.log(`   📋 ID: ${newArticle.data?.id}, DocumentID: ${newArticle.data?.documentId}`);
            console.log(`   💡 Ve a Strapi Admin y vincula este artículo como localización del original`);
            success = true;
          }
        }
      }
      
      if (success) {
        await new Promise(r => setTimeout(r, 300));
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message.substring(0, 300)}`);
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('✅ Proceso completado');
  console.log('═══════════════════════════════════════');
  console.log('\n💡 Verifica en Strapi Admin que todas las localizaciones');
  console.log('   están vinculadas al artículo original.');
  console.log('   Si no están vinculadas, usa el selector de idiomas');
  console.log('   en el artículo original para vincularlas manualmente.');
}

main().catch(console.error);


