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
  console.log('🚀 Recreando localizaciones correctamente para el artículo de proteínas...\n');
  
  // 1. Buscar el artículo original en español
  console.log('📋 Buscando artículo en español...');
  const articles = await fetchAPI(`/api/articles?locale=es&filters[title][$contains]=${encodeURIComponent('10 Alimentos')}`);
  
  if (!articles.data || articles.data.length === 0) {
    console.error('❌ No se encontró el artículo');
    return;
  }
  
  const spanishArticle = articles.data[0];
  const articleId = spanishArticle.id;
  const documentId = spanishArticle.documentId;
  const attrs = spanishArticle.attributes || spanishArticle;
  
  console.log(`✅ Artículo encontrado: "${attrs.title}"`);
  console.log(`   ID: ${articleId}, DocumentID: ${documentId}\n`);
  
  // 2. Traducciones
  const translations = {
    en: {
      title: '10 Foods You Didn\'t Know Have Protein',
      slug: '10-foods-you-didnt-know-have-protein',
      excerpt: 'Discover surprising sources of protein in everyday foods that can help you reach your daily protein goals.',
    },
    fr: {
      title: '10 Aliments que vous ne saviez pas contenaient des protéines',
      slug: '10-aliments-proteines-insoupconnes',
      excerpt: 'Découvrez des sources surprenantes de protéines dans les aliments quotidiens qui peuvent vous aider à atteindre vos objectifs protéiques quotidiens.',
    },
    de: {
      title: '10 Lebensmittel, von denen Sie nicht wussten, dass sie Protein enthalten',
      slug: '10-lebensmittel-mit-protein',
      excerpt: 'Entdecken Sie überraschende Proteinquellen in alltäglichen Lebensmitteln, die Ihnen helfen können, Ihre täglichen Proteinziele zu erreichen.',
    },
    hu: {
      title: '10 étel, amiről nem tudtad, hogy fehérjét tartalmaz',
      slug: '10-feherjetartalmu-etel',
      excerpt: 'Fedezz fel meglepő fehérjeforrásokat mindennapi ételekben, amelyek segíthetnek elérni a napi fehérjecéljaidat.',
    }
  };
  
  // 3. Eliminar traducciones existentes y recrearlas correctamente
  const locales = ['en', 'fr', 'de', 'hu'];
  
  for (const locale of locales) {
    console.log(`\n🌍 Procesando ${locale.toUpperCase()}...`);
    
    // Buscar traducción existente
    let existingId = null;
    try {
      const existing = await fetchAPI(`/api/articles?filters[slug][$eq]=${translations[locale].slug}&locale=${locale}`);
      if (existing.data && existing.data.length > 0) {
        existingId = existing.data[0].id;
        console.log(`   🗑️  Eliminando traducción existente (ID: ${existingId})...`);
        try {
          // En Strapi v5, DELETE puede requerir el locale o no
          const deleteRes = await fetch(`${STRAPI_URL}/api/articles/${existingId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              ...(TOKEN && { Authorization: `Bearer ${TOKEN}` })
            }
          });
          
          if (deleteRes.ok) {
            console.log(`   ✅ Traducción eliminada`);
            // Esperar un poco para que Strapi procese la eliminación
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            const text = await deleteRes.text();
            throw new Error(`HTTP ${deleteRes.status}: ${text.substring(0, 200)}`);
          }
        } catch (deleteError) {
          console.error(`   ⚠️  Error eliminando: ${deleteError.message.substring(0, 200)}`);
          // Continuar de todas formas
        }
      }
    } catch (e) {
      // No existe, continuar
    }
    
    // Crear nueva localización usando el endpoint correcto
    try {
      const createData = {
        data: {
          locale: locale,
          title: translations[locale].title,
          slug: translations[locale].slug,
          excerpt: translations[locale].excerpt,
          content: attrs.content || '', // Mantener contenido en español por ahora
          date: attrs.date || new Date().toISOString().split('T')[0],
          imageAlt: attrs.imageAlt || '',
          publishedAt: null,
        }
      };
      
      // En Strapi v5, para crear una localización vinculada, debemos crear el artículo
      // con el mismo documentId. Sin embargo, el documentId no se puede establecer directamente.
      // La solución es usar el endpoint de localizaciones del documento original.
      // Intentar primero el endpoint estándar de localizaciones
      console.log(`   📝 Creando localización...`);
      let result;
      
      // Método: Crear artículo con locale y luego vincular usando documentId
      // En Strapi v5, cuando creas un artículo con locale diferente al original,
      // debes usar el endpoint de localizaciones del documento
      try {
        // Intentar con el endpoint de localizaciones usando el documentId
        // En Strapi v5, el endpoint puede ser diferente
        const localizationData = {
          locale: locale,
          title: translations[locale].title,
          slug: translations[locale].slug,
          excerpt: translations[locale].excerpt,
          content: attrs.content || '',
          date: attrs.date || new Date().toISOString().split('T')[0],
          imageAlt: attrs.imageAlt || '',
          publishedAt: null,
        };
        
        // Intentar crear usando el endpoint de documentos en lugar de artículos
        // En Strapi v5, los documentos pueden tener localizaciones
        result = await fetchAPI(`/api/articles/${documentId}/localizations`, 'POST', { data: localizationData });
        
        console.log(`   ✅ Localización creada usando documentId`);
        console.log(`   📋 ID: ${result.data?.id || 'N/A'}, DocumentID: ${result.data?.documentId || 'N/A'}`);
      } catch (e1) {
        // Si falla, intentar con el ID del artículo
        try {
          result = await fetchAPI(`/api/articles/${articleId}/localizations`, 'POST', createData);
          console.log(`   ✅ Localización creada usando articleId`);
        } catch (e2) {
          // Si ambos fallan, crear como artículo nuevo (no vinculado)
          console.log(`   ⚠️  No se pudo crear como localización vinculada`);
          console.log(`   ℹ️  Creando como artículo independiente...`);
          throw e2;
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error creando localización: ${error.message}`);
      
      // Si falla el endpoint de localizaciones, intentar método alternativo
      console.log(`   ℹ️  Intentando método alternativo...`);
      try {
        const createData = {
          data: {
            locale: locale,
            title: translations[locale].title,
            slug: translations[locale].slug,
            excerpt: translations[locale].excerpt,
            content: attrs.content || '',
            date: attrs.date || new Date().toISOString().split('T')[0],
            imageAlt: attrs.imageAlt || '',
            publishedAt: null,
          }
        };
        
        const result = await fetchAPI(`/api/articles?locale=${locale}`, 'POST', createData);
        console.log(`   ⚠️  Artículo creado como independiente (requiere vinculación manual en Strapi Admin)`);
      } catch (altError) {
        console.error(`   ❌ Error método alternativo: ${altError.message.substring(0, 200)}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('✅ Proceso completado');
  console.log('═══════════════════════════════════════');
  console.log('\n💡 Las localizaciones deberían estar vinculadas al artículo original.');
  console.log('   Verifica en Strapi Admin que todas las traducciones están vinculadas.');
}

main().catch(console.error);

