import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN || '';

const LOCALES = ['es', 'en', 'fr', 'de', 'hu'];
const SOURCE_LOCALE = 'es';

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
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 300)}`);
  }
  return res.json();
}

// Función para obtener todas las localizaciones de una relación (categoría/tag)
async function getLocalizedRelation(relation, targetLocale, type) {
  if (!relation) return null;
  
  const relationId = relation.documentId || relation.id;
  const documentId = relation.documentId;
  
  try {
    // Si no hay documentId, usar el ID directamente
    if (!documentId) {
      return relationId;
    }
    
    // Buscar localización por documentId en el idioma objetivo
    const localizations = await fetchAPI(`/api/${type}s?filters[documentId][$eq]=${documentId}&locale=${targetLocale}`);
    const localized = localizations.data?.find(item => {
      const loc = item.attributes?.locale || item.locale;
      return loc === targetLocale;
    });
    
    if (localized) {
      return localized.id;
    }
    
    // Si no se encuentra, retornar el ID original
    return relationId;
  } catch (error) {
    // Si falla, retornar el ID original
    console.warn(`   ⚠️  No se pudo obtener localización de ${type} ${relationId}: ${error.message.substring(0, 100)}`);
    return relationId;
  }
}

// Función para traducir texto usando traducciones básicas o API
async function translateText(text, targetLocale) {
  // Por ahora usamos un placeholder, pero en producción deberías usar una API real
  // Por ejemplo: DeepL, Google Translate, etc.
  
  // Si el texto ya está traducido (tiene prefijo), quitarlo
  const cleanText = text.replace(/^\[[A-Z]{2}\]\s*/, '');
  
  // Retornar el texto con un marcador indicando que necesita traducción real
  // En producción, aquí harías la llamada a la API de traducción
  return `[NEEDS_TRANSLATION:${targetLocale}] ${cleanText}`;
}

// Función para crear traducción de artículo
async function createArticleTranslation(article, targetLocale) {
  const articleId = article.documentId || article.id;
  const documentId = article.documentId;
  
  if (!documentId) {
    console.error('   ❌ Artículo sin documentId');
    return null;
  }
  
  const attrs = article.attributes || article;
  const title = attrs.title || '';
  const slug = attrs.slug || '';
  const excerpt = attrs.excerpt || '';
  const content = attrs.content || '';
  const date = attrs.date || new Date().toISOString().split('T')[0];
  
  console.log(`   📝 Traduciendo a ${targetLocale.toUpperCase()}...`);
  
  // Verificar si ya existe
  try {
    const existing = await fetchAPI(`/api/articles?filters[documentId][$eq]=${documentId}&locale=${targetLocale}`);
    if (existing.data && existing.data.length > 0) {
      console.log(`   ⏭️  Ya existe traducción en ${targetLocale.toUpperCase()}`);
      return existing.data[0];
    }
  } catch (e) {
    // Continuar si no existe
  }
  
  // Traducir campos
  const translatedTitle = await translateText(title, targetLocale);
  const translatedSlug = `${slug}-${targetLocale}`;
  const translatedExcerpt = await translateText(excerpt, targetLocale);
  const translatedContent = await translateText(content, targetLocale);
  
  // Obtener ID del autor del artículo original (sin poblar relaciones para evitar errores)
  // El autor generalmente no se localiza, así que usamos el mismo ID
  let authorId = null;
  const authorRelation = attrs.author?.data;
  if (authorRelation) {
    authorId = authorRelation.documentId || authorRelation.id;
  }
  
  console.log(`   ⚠️  Nota: Las categorías y tags se deben actualizar manualmente después`);
  
  // Crear localización usando el endpoint correcto de Strapi v5
  try {
    // En Strapi v5, para crear una localización debemos usar el mismo documentId
    // del artículo original. Esto vincula automáticamente las localizaciones.
    const createData = {
      data: {
        locale: targetLocale,
        title: translatedTitle,
        slug: translatedSlug,
        excerpt: translatedExcerpt,
        content: translatedContent,
        date: date,
        publishedAt: null // Dejar como borrador
      }
    };
    
    // Solo incluir autor si existe (las relaciones many-to-many las actualizamos después)
    if (authorId) {
      createData.data.author = authorId;
    }
    
    // En Strapi v5, para crear una localización vinculada al documento original,
    // debemos usar el endpoint de localizaciones del artículo original
    // Intentar primero con el endpoint de localizaciones
    let result;
    try {
      result = await fetchAPI(`/api/articles/${articleId}/localizations`, 'POST', createData);
    } catch (localizationError) {
      // Si el endpoint de localizaciones no funciona, crear como artículo nuevo
      // y luego Strapi puede vincularlas manualmente o usar documentId
      console.log(`   ℹ️  Intentando método alternativo...`);
      result = await fetchAPI(`/api/articles?locale=${targetLocale}`, 'POST', createData);
      
      // Nota: En Strapi v5, si creamos un artículo nuevo con locale diferente,
      // no se vincula automáticamente. Necesitaríamos usar el Admin Panel o
      // una actualización posterior para vincularlos como localizaciones.
      // Por ahora, se crean como artículos independientes que luego deben
      // vincularse manualmente en Strapi Admin.
    }
    
    console.log(`   ✅ Traducción creada (sin categorías/tags - actualizar manualmente)`);
    return result.data;
  } catch (error) {
    console.error(`   ❌ Error creando traducción: ${error.message}`);
    return null;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando traducción completa de artículos...\n');
  
  // Obtener todos los artículos en español
  console.log('📋 Obteniendo artículos en español...');
  let allArticles = [];
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const res = await fetchAPI(`/api/articles?locale=${SOURCE_LOCALE}&pagination[page]=${page}&pagination[pageSize]=50`);
      const articles = res.data || [];
      allArticles.push(...articles);
      
      hasMore = res.meta?.pagination && page < res.meta.pagination.pageCount;
      page++;
    } catch (error) {
      console.error(`Error obteniendo página ${page}:`, error.message);
      hasMore = false;
    }
  }
  
  console.log(`✅ Encontrados ${allArticles.length} artículos en español\n`);
  
  if (allArticles.length === 0) {
    console.log('❌ No se encontraron artículos para traducir');
    return;
  }
  
  // Traducir cada artículo
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < allArticles.length; i++) {
    const article = allArticles[i];
    const title = article.attributes?.title || article.title || 'Sin título';
    
    console.log(`\n[${i + 1}/${allArticles.length}] 📰 ${title}`);
    
    for (const locale of LOCALES) {
      if (locale === SOURCE_LOCALE) continue;
      
      try {
        const result = await createArticleTranslation(article, locale);
        if (result) {
          successCount++;
        } else {
          skippedCount++;
        }
        // Pausa para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`   ❌ Error en ${locale}: ${error.message}`);
        errorCount++;
      }
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('📊 RESUMEN');
  console.log('═══════════════════════════════════════');
  console.log(`   ✅ Traducciones creadas: ${successCount}`);
  console.log(`   ⏭️  Traducciones omitidas: ${skippedCount}`);
  console.log(`   ❌ Errores: ${errorCount}`);
  console.log(`   📝 Total artículos procesados: ${allArticles.length}`);
  console.log('');
  console.log('⚠️  NOTA: Los textos tienen marcadores [NEEDS_TRANSLATION:xx]');
  console.log('   Debes reemplazarlos con traducciones reales usando una API de traducción.');
}

main().catch(console.error);
