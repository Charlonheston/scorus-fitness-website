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
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
  }
  return res.json();
}

console.log('🌍 Iniciando traducción de artículos...\n');

// 1. Obtener todos los artículos en español
console.log('📋 Obteniendo artículos en español...');
const articlesRes = await fetchAPI(`/api/articles?locale=${BASE_LOCALE}&pagination[pageSize]=100`);
const articles = articlesRes.data || [];
console.log(`✅ Encontrados ${articles.length} artículos\n`);

// 2. Obtener todas las tags y categorías en todos los idiomas
console.log('📋 Obteniendo tags y categorías en todos los idiomas...');
const allTagsByDocId = new Map();
const allCategoriesByDocId = new Map();

for (const locale of [BASE_LOCALE, ...LOCALES]) {
  try {
    const [tagsRes, categoriesRes] = await Promise.all([
      fetchAPI(`/api/tags?locale=${locale}&pagination[pageSize]=200`),
      fetchAPI(`/api/categories?locale=${locale}&pagination[pageSize]=100`)
    ]);
    
    (tagsRes.data || []).forEach(tag => {
      const docId = tag.documentId || tag.id;
      if (!allTagsByDocId.has(docId)) {
        allTagsByDocId.set(docId, new Map());
      }
      allTagsByDocId.get(docId).set(locale, tag);
    });
    
    (categoriesRes.data || []).forEach(cat => {
      const docId = cat.documentId || cat.id;
      if (!allCategoriesByDocId.has(docId)) {
        allCategoriesByDocId.set(docId, new Map());
      }
      allCategoriesByDocId.get(docId).set(locale, cat);
    });
  } catch (error) {
    console.log(`⚠️  Error obteniendo datos para ${locale}: ${error.message}`);
  }
}

console.log(`✅ Tags: ${allTagsByDocId.size} únicas, Categorías: ${allCategoriesByDocId.size} únicas\n`);

// 3. Función para encontrar tags localizadas
function findLocalizedTagIds(originalTags, targetLocale) {
  const localizedIds = [];
  
  for (const originalTag of originalTags) {
    const docId = originalTag.documentId || originalTag.id;
    const tagLocales = allTagsByDocId.get(docId);
    
    if (tagLocales) {
      const localizedTag = tagLocales.get(targetLocale);
      if (localizedTag) {
        localizedIds.push(localizedTag.documentId || localizedTag.id);
      } else {
        // Si no existe en el idioma objetivo, usar la original
        const original = tagLocales.get(BASE_LOCALE);
        if (original) {
          localizedIds.push(original.documentId || original.id);
        }
      }
    }
  }
  
  return localizedIds;
}

// 4. Función para encontrar categoría localizada
function findLocalizedCategoryId(originalCategory, targetLocale) {
  if (!originalCategory) return null;
  
  const docId = originalCategory.documentId || originalCategory.id;
  const catLocales = allCategoriesByDocId.get(docId);
  
  if (catLocales) {
    const localized = catLocales.get(targetLocale);
    if (localized) {
      return localized.documentId || localized.id;
    }
    // Si no existe, usar la original
    const original = catLocales.get(BASE_LOCALE);
    if (original) {
      return original.documentId || original.id;
    }
  }
  
  return null;
}

// 5. Función simple de traducción (placeholder - usar API real en producción)
function translateText(text, targetLocale) {
  if (!text) return '';
  
  // Por ahora, retornar placeholder que indica que necesita traducción
  // En producción, usar Google Translate API, DeepL, etc.
  return `[TRANSLATE TO ${targetLocale.toUpperCase()}] ${text}`;
}

// 6. Procesar cada artículo
let totalTranslated = 0;
let totalSkipped = 0;
let totalErrors = 0;

for (const article of articles) {
  const articleId = article.documentId || article.id;
  const title = article.attributes?.title || article.title;
  const slug = article.attributes?.slug || article.slug;
  
  console.log(`\n📰 ${title}`);
  console.log(`   Slug: ${slug}`);
  
  // Obtener artículo completo
  const fullArticle = await fetchAPI(`/api/articles/${articleId}?locale=${BASE_LOCALE}`);
  const attrs = fullArticle.data?.attributes || fullArticle.data || {};
  
  const originalTags = attrs.tags?.data || attrs.tags || [];
  const originalCategory = attrs.categories?.data?.[0] || attrs.categories?.[0] || null;
  const originalAuthor = attrs.author?.data || attrs.author || null;
  
  console.log(`   Tags: ${originalTags.length}, Categoría: ${originalCategory ? (originalCategory.attributes?.name || originalCategory.name) : 'N/A'}`);
  
  // Traducir a cada idioma
  for (const locale of LOCALES) {
    try {
      // Verificar si ya existe
      const existing = await fetchAPI(`/api/articles/${articleId}?locale=${locale}`);
      if (existing.data && existing.data.id) {
        console.log(`   ⏭️  ${locale.toUpperCase()}: Ya existe`);
        totalSkipped++;
        continue;
      }
      
      // Traducir contenido
      const translatedTitle = translateText(attrs.title || '', locale);
      const translatedExcerpt = translateText(attrs.excerpt || '', locale);
      const translatedContent = translateText(attrs.content || '', locale);
      
      // Encontrar tags y categoría localizadas
      const localizedTagIds = findLocalizedTagIds(originalTags, locale);
      const localizedCategoryId = findLocalizedCategoryId(originalCategory, locale);
      
      // Crear localización
      const localizationData = {
        title: translatedTitle,
        slug: slug, // Mantener mismo slug
        excerpt: translatedExcerpt,
        content: translatedContent,
        date: attrs.date || new Date().toISOString().split('T')[0],
        locale: locale,
        tags: localizedTagIds,
        categories: localizedCategoryId ? [localizedCategoryId] : [],
        author: originalAuthor ? (originalAuthor.documentId || originalAuthor.id) : null
      };
      
      // En Strapi v5, crear localización usando POST a /api/articles con documentId
      const documentId = article.documentId || articleId;
      
      await fetchAPI('/api/articles', 'POST', {
        data: {
          ...localizationData,
          documentId: documentId // Usar el mismo documentId para vincular localizaciones
        }
      });
      
      console.log(`   ✅ ${locale.toUpperCase()}: Creada (${localizedTagIds.length} tags)`);
      totalTranslated++;
      
      // Pausa para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (error) {
      if (error.message.includes('already exists') || error.message.includes('duplicate')) {
        console.log(`   ⏭️  ${locale.toUpperCase()}: Ya existe`);
        totalSkipped++;
      } else {
        console.log(`   ❌ ${locale.toUpperCase()}: ${error.message.substring(0, 60)}`);
        totalErrors++;
      }
    }
  }
}

console.log('\n═══════════════════════════════════════');
console.log('📊 RESUMEN');
console.log('═══════════════════════════════════════');
console.log(`   ✅ Traducidos: ${totalTranslated}`);
console.log(`   ⏭️  Omitidos: ${totalSkipped}`);
console.log(`   ❌ Errores: ${totalErrors}`);
console.log('');

