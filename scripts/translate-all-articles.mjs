import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN || '';

const LOCALES = ['es', 'en', 'fr', 'de', 'hu'];
const SOURCE_LOCALE = 'es';

// Función para hacer requests a Strapi
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
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

// Función para traducir texto (simplificada - en producción usarías una API de traducción)
async function translateText(text, targetLocale) {
  // Por ahora retornamos el texto con un prefijo indicando que necesita traducción
  // En producción deberías usar una API de traducción real
  return `[${targetLocale.toUpperCase()}] ${text}`;
}

// Función para obtener categoría/tag traducida
async function getLocalizedRelation(relation, targetLocale, type) {
  if (!relation) return null;
  
  const relationId = relation.documentId || relation.id;
  
  // Obtener todas las localizaciones de esta relación
  const allLocalizations = await fetchAPI(`/api/${type}s/${relationId}?locale=all`);
  
  // Buscar la localización en el idioma objetivo
  const localized = allLocalizations.data?.localizations?.find(
    loc => loc.locale === targetLocale
  ) || allLocalizations.data;
  
  return localized?.id || relationId;
}

// Función principal para traducir un artículo
async function translateArticle(article, targetLocale) {
  const articleId = article.documentId || article.id;
  const title = article.attributes?.title || article.title;
  const slug = article.attributes?.slug || article.slug;
  const excerpt = article.attributes?.excerpt || article.excerpt;
  const content = article.attributes?.content || article.content;
  const date = article.attributes?.date || article.date;
  
  console.log(`\n📝 Traduciendo: "${title}" → ${targetLocale.toUpperCase()}`);
  
  // Verificar si ya existe la traducción
  const existingTranslations = article.attributes?.localizations?.data || [];
  const existingTranslation = existingTranslations.find(
    loc => loc.attributes?.locale === targetLocale || loc.locale === targetLocale
  );
  
  if (existingTranslation) {
    console.log(`   ⏭️  Ya existe traducción en ${targetLocale.toUpperCase()}`);
    return existingTranslation;
  }
  
  // Traducir campos
  const translatedTitle = await translateText(title, targetLocale);
  const translatedSlug = `${slug}-${targetLocale}`;
  const translatedExcerpt = await translateText(excerpt, targetLocale);
  const translatedContent = await translateText(content, targetLocale);
  
  // Obtener categorías y tags localizadas
  const categories = article.attributes?.categories?.data || [];
  const tags = article.attributes?.tags?.data || [];
  
  const localizedCategories = [];
  const localizedTags = [];
  
  for (const category of categories) {
    const localizedId = await getLocalizedRelation(category, targetLocale, 'category');
    if (localizedId) localizedCategories.push(localizedId);
  }
  
  for (const tag of tags) {
    const localizedId = await getLocalizedRelation(tag, targetLocale, 'tag');
    if (localizedId) localizedTags.push(localizedId);
  }
  
  // Crear la localización
  try {
    const result = await fetchAPI(`/api/articles/${articleId}/localizations`, 'POST', {
      data: {
        locale: targetLocale,
        title: translatedTitle,
        slug: translatedSlug,
        excerpt: translatedExcerpt,
        content: translatedContent,
        date: date,
        categories: localizedCategories,
        tags: localizedTags,
        author: article.attributes?.author?.data?.documentId || article.attributes?.author?.data?.id
      }
    });
    
    console.log(`   ✅ Traducción creada`);
    return result.data;
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando traducción de artículos...\n');
  
  // Obtener todos los artículos en español
  console.log('📋 Obteniendo artículos en español...');
  const articlesRes = await fetchAPI(`/api/articles?locale=${SOURCE_LOCALE}&pagination[pageSize]=100&populate[tags]=*&populate[categories]=*&populate[author]=*`);
  const articles = articlesRes.data || [];
  
  console.log(`✅ Encontrados ${articles.length} artículos en español\n`);
  
  if (articles.length === 0) {
    console.log('❌ No se encontraron artículos para traducir');
    return;
  }
  
  // Traducir cada artículo a todos los idiomas
  for (const article of articles) {
    const title = article.attributes?.title || article.title;
    console.log(`\n📰 Artículo: ${title}`);
    
    for (const locale of LOCALES) {
      if (locale === SOURCE_LOCALE) continue;
      
      try {
        await translateArticle(article, locale);
        // Pequeña pausa para no saturar la API
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`   ❌ Error traduciendo a ${locale}: ${error.message}`);
      }
    }
  }
  
  console.log('\n✅ Proceso de traducción completado');
}

main().catch(console.error);
