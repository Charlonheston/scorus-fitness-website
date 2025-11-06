/**
 * Script para traducir artículos restantes usando MCP tools
 * Obtiene categorías y tags en todos los idiomas y crea traducciones vinculadas
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

// Artículos a traducir con sus documentIds
const ARTICLES_TO_TRANSLATE = [
  'qq4md3y8gdnyvs9xhmt8f2o7', // Artículo 16: Un nuevo año lleno de pensamientos
  'nmlj8cnnn57qqcbiq0t1gs7d', // Artículo 13: Las mejores máquinas del gimnasio
  'z340mvpj045uo0are78chsx2', // Artículo 29: Receta para hacer una pizza fit
];

const LOCALES = ['en', 'fr', 'de', 'hu'];

/**
 * Obtiene el ID de una categoría localizada
 */
async function getLocalizedCategoryId(categoryDocumentId, locale) {
  try {
    const response = await fetchStrapi(
      `/api/categories?locale=${locale}&filters[documentId][$eq]=${categoryDocumentId}`
    );
    return response.data?.[0]?.id || null;
  } catch (error) {
    console.error(`  ⚠️  Error obteniendo categoría en ${locale}:`, error.message);
    return null;
  }
}

/**
 * Obtiene el ID de un tag localizado
 */
async function getLocalizedTagId(tagDocumentId, locale) {
  try {
    const response = await fetchStrapi(
      `/api/tags?locale=${locale}&filters[documentId][$eq]=${tagDocumentId}`
    );
    return response.data?.[0]?.id || null;
  } catch (error) {
    console.error(`  ⚠️  Error obteniendo tag en ${locale}:`, error.message);
    return null;
  }
}

/**
 * Traduce un artículo a un idioma específico
 */
async function translateArticleToLocale(article, locale) {
  const { documentId } = article;
  const attributes = article.attributes || {};

  // Obtener categorías y tags localizadas
  const categories = attributes.categories?.data || [];
  const tags = attributes.tags?.data || [];
  const author = attributes.author?.data;

  const localizedCategoryIds = [];
  for (const cat of categories) {
    const id = await getLocalizedCategoryId(cat.documentId, locale);
    if (id) localizedCategoryIds.push(id);
  }

  const localizedTagIds = [];
  for (const tag of tags) {
    const id = await getLocalizedTagId(tag.documentId, locale);
    if (id) localizedTagIds.push(id);
  }

  // Generar traducciones básicas (el usuario deberá completarlas)
  const title = attributes.title || '';
  const slug = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();

  const articleData = {
    documentId: documentId,
    locale: locale,
    title: `[${locale.toUpperCase()}] ${title}`, // Placeholder - necesita traducción real
    slug: `${locale}-${slug}`,
    excerpt: attributes.excerpt || '',
    content: attributes.content || '',
    date: attributes.date || attributes.createdAt?.split('T')[0],
    imageAlt: attributes.imageAlt || title,
    publishedAt: null,
  };

  if (localizedCategoryIds.length > 0) {
    articleData.categories = localizedCategoryIds;
  }
  if (localizedTagIds.length > 0) {
    articleData.tags = localizedTagIds;
  }
  if (author?.id) {
    articleData.author = author.id;
  }

  try {
    console.log(`    🔨 Creando artículo en ${locale.toUpperCase()}...`);
    const response = await fetchStrapi('/api/articles', {
      method: 'POST',
      body: JSON.stringify({ data: articleData }),
    });

    const created = response.data;
    console.log(`    ✅ Artículo creado (ID: ${created.id})`);
    console.log(`       - Categorías: ${localizedCategoryIds.length}`);
    console.log(`       - Tags: ${localizedTagIds.length}`);

    return created;
  } catch (error) {
    if (error.message.includes('slug') && error.message.includes('unique')) {
      console.log(`    ⚠️  Slug duplicado, verificando artículo existente...`);
      const existing = await fetchStrapi(
        `/api/articles?locale=${locale}&filters[slug][$eq]=${articleData.slug}`
      );
      if (existing.data?.[0]) {
        console.log(`    ℹ️  Artículo existente (ID: ${existing.data[0].id})`);
        return existing.data[0];
      }
    }
    throw error;
  }
}

/**
 * Procesa un artículo y crea todas sus traducciones
 */
async function processArticle(documentId) {
  console.log(`\n📝 Procesando artículo: ${documentId}`);

  // Obtener artículo original
  const response = await fetchStrapi(
    `/api/articles?filters[documentId][$eq]=${documentId}&populate[categories]=*&populate[tags]=*&populate[author]=*&locale=es`
  );

  const article = response.data?.[0];
  if (!article) {
    console.error(`❌ Artículo no encontrado`);
    return;
  }

  console.log(`   Título: "${article.attributes.title}"`);
  console.log(`   Categorías: ${article.attributes.categories?.data?.length || 0}`);
  console.log(`   Tags: ${article.attributes.tags?.data?.length || 0}`);

  const existingLocales = (article.localizations || []).map(loc => loc.locale);

  for (const locale of LOCALES) {
    if (existingLocales.includes(locale)) {
      console.log(`  ✓ ${locale.toUpperCase()} ya existe`);
      continue;
    }

    console.log(`  🌍 Traduciendo a ${locale.toUpperCase()}...`);
    try {
      await translateArticleToLocale(article, locale);
      await new Promise(resolve => setTimeout(resolve, 1500));
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Iniciando traducción de artículos restantes...\n');
  console.log(`📡 Conectando a: ${STRAPI_URL}\n`);

  for (const documentId of ARTICLES_TO_TRANSLATE) {
    await processArticle(documentId);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n✅ Proceso completado');
  console.log('\n⚠️  NOTA: Las traducciones creadas son placeholders.');
  console.log('   Por favor, actualiza los títulos y contenidos con traducciones reales en Strapi.');
}

main().catch(console.error);








