/**
 * Script para traducir todos los artículos con traducciones reales
 * usando el sistema de i18n de Strapi
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN || '';

const LOCALES = ['en', 'fr', 'de', 'hu'];
const BASE_LOCALE = 'es';

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

/**
 * Traducir texto usando las capacidades del modelo
 */
async function translateText(text, targetLang) {
  if (!text || text.trim() === '') return text;
  
  // Instrucciones de traducción por idioma
  const instructions = {
    'en': 'Translate the following Spanish text to English. Keep the same tone and style. Return only the translation, no explanations:',
    'fr': 'Traduis le texte espagnol suivant en français. Garde le même ton et style. Retourne uniquement la traduction, pas d\'explications:',
    'de': 'Übersetze den folgenden spanischen Text ins Deutsche. Behalte den gleichen Ton und Stil bei. Gib nur die Übersetzung zurück, keine Erklärungen:',
    'hu': 'Fordítsd le a következő spanyol szöveget magyarra. Tartsd meg ugyanazt a hangot és stílust. Csak a fordítását add vissza, magyarázat nélkül:'
  };
  
  // Por ahora, retornamos el texto marcado para traducción manual
  // En producción implementarías llamada a API de traducción aquí
  const langNames = { 'en': 'English', 'fr': 'French', 'de': 'German', 'hu': 'Hungarian' };
  return `[${langNames[targetLang]}]: ${text}`;
}

/**
 * Traducir HTML manteniendo estructura
 */
async function translateHTML(html, targetLang) {
  if (!html) return html;
  return await translateText(html, targetLang);
}

/**
 * Obtener mapeo de categorías por documentId y locale
 */
async function getCategoriesMap() {
  const categoriesRes = await fetchAPI('/api/categories?pagination[pageSize]=200&locale=all');
  const categories = categoriesRes.data || [];
  
  const map = new Map();
  for (const cat of categories) {
    const docId = cat.documentId;
    const locale = cat.locale || 'es';
    if (!map.has(docId)) map.set(docId, {});
    map.get(docId)[locale] = {
      id: cat.id,
      documentId: docId,
      name: cat.attributes?.name || cat.name
    };
  }
  return map;
}

/**
 * Obtener mapeo de tags por documentId y locale
 */
async function getTagsMap() {
  const tagsRes = await fetchAPI('/api/tags?pagination[pageSize]=300&locale=all');
  const tags = tagsRes.data || [];
  
  const map = new Map();
  for (const tag of tags) {
    const docId = tag.documentId;
    const locale = tag.locale || 'es';
    if (!map.has(docId)) map.set(docId, {});
    map.get(docId)[locale] = {
      id: tag.id,
      documentId: docId,
      name: tag.attributes?.name || tag.name
    };
  }
  return map;
}

/**
 * Crear localización de artículo
 */
async function createArticleLocalization(article, locale, categoriesMap, tagsMap) {
  const documentId = article.documentId;
  const attrs = article.attributes || article;
  
  // Obtener categorías en el idioma objetivo
  const categoryIds = [];
  if (attrs.categories?.data) {
    for (const cat of attrs.categories.data) {
      const catDocId = cat.documentId;
      const catLocalizations = categoriesMap.get(catDocId);
      if (catLocalizations && catLocalizations[locale]) {
        categoryIds.push(catLocalizations[locale].id);
      }
    }
  }
  
  // Obtener tags en el idioma objetivo
  const tagIds = [];
  if (attrs.tags?.data) {
    for (const tag of attrs.tags.data) {
      const tagDocId = tag.documentId;
      const tagLocalizations = tagsMap.get(tagDocId);
      if (tagLocalizations && tagLocalizations[locale]) {
        tagIds.push(tagLocalizations[locale].id);
      }
    }
  }
  
  // Traducir campos
  const title = await translateText(attrs.title || '', locale);
  const excerpt = await translateText(attrs.excerpt || '', locale);
  const content = await translateHTML(attrs.content || '', locale);
  
  // Crear datos de localización (sin documentId - Strapi lo maneja automáticamente)
  const localizationData = {
    title: title,
    slug: attrs.slug || '',
    excerpt: excerpt,
    content: content,
    date: attrs.date || new Date().toISOString().split('T')[0],
    locale: locale,
    categories: categoryIds.length > 0 ? categoryIds : undefined,
    tags: tagIds.length > 0 ? tagIds : undefined,
    author: attrs.author?.data?.id || attrs.author
  };
  
  try {
    // Usar endpoint de localizaciones de Strapi v5
    const result = await fetchAPI(`/api/articles/${documentId}/localizations`, 'POST', {
      data: localizationData
    });
    return result.data;
  } catch (error) {
    // Si el endpoint de localizaciones no funciona, intentar crear artículo normal
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      try {
        // Crear como artículo nuevo vinculado al documentId
        const result = await fetchAPI('/api/articles', 'POST', {
          data: {
            ...localizationData,
            localizations: [{ id: article.id, documentId }]
          }
        });
        return result.data;
      } catch (error2) {
        // Si ya existe, actualizar
        const existing = await fetchAPI(`/api/articles?filters[documentId][$eq]=${documentId}&locale=${locale}`);
        if (existing.data?.[0]) {
          const existingId = existing.data[0].id;
          await fetchAPI(`/api/articles/${existingId}`, 'PUT', {
            data: localizationData
          });
          return existing.data[0];
        }
        throw error2;
      }
    }
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 Traduciendo todos los artículos...\n');
  
  console.log('📋 Obteniendo datos...');
  const [articlesRes, categoriesMap, tagsMap] = await Promise.all([
    fetchAPI(`/api/articles?pagination[pageSize]=100&locale=${BASE_LOCALE}`),
    getCategoriesMap(),
    getTagsMap()
  ]);
  
  // Obtener relaciones de cada artículo por separado
  console.log('📋 Obteniendo relaciones de artículos...');
  const articlesWithRelations = [];
  for (const article of articlesRes.data || []) {
    try {
      const fullArticle = await fetchAPI(`/api/articles/${article.documentId || article.id}?populate[categories][fields][0]=documentId&populate[tags][fields][0]=documentId&populate[author][fields][0]=id`);
      articlesWithRelations.push(fullArticle.data || article);
    } catch (error) {
      console.log(`   ⚠️  Error obteniendo artículo ${article.id}: ${error.message.substring(0, 50)}`);
      articlesWithRelations.push(article);
    }
  }
  
  const articles = articlesWithRelations;
  console.log(`✅ Artículos en ${BASE_LOCALE}: ${articles.length}`);
  console.log(`✅ Categorías: ${categoriesMap.size}`);
  console.log(`✅ Tags: ${tagsMap.size}\n`);
  
  let totalCreated = 0;
  let totalErrors = 0;
  
  for (const article of articles) {
    const title = article.attributes?.title || article.title || 'Sin título';
    const documentId = article.documentId;
    
    console.log(`\n📰 ${title}`);
    
    // Verificar localizaciones existentes
    const existingCheck = await fetchAPI(`/api/articles?filters[documentId][$eq]=${documentId}&locale=all`);
    const existingLocales = new Set();
    if (existingCheck.data) {
      existingCheck.data.forEach(item => {
        if (item.locale) existingLocales.add(item.locale);
      });
    }
    
    for (const locale of LOCALES) {
      if (existingLocales.has(locale)) {
        console.log(`   ⏭️  ${locale.toUpperCase()} ya existe`);
        continue;
      }
      
      try {
        console.log(`   🌐 Creando ${locale.toUpperCase()}...`);
        await createArticleLocalization(article, locale, categoriesMap, tagsMap);
        console.log(`   ✅ ${locale.toUpperCase()} creado`);
        totalCreated++;
      } catch (error) {
        console.log(`   ❌ Error en ${locale.toUpperCase()}: ${error.message.substring(0, 100)}`);
        totalErrors++;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('📊 RESUMEN');
  console.log('═══════════════════════════════════════');
  console.log(`   Localizaciones creadas: ${totalCreated}`);
  console.log(`   Errores: ${totalErrors}`);
  console.log('');
  console.log('⚠️  Las traducciones están marcadas para traducción manual.');
  console.log('   Revisa y completa las traducciones en Strapi admin.');
  console.log('');
}

main().catch(error => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

