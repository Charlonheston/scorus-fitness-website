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
  console.log('🚀 Creando localizaciones para el artículo ID 20...\n');
  
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
  
  // 2. Eliminar traducciones existentes si existen
  console.log('🗑️  Verificando traducciones existentes...');
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
          console.log(`   🗑️  Eliminando ${locale.toUpperCase()} (ID: ${art.id})...`);
          try {
            await fetch(`${STRAPI_URL}/api/articles/${art.id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${TOKEN}` }
            });
            // Esperar y verificar que se eliminó
            await new Promise(r => setTimeout(r, 1000));
            let deleted = false;
            for (let i = 0; i < 5; i++) {
              try {
                await fetchAPI(`/api/articles/${art.id}`);
                await new Promise(r => setTimeout(r, 500));
              } catch (checkError) {
                if (checkError.message.includes('404')) {
                  deleted = true;
                  break;
                }
              }
            }
            if (deleted) {
              console.log(`   ✅ ${locale.toUpperCase()} eliminado correctamente`);
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }
  
  console.log('✅ Limpieza completada\n');
  
  // 3. Traducciones
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
  
  // 4. Crear localizaciones usando el endpoint del Content Manager
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
      
      // Intentar diferentes métodos para crear localizaciones vinculadas
      let success = false;
      
      // Método 1: Endpoint del Content Manager con /actions/localize
      try {
        const result = await fetchAPI(
          `/api/content-manager/collection-types/api::article.article/${articleId}/actions/localize`,
          'POST',
          { data: localizationData }
        );
        console.log(`   ✅ Localización creada y vinculada (actions/localize)`);
        success = true;
      } catch (e1a) {
        // Método 1b: Endpoint del Content Manager estándar
        try {
          const result = await fetchAPI(
            `/api/content-manager/collection-types/api::article.article/${articleId}/localizations`,
            'POST',
            { data: localizationData }
          );
          console.log(`   ✅ Localización creada y vinculada (Content Manager API)`);
          success = true;
        } catch (e1) {
          // Método 2: Endpoint del plugin i18n
          try {
            const result = await fetchAPI(
              `/api/i18n/localizations`,
              'POST',
              {
                data: {
                  ...localizationData,
                  id: articleId,
                  contentType: 'api::article.article'
                }
              }
            );
            console.log(`   ✅ Localización creada (plugin i18n)`);
            success = true;
          } catch (e2) {
            // Método 3: Endpoint estándar con locale y estructura específica
            try {
              // En Strapi v5, crear localización puede requerir especificar el documento padre
              const result = await fetchAPI(
                `/api/articles/${articleId}/localizations`,
                'POST',
                { data: localizationData }
              );
              console.log(`   ✅ Localización creada (endpoint estándar)`);
              success = true;
            } catch (e3) {
              // Método 4: Crear artículo normal y luego usar PUT para vincular
              console.log(`   ⚠️  Endpoints de localización no disponibles, creando artículo...`);
              const newArticle = await fetchAPI(`/api/articles?locale=${locale}`, 'POST', {
                data: localizationData
              });
              
              const newId = newArticle.data?.id;
              const newDocId = newArticle.data?.documentId;
              
              // Intentar vincular usando PUT en el artículo original
              try {
                // Actualizar el artículo original para incluir esta localización
                await fetchAPI(`/api/articles/${articleId}?locale=es`, 'PUT', {
                  data: {
                    localizations: {
                      connect: [{ id: newId }]
                    }
                  }
                });
                console.log(`   ✅ Artículo creado y vinculado`);
                success = true;
              } catch (linkError) {
                console.log(`   ⚠️  Artículo creado pero NO vinculado automáticamente`);
                console.log(`   📋 ID: ${newId}, DocumentID: ${newDocId}`);
                console.log(`   💡 Necesita vinculación manual en Strapi Admin`);
                success = true;
              }
            }
          }
        }
      }
      
      if (!success) {
        throw new Error('No se pudo crear la localización con ningún método');
      }
      
      await new Promise(r => setTimeout(r, 500));
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message.substring(0, 300)}`);
    }
  }
  
  console.log('\n✅ Proceso completado');
  console.log('\n💡 Verifica en Strapi Admin que todas las localizaciones están vinculadas.');
}

main().catch(console.error);

