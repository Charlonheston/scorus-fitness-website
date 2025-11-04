/**
 * Script para asignar tags coherentes a los artículos basándose en su contenido
 * 
 * Uso:
 *   node scripts/assign-tags-to-articles.mjs
 * 
 * Requiere:
 *   - PUBLIC_STRAPI_URL en .env.local
 *   - STRAPI_API_TOKEN en .env.local
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Cargar variables de entorno
config({ path: join(rootDir, '.env.local') });
config({ path: join(rootDir, '.env') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.PUBLIC_STRAPI_API_TOKEN || '';

if (!STRAPI_URL) {
  console.error('❌ Error: PUBLIC_STRAPI_URL no está configurada');
  process.exit(1);
}

if (!STRAPI_API_TOKEN) {
  console.warn('⚠️  Advertencia: STRAPI_API_TOKEN no está configurada. Algunos artículos pueden requerir autenticación.');
}

console.log('🔧 Configuración Strapi:');
console.log(`   URL: ${STRAPI_URL}`);
console.log(`   Token: ${STRAPI_API_TOKEN ? '✅ Configurado' : '❌ No configurado'}`);
console.log('');

/**
 * Función para hacer requests a la API de Strapi
 */
async function fetchStrapi(endpoint, options = {}) {
  const url = `${STRAPI_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (STRAPI_API_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text.substring(0, 200)}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error en ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Obtener todas las tags disponibles
 */
async function getAllTags() {
  console.log('📋 Obteniendo tags disponibles...');
  
  const tags = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await fetchStrapi(
        `/api/tags?pagination[page]=${page}&pagination[pageSize]=100&populate=*`
      );

      if (response.data && Array.isArray(response.data)) {
        tags.push(...response.data);
        hasMore = response.meta?.pagination && response.meta.pagination.page < response.meta.pagination.pageCount;
        page++;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error('❌ Error obteniendo tags:', error.message);
      hasMore = false;
    }
  }

  console.log(`   ✅ Encontradas ${tags.length} tags`);
  return tags;
}

/**
 * Obtener todos los artículos
 */
async function getAllArticles() {
  console.log('📰 Obteniendo artículos...');
  
  const articles = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await fetchStrapi(
        `/api/articles?pagination[page]=${page}&pagination[pageSize]=100&populate[tags]=*&populate[categories]=*`
      );

      if (response.data && Array.isArray(response.data)) {
        articles.push(...response.data);
        hasMore = response.meta?.pagination && response.meta.pagination.page < response.meta.pagination.pageCount;
        page++;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error('❌ Error obteniendo artículos:', error.message);
      hasMore = false;
    }
  }

  console.log(`   ✅ Encontrados ${articles.length} artículos`);
  return articles;
}

/**
 * Extraer texto del contenido (puede ser HTML, Blocks, o string)
 */
function extractTextFromContent(content) {
  if (!content) return '';
  
  if (typeof content === 'string') {
    // Remover HTML tags
    return content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
  
  if (Array.isArray(content)) {
    // Blocks array
    return content
      .map(block => {
        if (block.text) return block.text;
        if (block.children) {
          return block.children.map(c => c.text || '').join(' ');
        }
        return '';
      })
      .join(' ');
  }
  
  return '';
}

/**
 * Analizar contenido y encontrar tags relevantes
 */
function findRelevantTags(article, allTags) {
  // Combinar texto del artículo (soporte para diferentes formatos)
  const title = article.title || article.attributes?.title || article.data?.attributes?.title || '';
  const excerpt = article.excerpt || article.attributes?.excerpt || article.data?.attributes?.excerpt || '';
  const content = extractTextFromContent(
    article.content || article.attributes?.content || article.data?.attributes?.content
  );
  const fullText = `${title} ${excerpt} ${content}`.toLowerCase();

  // Tags ya asignadas (soporte para diferentes formatos)
  const existingTags = article.tags?.data || article.attributes?.tags?.data || article.data?.attributes?.tags?.data || [];
  const existingTagIds = existingTags.map(t => t.id || t.data?.id).filter(id => id);
  const existingTagNames = existingTags
    .map(t => t.name || t.attributes?.name || t.data?.attributes?.name || '')
    .map(n => n.toLowerCase());

  // Encontrar tags relevantes
  const relevantTags = [];

  for (const tag of allTags) {
    // Obtener ID y nombre de tag (soporte para diferentes formatos de Strapi v5)
    const tagId = tag.id || tag.data?.id;
    const tagName = tag.name || tag.attributes?.name || tag.data?.attributes?.name || '';
    const tagSlug = tag.slug || tag.attributes?.slug || tag.data?.attributes?.slug || '';
    const tagNameLower = tagName.toLowerCase();
    const tagSlugLower = tagSlug.toLowerCase();

    // Evitar duplicados
    if (existingTagIds.includes(tagId)) {
      continue;
    }

    // Verificar si el nombre de la tag aparece en el contenido
    const tagWords = tagNameLower.split(/\s+/).filter(w => w.length > 3);
    let matches = 0;

    for (const word of tagWords) {
      if (fullText.includes(word)) {
        matches++;
      }
    }

    // Si al menos una palabra clave de la tag aparece, considerar relevante
    if (matches > 0) {
      relevantTags.push({
        tag,
        tagId,
        score: matches,
        reason: `Aparece en el contenido (${matches} palabras clave)`,
      });
    }
  }

  // Ordenar por relevancia y tomar las top 3-5
  return relevantTags
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.tagId);
}

/**
 * Actualizar artículo con nuevas tags
 */
async function updateArticleTags(articleId, newTagIds) {
  try {
    // Obtener el artículo actual con todas sus relaciones
    const currentArticle = await fetchStrapi(`/api/articles/${articleId}?populate[tags]=*&populate[categories]=*&populate[author]=*`);
    
    if (!currentArticle.data) {
      throw new Error('Artículo no encontrado');
    }

    // Construir el objeto de datos para actualizar
    // En Strapi v5, para relaciones many-to-many usamos el formato correcto
    const articleData = currentArticle.data.attributes || currentArticle.data;
    
    // Crear el objeto de actualización manteniendo todos los campos excepto tags
    const updateData = {
      title: articleData.title,
      slug: articleData.slug,
      excerpt: articleData.excerpt,
      content: articleData.content,
      date: articleData.date,
      publishedAt: articleData.publishedAt,
      // Para relaciones many-to-many en Strapi v5, podemos usar directamente el array de IDs
      tags: newTagIds,
    };

    // Mostrar lo que vamos a enviar (para debug)
    console.log(`   📤 Enviando actualización:`, JSON.stringify({
      tags: newTagIds,
      totalTags: newTagIds.length
    }, null, 2));

    // Actualizar con el formato correcto de Strapi v5
    const response = await fetchStrapi(`/api/articles/${articleId}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: updateData,
      }),
    });
    
    // Verificar respuesta
    if (response.data) {
      return true;
    }
    return false;
  } catch (error) {
    console.error(`   ❌ Error actualizando artículo ${articleId}:`, error.message);
    // Mostrar más detalles del error si está disponible
    if (error.response) {
      console.error(`   Detalles:`, JSON.stringify(error.response, null, 2));
    }
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando asignación de tags...\n');

  // 1. Obtener tags
  const allTags = await getAllTags();
  if (allTags.length === 0) {
    console.error('❌ No se encontraron tags. Asegúrate de que haya tags en Strapi.');
    process.exit(1);
  }

  console.log('\n📌 Tags disponibles:');
  allTags.forEach(tag => {
    // Strapi v5 puede tener los atributos directamente o en attributes
    const name = tag.name || tag.attributes?.name || tag.data?.attributes?.name || 'Sin nombre';
    console.log(`   - ${name} (ID: ${tag.id || tag.data?.id || 'N/A'})`);
  });

  // 2. Obtener artículos
  const articles = await getAllArticles();
  if (articles.length === 0) {
    console.error('❌ No se encontraron artículos.');
    process.exit(1);
  }

  console.log('\n📝 Procesando artículos...\n');

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const article of articles) {
    // Soporte para diferentes formatos de Strapi v5
    const articleId = article.id || article.data?.id;
    const title = article.title || article.attributes?.title || article.data?.attributes?.title || 'Sin título';
    const existingTags = article.tags?.data || article.attributes?.tags?.data || article.data?.attributes?.tags?.data || [];
    const existingTagIds = existingTags.map(t => t.id || t.data?.id).filter(id => id);

    console.log(`📰 ${title}`);
    console.log(`   Tags actuales: ${existingTags.length}`);

    // Encontrar tags relevantes
    const relevantTags = findRelevantTags(article, allTags);

    if (relevantTags.length === 0) {
      console.log(`   ⏭️  No se encontraron tags relevantes`);
      skipped++;
      console.log('');
      continue;
    }

    // Combinar tags existentes con nuevas (relevantTags ya son IDs)
    const newTagIds = [...new Set([...existingTagIds, ...relevantTags])];
    const newTagsCount = newTagIds.length - existingTagIds.length;

    // Obtener nombres de tags para mostrar
    const suggestedTagNames = relevantTags.map(tagId => {
      const tag = allTags.find(t => (t.id || t.data?.id) === tagId);
      return tag ? (tag.name || tag.attributes?.name || tag.data?.attributes?.name || 'Sin nombre') : 'Desconocida';
    });

    console.log(`   ✅ Tags sugeridas: ${suggestedTagNames.join(', ')}`);
    console.log(`   📊 Total tags: ${existingTagIds.length} → ${newTagIds.length} (+${newTagsCount})`);

    // Actualizar artículo
    const success = await updateArticleTags(articleId, newTagIds);

    if (success) {
      console.log(`   ✅ Actualizado correctamente`);
      updated++;
    } else {
      console.log(`   ❌ Error al actualizar`);
      errors++;
    }

    console.log('');
  }

  // Resumen
  console.log('═══════════════════════════════════════');
  console.log('📊 RESUMEN');
  console.log('═══════════════════════════════════════');
  console.log(`   ✅ Artículos actualizados: ${updated}`);
  console.log(`   ⏭️  Artículos sin cambios: ${skipped}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📝 Total procesados: ${articles.length}`);
  console.log('');
}

// Ejecutar
main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

