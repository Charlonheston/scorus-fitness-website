/**
 * Script para asignar automáticamente tags a artículos basándose en su contenido
 * Analiza el título, descripción y contenido de cada artículo y asocia tags relevantes
 * 
 * Uso: node auto-assign-tags.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Leer .env manualmente
let STRAPI_API_TOKEN = '';
let STRAPI_URL = 'https://scorus-cms-strapi.onrender.com';

try {
  const envContent = readFileSync(join(__dirname, '.env.local'), 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('STRAPI_API_TOKEN=')) {
      STRAPI_API_TOKEN = trimmed.replace('STRAPI_API_TOKEN=', '').replace(/^["']|["']$/g, '').trim();
    }
    if (trimmed.startsWith('PUBLIC_STRAPI_URL=')) {
      STRAPI_URL = trimmed.replace('PUBLIC_STRAPI_URL=', '').replace(/^["']|["']$/g, '').trim();
    }
  }
} catch (error) {
  console.warn('⚠️ No se pudo leer .env.local, usando variables de entorno');
  STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.PUBLIC_STRAPI_API_TOKEN || '';
  STRAPI_URL = process.env.PUBLIC_STRAPI_URL || process.env.STRAPI_URL || 'https://scorus-cms-strapi.onrender.com';
}

if (!STRAPI_API_TOKEN) {
  console.error('❌ Error: STRAPI_API_TOKEN no encontrado');
  console.log('💡 Crea un archivo .env.local con:');
  console.log('   PUBLIC_STRAPI_URL=https://scorus-cms-strapi.onrender.com');
  console.log('   STRAPI_API_TOKEN=tu_token_aqui');
  process.exit(1);
}

// Función para hacer requests a Strapi
async function strapiFetch(endpoint, options = {}) {
  const url = `${STRAPI_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

// Función para obtener todas las tags
async function getAllTags() {
  console.log('📋 Obteniendo todas las tags...');
  const tags = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const response = await strapiFetch(
      `/api/tags?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate=*`
    );

    const data = response.data || [];
    if (data.length === 0) break;

    tags.push(...data);
    console.log(`   ✅ Obtenidas ${tags.length} tags...`);

    if (data.length < pageSize) break;
    page++;
  }

  return tags;
}

// Función para obtener todos los artículos
async function getAllArticles() {
  console.log('📰 Obteniendo todos los artículos...');
  const articles = [];
  let page = 1;
  const pageSize = 50;

  while (true) {
    const response = await strapiFetch(
      `/api/articles?pagination[page]=${page}&pagination[pageSize]=${pageSize}&populate[0]=tags&publicationState=preview`
    );

    const data = response.data || [];
    if (data.length === 0) break;

    articles.push(...data);
    console.log(`   ✅ Obtenidos ${articles.length} artículos...`);

    if (data.length < pageSize) break;
    page++;
  }

  return articles;
}

// Función para extraer texto del contenido
function extractText(content) {
  if (!content) return '';
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (Array.isArray(content)) {
    // Es un array de blocks (Strapi v5)
    return content
      .map(block => {
        if (block.type === 'paragraph' && block.children) {
          return block.children.map(child => child.text || '').join(' ');
        }
        if (block.type === 'heading' && block.children) {
          return block.children.map(child => child.text || '').join(' ');
        }
        return '';
      })
      .join(' ');
  }
  
  return '';
}

// Función para normalizar texto (minúsculas, sin acentos básicos)
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ');
}

// Función para calcular relevancia de una tag para un artículo
function calculateRelevance(tagName, article) {
  // Extraer todo el texto del artículo
  const title = article.attributes?.title || article.title || '';
  const description = article.attributes?.description || article.description || '';
  const content = extractText(article.attributes?.content || article.content || '');
  const fullText = `${title} ${description} ${content}`.toLowerCase();
  
  // Normalizar tag name
  const normalizedTag = normalizeText(tagName);
  const tagWords = normalizedTag.split(/\s+/).filter(w => w.length > 2);
  
  // Calcular puntuación
  let score = 0;
  
  // Si el tag aparece en el título: +10 puntos
  const normalizedTitle = normalizeText(title);
  if (normalizedTitle.includes(normalizedTag)) {
    score += 10;
  }
  
  // Si el tag aparece en la descripción: +5 puntos
  const normalizedDescription = normalizeText(description);
  if (normalizedDescription.includes(normalizedTag)) {
    score += 5;
  }
  
  // Contar apariciones en el contenido
  const normalizedContent = normalizeText(content);
  const occurrences = (normalizedContent.match(new RegExp(normalizedTag, 'g')) || []).length;
  score += occurrences * 2;
  
  // Si alguna palabra del tag aparece múltiples veces: +1 por palabra
  tagWords.forEach(word => {
    if (word.length > 3) {
      const wordOccurrences = (normalizedContent.match(new RegExp(word, 'g')) || []).length;
      score += Math.min(wordOccurrences, 3); // Máximo 3 puntos por palabra
    }
  });
  
  return score;
}

// Función para encontrar tags relevantes para un artículo
function findRelevantTags(article, allTags, minScore = 3) {
  const scores = [];
  
  // Obtener tags existentes del artículo
  const existingTags = article.attributes?.tags?.data || article.tags?.data || [];
  const existingTagIds = new Set(existingTags.map(t => t.id));
  
  // Calcular relevancia para cada tag
  allTags.forEach(tag => {
    // Saltar tags ya asignadas
    if (existingTagIds.has(tag.id)) {
      return;
    }
    
    const tagName = tag.attributes?.name || tag.name || '';
    if (!tagName) return;
    
    const score = calculateRelevance(tagName, article);
    if (score >= minScore) {
      scores.push({ tag, score });
    }
  });
  
  // Ordenar por score y tomar las top 5
  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.tag);
}

// Función para actualizar tags de un artículo
async function updateArticleTags(articleId, tagIds) {
  if (tagIds.length === 0) {
    console.log(`   ⏭️  No hay tags nuevas para asignar`);
    return false;
  }

  try {
    // Obtener tags actuales sin populate profundo para evitar el error
    let currentTagIds = [];
    try {
      const currentArticle = await strapiFetch(`/api/articles/${articleId}?fields[0]=id&populate[0]=tags&fields[tags][0]=id`);
      // Manejar diferentes estructuras de respuesta
      const tagsData = currentArticle.data?.attributes?.tags?.data || 
                       currentArticle.data?.tags?.data || 
                       (Array.isArray(currentArticle.data?.attributes?.tags) ? currentArticle.data.attributes.tags : []) ||
                       (Array.isArray(currentArticle.data?.tags) ? currentArticle.data.tags : []);
      currentTagIds = tagsData.map(t => (typeof t === 'object' && t.id) ? t.id : t).filter(id => id);
    } catch (e) {
      // Si falla obtener tags actuales, continuar solo con las nuevas
      console.log(`   ⚠️  No se pudieron obtener tags actuales, usando solo las nuevas`);
    }
    
    // Combinar tags existentes con nuevas (sin duplicados)
    const allTagIds = [...new Set([...currentTagIds, ...tagIds])];
    
    // Si ya tiene todas las tags, no hacer nada
    if (allTagIds.length === currentTagIds.length) {
      console.log(`   ✅ Ya tiene todas las tags asignadas`);
      return true;
    }
    
    // Intentar diferentes formatos de Strapi v5
    const formats = [
      // Formato 1: connect con id (formato estándar Strapi v5)
      {
        data: {
          tags: {
            connect: allTagIds.map(id => ({ id }))
          }
        }
      },
      // Formato 2: array directo de IDs
      {
        data: {
          tags: allTagIds
        }
      },
      // Formato 3: set con connect
      {
        data: {
          tags: {
            set: allTagIds.map(id => ({ id }))
          }
        }
      }
    ];
    
    let success = false;
    let lastError = null;
    
    for (const body of formats) {
      try {
        await strapiFetch(`/api/articles/${articleId}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        success = true;
        break;
      } catch (error) {
        lastError = error;
        // Intentar siguiente formato
        continue;
      }
    }
    
    if (!success) {
      throw lastError || new Error('No se pudo actualizar con ningún formato');
    }
    
    return true;
  } catch (error) {
    console.error(`   ❌ Error actualizando tags: ${error.message}`);
    // Si el error es sobre tags.articles, intentar con un approach diferente
    if (error.message.includes('tags.articles')) {
      console.log(`   💡 Intentando método alternativo...`);
      // Intentar usando solo las nuevas tags (sin obtener las actuales)
      try {
        await strapiFetch(`/api/articles/${articleId}`, {
          method: 'PUT',
          body: JSON.stringify({
            data: {
              tags: {
                connect: tagIds.map(id => ({ id }))
              }
            }
          }),
        });
        return true;
      } catch (e2) {
        console.error(`   ❌ Método alternativo también falló: ${e2.message}`);
      }
    }
    return false;
  }
}

// Función principal
async function main() {
  console.log('🚀 Iniciando asignación automática de tags...\n');
  
  try {
    // 1. Obtener todas las tags
    const allTags = await getAllTags();
    console.log(`\n✅ Total de tags disponibles: ${allTags.length}\n`);
    
    if (allTags.length === 0) {
      console.log('⚠️  No hay tags disponibles en Strapi');
      return;
    }
    
    // 2. Obtener todos los artículos
    const articles = await getAllArticles();
    console.log(`\n✅ Total de artículos: ${articles.length}\n`);
    
    if (articles.length === 0) {
      console.log('⚠️  No hay artículos disponibles');
      return;
    }
    
    // 3. Procesar cada artículo
    let updated = 0;
    let skipped = 0;
    
    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      // En Strapi v5, el ID puede estar en article.id o article.documentId
      const articleId = article.documentId || article.id;
      const title = article.attributes?.title || article.title || 'Sin título';
      
      if (!articleId) {
        console.log(`   ⚠️  No se pudo obtener ID del artículo, saltando...`);
        continue;
      }
      
      console.log(`\n[${i + 1}/${articles.length}] 📰 ${title}`);
      
      // Encontrar tags relevantes
      const relevantTags = findRelevantTags(article, allTags);
      
      if (relevantTags.length === 0) {
        console.log(`   ⏭️  No se encontraron tags relevantes`);
        skipped++;
        continue;
      }
      
      console.log(`   🏷️  Tags relevantes encontradas: ${relevantTags.length}`);
      relevantTags.forEach(tag => {
        const tagName = tag.attributes?.name || tag.name;
        const score = calculateRelevance(tagName, article);
        console.log(`      - ${tagName} (relevancia: ${score})`);
      });
      
      // Actualizar artículo
      const tagIds = relevantTags.map(tag => tag.id);
      const success = await updateArticleTags(articleId, tagIds);
      
      if (success) {
        updated++;
        console.log(`   ✅ Tags asignadas correctamente`);
      } else {
        skipped++;
      }
      
      // Pequeña pausa para no sobrecargar la API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Resumen
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN');
    console.log('='.repeat(50));
    console.log(`✅ Artículos actualizados: ${updated}`);
    console.log(`⏭️  Artículos sin cambios: ${skipped}`);
    console.log(`📋 Total procesados: ${articles.length}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();

