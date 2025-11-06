/**
 * Script completo para traducir todos los artículos a todos los idiomas
 * Usa el sistema de internacionalización de Strapi correctamente
 * Vincula categorías y tags en el idioma correspondiente
 */

import 'dotenv/config';
import { create_entry, update_entry } from '@modelcontextprotocol/sdk/types.js';

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'https://scorus-cms-strapi.onrender.com';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.PUBLIC_STRAPI_API_TOKEN || '';

async function fetchStrapi(endpoint, options = {}) {
  const url = `${STRAPI_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(STRAPI_API_TOKEN && { Authorization: `Bearer ${STRAPI_API_TOKEN}` }),
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Mapeo de locales
const LOCALES = ['en', 'fr', 'de', 'hu'];

/**
 * Obtiene la categoría localizada en el idioma objetivo usando el documentId
 */
async function getLocalizedCategory(categoryDocumentId, locale) {
  try {
    const response = await fetchStrapi(
      `/api/categories?locale=${locale}&filters[documentId][$eq]=${categoryDocumentId}`
    );
    const category = response.data?.[0];
    if (category) {
      return category.id; // Retornamos el ID numérico para las relaciones
    }
    return null;
  } catch (error) {
    console.error(`  ⚠️  Error obteniendo categoría en ${locale}:`, error.message);
    return null;
  }
}

/**
 * Obtiene el tag localizado en el idioma objetivo usando el documentId
 */
async function getLocalizedTag(tagDocumentId, locale) {
  try {
    const response = await fetchStrapi(
      `/api/tags?locale=${locale}&filters[documentId][$eq]=${tagDocumentId}`
    );
    const tag = response.data?.[0];
    if (tag) {
      return tag.id; // Retornamos el ID numérico para las relaciones
    }
    return null;
  } catch (error) {
    console.error(`  ⚠️  Error obteniendo tag en ${locale}:`, error.message);
    return null;
  }
}

/**
 * Obtiene el autor localizado (si existe) o usa el mismo
 */
async function getLocalizedAuthor(authorDocumentId, locale) {
  try {
    const response = await fetchStrapi(
      `/api/authors?locale=${locale}&filters[documentId][$eq]=${authorDocumentId}`
    );
    const author = response.data?.[0];
    if (author) {
      return author.id;
    }
    // Si no hay autor localizado, usar el original
    const originalResponse = await fetchStrapi(
      `/api/authors?locale=es&filters[documentId][$eq]=${authorDocumentId}`
    );
    const originalAuthor = originalResponse.data?.[0];
    return originalAuthor?.id || null;
  } catch (error) {
    console.error(`  ⚠️  Error obteniendo autor en ${locale}:`, error.message);
    return null;
  }
}

/**
 * Crea una traducción de un artículo
 */
async function createArticleTranslation(originalArticle, locale, translationData) {
  const { documentId } = originalArticle;
  const attributes = originalArticle.attributes || {};

  // Obtener categorías y tags localizadas
  const categories = attributes.categories?.data || [];
  const tags = attributes.tags?.data || [];
  const author = attributes.author?.data;

  const localizedCategoryIds = [];
  for (const cat of categories) {
    const localizedId = await getLocalizedCategory(cat.documentId, locale);
    if (localizedId) {
      localizedCategoryIds.push(localizedId);
    }
  }

  const localizedTagIds = [];
  for (const tag of tags) {
    const localizedId = await getLocalizedTag(tag.documentId, locale);
    if (localizedId) {
      localizedTagIds.push(localizedId);
    }
  }

  const authorId = author 
    ? await getLocalizedAuthor(author.documentId, locale)
    : null;

  // Preparar datos del artículo traducido
  const articleData = {
    documentId: documentId, // Mismo documentId para vincular localizaciones
    locale: locale,
    title: translationData.title,
    slug: translationData.slug,
    excerpt: translationData.excerpt || '',
    content: translationData.content || '',
    date: attributes.date || attributes.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
    imageAlt: translationData.imageAlt || translationData.title,
    publishedAt: null, // Inicialmente como borrador
  };

  // Crear el artículo usando fetch directo (ya que create_entry tuvo problemas)
  try {
    const createResponse = await fetchStrapi('/api/articles', {
      method: 'POST',
      body: JSON.stringify({
        data: articleData,
      }),
    });

    const createdArticle = createResponse.data;
    if (!createdArticle) {
      throw new Error('No se recibió respuesta del servidor');
    }

    console.log(`    ✅ Artículo creado (ID: ${createdArticle.id})`);

    // Actualizar relaciones en un segundo paso
    if (localizedCategoryIds.length > 0 || localizedTagIds.length > 0 || authorId) {
      const updateData = {};
      
      if (localizedCategoryIds.length > 0) {
        updateData.categories = localizedCategoryIds;
      }
      if (localizedTagIds.length > 0) {
        updateData.tags = localizedTagIds;
      }
      if (authorId) {
        updateData.author = authorId;
      }

      await fetchStrapi(`/api/articles/${createdArticle.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          data: updateData,
        }),
      });

      console.log(`    ✅ Relaciones actualizadas`);
      console.log(`       - Categorías: ${localizedCategoryIds.length}`);
      console.log(`       - Tags: ${localizedTagIds.length}`);
      console.log(`       - Autor: ${authorId ? 'Sí' : 'No'}`);
    }

    return createdArticle;
  } catch (error) {
    // Si el error es por slug duplicado, verificar si ya existe
    if (error.message.includes('slug') && error.message.includes('unique')) {
      console.log(`    ⚠️  Artículo con slug "${translationData.slug}" ya existe, verificando...`);
      const existingResponse = await fetchStrapi(
        `/api/articles?locale=${locale}&filters[slug][$eq]=${translationData.slug}`
      );
      const existing = existingResponse.data?.[0];
      if (existing) {
        console.log(`    ℹ️  Artículo existente encontrado (ID: ${existing.id})`);
        return existing;
      }
    }
    throw error;
  }
}

/**
 * Obtiene todos los artículos en español sin traducciones completas
 */
async function getArticlesToTranslate() {
  const response = await fetchStrapi('/api/articles?locale=es&populate[categories]=*&populate[tags]=*&populate[author]=*');
  const articles = response.data || [];
  
  // Filtrar artículos que no tienen todas las traducciones
  return articles.filter(article => {
    const localizations = article.localizations || [];
    return localizations.length < LOCALES.length;
  });
}

/**
 * Genera traducciones automáticas usando un servicio de traducción simple
 * En producción, deberías usar un servicio profesional como DeepL o Google Translate
 */
function generateTranslation(text, targetLocale) {
  // Esto es un placeholder - deberías usar un servicio de traducción real
  // Por ahora, retornamos el texto original con un prefijo
  return `[${targetLocale.toUpperCase()}] ${text}`;
}

/**
 * Genera slug desde el título
 */
function generateSlug(title, locale) {
  let slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Eliminar guiones múltiples
    .trim();

  // Ajustes específicos por idioma
  if (locale === 'de') {
    // Mantener caracteres alemanes especiales
    slug = title
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  return slug;
}

/**
 * Traduce un artículo a todos los idiomas
 */
async function translateArticle(article) {
  const { documentId, id } = article;
  const attributes = article.attributes || {};
  const title = attributes.title || '';
  
  console.log(`\n📝 Traduciendo artículo: "${title}" (ID: ${id}, documentId: ${documentId})`);

  const localizations = article.localizations || [];
  const existingLocales = localizations.map(loc => loc.locale);

  // Traducir a cada idioma faltante
  for (const locale of LOCALES) {
    if (existingLocales.includes(locale)) {
      console.log(`  ✓ ${locale.toUpperCase()} ya existe, omitiendo...`);
      continue;
    }

    console.log(`  🌍 Creando traducción en ${locale.toUpperCase()}...`);

    try {
      // Por ahora, generamos traducciones básicas
      // En producción, deberías usar traducciones profesionales
      const translationData = {
        title: generateTranslation(title, locale), // PLACEHOLDER - usar traducción real
        slug: generateSlug(title, locale),
        excerpt: generateTranslation(attributes.excerpt || '', locale),
        content: generateTranslation(attributes.content || '', locale),
        imageAlt: generateTranslation(attributes.imageAlt || title, locale),
      };

      await createArticleTranslation(article, locale, translationData);
      
      // Pausa para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`  ❌ Error traduciendo a ${locale.toUpperCase()}:`, error.message);
    }
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando traducción completa de artículos...\n');
  console.log(`📡 Conectando a: ${STRAPI_URL}\n`);

  try {
    // Obtener artículos que necesitan traducción
    const articles = await getArticlesToTranslate();
    
    console.log(`📚 Encontrados ${articles.length} artículos para traducir\n`);

    for (const article of articles) {
      await translateArticle(article);
      
      // Pausa entre artículos
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n✅ Proceso completado');
    console.log('\n⚠️  NOTA: Las traducciones generadas son placeholders.');
    console.log('   Por favor, revisa y completa las traducciones manualmente en Strapi.');
    
  } catch (error) {
    console.error('\n❌ Error fatal:', error);
    process.exit(1);
  }
}

main().catch(console.error);








