import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN || '';

const ARTICLE_TITLE = '10 Alimentos que no sabías que tienen proteína';

// Traducciones para el artículo
const TRANSLATIONS = {
  en: {
    title: '10 Foods You Didn\'t Know Have Protein',
    slug: '10-foods-you-didnt-know-have-protein',
    excerpt: 'Discover surprising sources of protein in everyday foods that can help you reach your daily protein goals.',
    // El contenido completo se traducirá después
  },
  fr: {
    title: '10 Aliments que vous ne saviez pas contenaient des protéines',
    slug: '10-aliments-proteines-insoupconnes',
    excerpt: 'Découvrez des sources surprenantes de protéines dans les aliments quotidiens qui peuvent vous aider à atteindre vos objectifs protéiques quotidiens.',
  },
  de: {
    title: '10 Lebensmittel, von denen Sie nicht wussten, dass sie Protein enthalten',
    slug: '10-lebensmittel-mit-protein',
    excerpt: 'Entdecken Sie überraschende Proteinquellen in alltäglichen Lebensmitteln, die Ihnen helfen können, Ihre täglichen Proteinziele zu erreichen.',
  },
  hu: {
    title: '10 étel, amiről nem tudtad, hogy fehérjét tartalmaz',
    slug: '10-feherjetartalmu-etel',
    excerpt: 'Fedezz fel meglepő fehérjeforrásokat mindennapi ételekben, amelyek segíthetnek elérni a napi fehérjecéljaidat.',
  }
};

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

// Función para obtener la localización de una categoría o tag
async function getLocalizedRelation(relation, targetLocale, type) {
  if (!relation || !relation.data) return null;
  
  const relationData = Array.isArray(relation.data) ? relation.data[0] : relation.data;
  if (!relationData) return null;
  
  const documentId = relationData.documentId;
  if (!documentId) {
    // Si no hay documentId, usar el ID directamente
    return relationData.id || relationData.documentId;
  }
  
  try {
    // Buscar localización por documentId en el idioma objetivo
    const response = await fetchAPI(`/api/${type}s?filters[documentId][$eq]=${documentId}&locale=${targetLocale}`);
    
    if (response.data && response.data.length > 0) {
      const localized = response.data.find(item => {
        const locale = item.attributes?.locale || item.locale;
        return locale === targetLocale;
      });
      
      if (localized) {
        return localized.id;
      }
    }
    
    // Si no se encuentra, retornar el ID original
    return relationData.id || relationData.documentId;
  } catch (error) {
    console.warn(`   ⚠️  No se pudo obtener localización de ${type}: ${error.message.substring(0, 100)}`);
    return relationData.id || relationData.documentId;
  }
}

// Función para obtener todas las localizaciones de relaciones múltiples
async function getLocalizedRelations(relations, targetLocale, type) {
  if (!relations || !relations.data || relations.data.length === 0) return [];
  
  const localizedIds = [];
  for (const relation of relations.data) {
    const localizedId = await getLocalizedRelation({ data: relation }, targetLocale, type);
    if (localizedId) {
      localizedIds.push(localizedId);
    }
  }
  return localizedIds;
}

async function main() {
  console.log('🚀 Traduciendo artículo: "10 Alimentos que no sabías que tienen proteína"\n');
  
  // 1. Buscar el artículo en español
  console.log('📋 Buscando artículo en español...');
  let articles;
  try {
    // Buscar sin populate primero para evitar errores de validación
    articles = await fetchAPI(`/api/articles?locale=es&filters[title][$contains]=${encodeURIComponent('10 Alimentos')}`);
  } catch (error) {
    console.error('❌ Error buscando artículo:', error.message);
    return;
  }
  
  if (!articles.data || articles.data.length === 0) {
    console.error('❌ No se encontró el artículo');
    return;
  }
  
  const spanishArticle = articles.data[0];
  const articleId = spanishArticle.id;
  const documentId = spanishArticle.documentId;
  const attrs = spanishArticle.attributes || spanishArticle;
  
  console.log(`✅ Artículo encontrado: "${attrs.title}" (ID: ${articleId}, DocumentID: ${documentId})\n`);
  
  // 2. Obtener relaciones del artículo
  console.log('📦 Obteniendo relaciones del artículo...');
  const fullAttrs = attrs;
  
  // Las relaciones pueden venir como objetos con data o como arrays
  let categories = fullAttrs.categories;
  let tags = fullAttrs.tags;
  let author = fullAttrs.author;
  
  // Si las relaciones no están pobladas, intentar obtenerlas
  // En Strapi v5, las relaciones pueden venir como { data: null } o simplemente no estar presentes
  if (!categories || !categories.data) {
    console.log('   ⚠️  Categorías no pobladas, se usarán las del artículo original');
  }
  if (!tags || !tags.data) {
    console.log('   ⚠️  Tags no poblados, se usarán los del artículo original');
  }
  
  const date = fullAttrs.date || new Date().toISOString().split('T')[0];
  const imageAlt = fullAttrs.imageAlt || '';
  
  // Obtener ID del autor
  let authorId = null;
  if (author) {
    if (author.data) {
      const authorData = Array.isArray(author.data) ? author.data[0] : author.data;
      authorId = authorData?.id || authorData?.documentId;
    } else if (author.id) {
      authorId = author.id;
    } else if (typeof author === 'number') {
      authorId = author;
    }
  }
  
  console.log(`   📝 Categorías: ${categories?.data?.length || 0}`);
  console.log(`   🏷️  Tags: ${tags?.data?.length || 0}`);
  console.log(`   👤 Autor: ${authorId ? 'Sí (ID: ' + authorId + ')' : 'No'}\n`);
  
  // 3. Crear traducciones para cada idioma
  const locales = ['en', 'fr', 'de', 'hu'];
  
  for (const locale of locales) {
    console.log(`\n🌍 Traduciendo a ${locale.toUpperCase()}...`);
    
    const translation = TRANSLATIONS[locale];
    
    // Verificar si ya existe (por documentId o por slug)
    try {
      const existingById = await fetchAPI(`/api/articles?filters[documentId][$eq]=${documentId}&locale=${locale}`);
      if (existingById.data && existingById.data.length > 0) {
        console.log(`   ⏭️  Ya existe traducción en ${locale.toUpperCase()} (vinculada por documentId)`);
        continue;
      }
      
      // También verificar por slug
      const existingBySlug = await fetchAPI(`/api/articles?filters[slug][$eq]=${translation.slug}&locale=${locale}`);
      if (existingBySlug.data && existingBySlug.data.length > 0) {
        console.log(`   ⏭️  Ya existe traducción en ${locale.toUpperCase()} (encontrada por slug)`);
        continue;
      }
    } catch (e) {
      // Continuar si no existe
    }
    
    // Obtener categorías y tags localizadas
    let localizedCategoryIds = [];
    let localizedTagIds = [];
    
    if (categories?.data) {
      localizedCategoryIds = await getLocalizedRelations(categories, locale, 'category');
      console.log(`   📂 Categorías localizadas: ${localizedCategoryIds.length}`);
    }
    
    if (tags?.data) {
      localizedTagIds = await getLocalizedRelations(tags, locale, 'tag');
      console.log(`   🏷️  Tags localizados: ${localizedTagIds.length}`);
    }
    
    // Traducir imageAlt (mantener el mismo si no hay traducción específica)
    const translatedImageAlt = imageAlt ? `${imageAlt} (${locale.toUpperCase()})` : '';
    
    // Crear datos de la localización
    const createData = {
      data: {
        locale: locale,
        title: translation.title,
        slug: translation.slug,
        excerpt: translation.excerpt,
        content: fullAttrs.content || '', // Mantener el contenido original por ahora (se puede traducir después)
        date: date,
        imageAlt: translatedImageAlt,
        publishedAt: null // Dejar como borrador
      }
    };
    
    // Añadir relaciones
    if (authorId) {
      createData.data.author = authorId;
    }
    
    if (localizedCategoryIds.length > 0) {
      createData.data.categories = localizedCategoryIds;
    }
    
    if (localizedTagIds.length > 0) {
      createData.data.tags = localizedTagIds;
    }
    
    // Intentar crear localización
    try {
      // Primero intentar con el endpoint de localizaciones usando documentId
      let result;
      try {
        // En Strapi v5, podemos intentar crear usando el endpoint de localizaciones
        // usando el ID del documento o el ID del artículo
        result = await fetchAPI(`/api/articles/${articleId}/localizations`, 'POST', createData);
        console.log(`   ✅ Localización creada usando endpoint /localizations`);
      } catch (localizationError) {
        // Si falla, crear como artículo nuevo con locale
        console.log(`   ℹ️  Método /localizations no disponible, creando artículo nuevo...`);
        result = await fetchAPI(`/api/articles?locale=${locale}`, 'POST', createData);
        console.log(`   ✅ Artículo creado (requiere vinculación manual en Strapi Admin como localización)`);
      }
      
      console.log(`   ✅ Traducción completada para ${locale.toUpperCase()}`);
      
      // Pausa para no saturar la API
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error(`   ❌ Error creando traducción en ${locale}: ${error.message}`);
    }
  }
  
  console.log('\n═══════════════════════════════════════');
  console.log('✅ Proceso completado');
  console.log('═══════════════════════════════════════');
  console.log('\n⚠️  NOTA: El contenido (content) se mantiene en español.');
  console.log('   Debes traducirlo manualmente en Strapi Admin o usar una API de traducción.');
  console.log('   Las categorías y tags se han vinculado a sus versiones localizadas.');
}

main().catch(console.error);

