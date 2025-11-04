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
  console.log('🚀 Creando localizaciones para el artículo de proteínas...\n');
  
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
  
  // 2. Obtener las traducciones existentes
  const locales = ['en', 'fr', 'de', 'hu'];
  const translations = {
    en: {
      title: '10 Foods You Didn\'t Know Have Protein',
      slug: '10-foods-you-didnt-know-have-protein',
    },
    fr: {
      title: '10 Aliments que vous ne saviez pas contenaient des protéines',
      slug: '10-aliments-proteines-insoupconnes',
    },
    de: {
      title: '10 Lebensmittel, von denen Sie nicht wussten, dass sie Protein enthalten',
      slug: '10-lebensmittel-mit-protein',
    },
    hu: {
      title: '10 étel, amiről nem tudtad, hogy fehérjét tartalmaz',
      slug: '10-feherjetartalmu-etel',
    }
  };
  
  // 3. Para cada idioma, crear o actualizar la localización
  for (const locale of locales) {
    console.log(`\n🌍 Procesando ${locale.toUpperCase()}...`);
    
    // Buscar si ya existe una traducción
    let existingTranslation = null;
    try {
      const existing = await fetchAPI(`/api/articles?filters[slug][$eq]=${translations[locale].slug}&locale=${locale}`);
      if (existing.data && existing.data.length > 0) {
        existingTranslation = existing.data[0];
        console.log(`   📝 Traducción existente encontrada (ID: ${existingTranslation.id})`);
      }
    } catch (e) {
      // No existe, continuar
    }
    
    // Si existe, actualizar para vincularla como localización
    if (existingTranslation) {
      try {
        // Actualizar el artículo existente para vincularlo como localización
        // En Strapi v5, debemos usar el mismo documentId para vincular localizaciones
        const updateData = {
          data: {
            // Mantener todos los campos existentes y asegurar que tiene el mismo documentId
            documentId: documentId, // Usar el mismo documentId del artículo original
          }
        };
        
        const result = await fetchAPI(`/api/articles/${existingTranslation.id}?locale=${locale}`, 'PUT', updateData);
        console.log(`   ✅ Traducción vinculada como localización`);
      } catch (error) {
        console.error(`   ⚠️  Error vinculando localización: ${error.message.substring(0, 200)}`);
        // Continuar de todas formas
      }
    } else {
      // Si no existe, crear nueva localización usando el endpoint correcto
      try {
        // En Strapi v5, para crear una localización vinculada, debemos usar el endpoint de localizaciones
        // con el documentId del artículo original
        const createData = {
          data: {
            locale: locale,
            title: translations[locale].title,
            slug: translations[locale].slug,
            excerpt: attrs.excerpt || '',
            content: attrs.content || '',
            date: attrs.date || new Date().toISOString().split('T')[0],
            publishedAt: null,
          }
        };
        
        // Intentar crear usando el endpoint de localizaciones
        try {
          const result = await fetchAPI(`/api/articles/${articleId}/localizations`, 'POST', createData);
          console.log(`   ✅ Localización creada usando endpoint /localizations`);
        } catch (localizationError) {
          // Si falla, crear como artículo nuevo y luego vincular
          console.log(`   ℹ️  Creando artículo nuevo y vinculándolo...`);
          const newArticle = await fetchAPI(`/api/articles?locale=${locale}`, 'POST', createData);
          
          if (newArticle.data) {
            // Intentar vincular actualizando el documentId
            try {
              await fetchAPI(`/api/articles/${newArticle.data.id}?locale=${locale}`, 'PUT', {
                data: { documentId: documentId }
              });
              console.log(`   ✅ Artículo creado y vinculado`);
            } catch (linkError) {
              console.log(`   ⚠️  Artículo creado pero requiere vinculación manual en Strapi Admin`);
            }
          }
        }
      } catch (error) {
        console.error(`   ❌ Error creando localización: ${error.message.substring(0, 200)}`);
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('✅ Proceso completado');
  console.log('═══════════════════════════════════════');
  console.log('\n💡 Nota: Si las localizaciones no están vinculadas automáticamente,');
  console.log('   debes vincularlas manualmente en Strapi Admin usando el mismo documentId.');
}

main().catch(console.error);


