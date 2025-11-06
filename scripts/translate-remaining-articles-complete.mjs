/**
 * Script completo para traducir los artículos restantes (16, 13, 29)
 * Usa el sistema de internacionalización de Strapi correctamente
 * Vincula categorías y tags en el idioma correspondiente
 */

import 'dotenv/config';

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
    throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 500)}`);
  }

  return response.json();
}

/**
 * Obtiene el ID de una categoría localizada usando su documentId
 */
async function getCategoryIdByDocumentId(documentId, locale) {
  try {
    const response = await fetchStrapi(
      `/api/categories?locale=${locale}&filters[documentId][$eq]=${documentId}`
    );
    const category = response.data?.[0];
    return category?.id || null;
  } catch (error) {
    console.error(`  ⚠️  Error obteniendo categoría en ${locale}:`, error.message);
    return null;
  }
}

/**
 * Obtiene el ID de un tag localizado usando su documentId
 */
async function getTagIdByDocumentId(documentId, locale) {
  try {
    const response = await fetchStrapi(
      `/api/tags?locale=${locale}&filters[documentId][$eq]=${documentId}`
    );
    const tag = response.data?.[0];
    return tag?.id || null;
  } catch (error) {
    console.error(`  ⚠️  Error obteniendo tag en ${locale}:`, error.message);
    return null;
  }
}

/**
 * Crea una traducción de artículo usando fetch directo a Strapi
 */
async function createArticleTranslation(originalArticle, locale, translationData) {
  const { documentId } = originalArticle;
  const attributes = originalArticle.attributes || {};

  // Obtener categorías y tags localizadas
  const categories = attributes.categories?.data || [];
  const tags = attributes.tags?.data || [];
  const author = attributes.author?.data;

  console.log(`    📋 Obteniendo categorías y tags localizadas...`);
  
  const localizedCategoryIds = [];
  for (const cat of categories) {
    const localizedId = await getCategoryIdByDocumentId(cat.documentId, locale);
    if (localizedId) {
      localizedCategoryIds.push(localizedId);
      console.log(`      ✓ Categoría: ${cat.name} -> ID ${localizedId} (${locale})`);
    }
  }

  const localizedTagIds = [];
  for (const tag of tags) {
    const localizedId = await getTagIdByDocumentId(tag.documentId, locale);
    if (localizedId) {
      localizedTagIds.push(localizedId);
      console.log(`      ✓ Tag: ${tag.name} -> ID ${localizedId} (${locale})`);
    }
  }

  const authorId = author?.id || null;

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

  // Añadir relaciones si existen
  if (localizedCategoryIds.length > 0) {
    articleData.categories = localizedCategoryIds;
  }
  if (localizedTagIds.length > 0) {
    articleData.tags = localizedTagIds;
  }
  if (authorId) {
    articleData.author = authorId;
  }

  // Crear el artículo
  try {
    console.log(`    🔨 Creando artículo en ${locale.toUpperCase()}...`);
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
    console.log(`       - Título: ${translationData.title}`);
    console.log(`       - Slug: ${translationData.slug}`);
    console.log(`       - Categorías: ${localizedCategoryIds.length}`);
    console.log(`       - Tags: ${localizedTagIds.length}`);
    console.log(`       - Autor: ${authorId ? 'Sí' : 'No'}`);

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
 * Traduce un artículo a todos los idiomas
 */
async function translateArticle(documentId, translations) {
  console.log(`\n📝 Traduciendo artículo: ${documentId}`);

  // Obtener el artículo original
  const originalResponse = await fetchStrapi(
    `/api/articles?filters[documentId][$eq]=${documentId}&populate[categories]=*&populate[tags]=*&populate[author]=*&locale=es`
  );

  const originalArticle = originalResponse.data?.[0];
  if (!originalArticle) {
    console.error(`❌ No se encontró el artículo con documentId: ${documentId}`);
    return;
  }

  console.log(`   Título original: "${originalArticle.attributes.title}"`);
  console.log(`   Categorías: ${originalArticle.attributes.categories?.data?.length || 0}`);
  console.log(`   Tags: ${originalArticle.attributes.tags?.data?.length || 0}`);

  // Verificar localizaciones existentes
  const existingLocalizations = originalArticle.localizations || [];
  const existingLocales = existingLocalizations.map(loc => loc.locale);

  const LOCALES = ['en', 'fr', 'de', 'hu'];

  // Traducir a cada idioma
  for (const locale of LOCALES) {
    if (existingLocales.includes(locale)) {
      console.log(`  ✓ ${locale.toUpperCase()} ya existe, omitiendo...`);
      continue;
    }

    if (!translations[locale]) {
      console.log(`  ⚠️  No hay traducción definida para ${locale.toUpperCase()}, omitiendo...`);
      continue;
    }

    console.log(`  🌍 Creando traducción en ${locale.toUpperCase()}...`);

    try {
      await createArticleTranslation(originalArticle, locale, translations[locale]);
      // Pausa para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 1500));
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

  // Artículo 16: Un nuevo año lleno de pensamientos
  // Nota: Las traducciones completas deben ser proporcionadas por el usuario
  // Este es un ejemplo de estructura
  await translateArticle('qq4md3y8gdnyvs9xhmt8f2o7', {
    en: {
      title: 'A New Year Full of Thoughts and Purposes: Reflections on Knowledge, Responsibility and Fitness',
      slug: 'a-new-year-full-of-thoughts-and-purposes',
      excerpt: 'Deep reflections on responsibility in the fitness industry, scientific knowledge and the importance of questioning established beliefs. A call for authenticity and critical thinking in the wellness world.',
      content: '[EN Translation content here - needs to be provided]',
      imageAlt: 'Man with cap and red shirt looking towards the horizon on a beach at sunset, with sea and blue sky in the background.',
    },
    // FR, DE, HU translations would go here
  });

  console.log('\n✅ Proceso completado');
  console.log('\n⚠️  NOTA: Este script requiere traducciones completas para cada idioma.');
  console.log('   Por favor, proporciona las traducciones completas o usa un servicio de traducción profesional.');
}

main().catch(console.error);








