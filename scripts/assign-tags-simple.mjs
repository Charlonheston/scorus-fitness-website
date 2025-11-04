import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const TOKEN = process.env.STRAPI_API_TOKEN || '';

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

// Obtener tags
const tagsRes = await fetchAPI('/api/tags?pagination[pageSize]=100');
const tags = tagsRes.data || [];

// Obtener artículos (sin populate que causa error)
const articlesRes = await fetchAPI('/api/articles?pagination[pageSize]=100');
const articles = articlesRes.data || [];

console.log(`Tags: ${tags.length}, Artículos: ${articles.length}\n`);

for (const article of articles) {
  // Strapi v5 puede usar documentId en lugar de id
  const id = article.documentId || article.id;
  const title = article.attributes?.title || article.title || 'Sin título';
  
  console.log(`\n📰 Procesando: ${title}`);
  console.log(`   ID: ${id}, documentId: ${article.documentId}`);
  
  // Obtener artículo completo con tags (sin populate que causa error)
  const fullArticle = await fetchAPI(`/api/articles/${id}`);
  const existingTags = fullArticle.data?.attributes?.tags || [];
  const existingIds = Array.isArray(existingTags) 
    ? existingTags.map(t => typeof t === 'object' ? t.id : t).filter(Boolean)
    : [];
  
  const text = `${title} ${fullArticle.data?.attributes?.excerpt || ''}`.toLowerCase();
  
  const newIds = [];
  for (const tag of tags) {
    const tagId = tag.documentId || tag.id;
    const tagName = (tag.attributes?.name || tag.name || '').toLowerCase();
    const tagSlug = (tag.attributes?.slug || tag.slug || '').toLowerCase();
    
    if (existingIds.includes(tagId)) continue;
    
    // Buscar coincidencias en nombre y slug
    const words = tagName.split(/[\s-]+/).filter(w => w.length > 2);
    const slugWords = tagSlug.split('-').filter(w => w.length > 2);
    
    const matches = words.some(w => text.includes(w)) || slugWords.some(w => text.includes(w));
    if (matches) newIds.push(tagId);
  }
  
  console.log(`   Tags existentes: ${existingIds.length}, Nuevas: ${newIds.length}`);
  
  if (newIds.length === 0) {
    console.log(`⏭️  ${title}`);
    continue;
  }
  
  const allIds = [...new Set([...existingIds, ...newIds])];
  
  try {
      // Conectar tags usando el endpoint de relaciones
      for (const tagId of newIds) {
        await fetchAPI(`/api/articles/${id}/relations/tags`, 'POST', {
          data: { id: tagId, documentId: tagId }
        });
      }
    console.log(`✅ ${title} - +${newIds.length} tags`);
  } catch (e) {
    // Fallback: actualizar completo
    try {
      const attrs = fullArticle.data?.attributes || fullArticle.data || {};
      // Para Strapi v5, usar documentId para relaciones
      const tagDocumentIds = allIds.map(id => {
        const tag = tags.find(t => (t.documentId || t.id) === id);
        return tag?.documentId || tag?.id || id;
      });
      
      await fetchAPI(`/api/articles/${id}`, 'PUT', {
        data: { 
          title: attrs.title,
          slug: attrs.slug,
          excerpt: attrs.excerpt,
          content: attrs.content,
          tags: tagDocumentIds 
        }
      });
      console.log(`✅ ${title} - +${newIds.length} tags (fallback)`);
    } catch (e2) {
      console.log(`❌ ${title} - ${e2.message.substring(0, 50)}`);
    }
  }
}

