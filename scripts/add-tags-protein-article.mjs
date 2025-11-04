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

// Tags relevantes para el artículo sobre proteína
const relevantTagNames = [
  'nutricion-deportiva',
  'recetas-fitness',
  'recetas-proteicas',
  'macronutrientes',
  'nutricion-avanzada',
  'comida-post-entreno',
  'comida-pre-entreno',
  'habitos-saludables'
];

console.log('Obteniendo datos...\n');

// Obtener todas las tags
const tagsRes = await fetchAPI('/api/tags?pagination[pageSize]=100');
const tags = tagsRes.data || [];

// Obtener el artículo específico
const articlesRes = await fetchAPI('/api/articles?pagination[pageSize]=100');
const articles = articlesRes.data || [];
const article = articles.find(a => {
  const title = a.attributes?.title || a.title || '';
  return title.toLowerCase().includes('10 alimentos') || title.toLowerCase().includes('proteína');
});

if (!article) {
  console.log('❌ Artículo no encontrado');
  process.exit(1);
}

const articleId = article.documentId || article.id;
const title = article.attributes?.title || article.title;
console.log(`📰 Artículo: ${title}`);
console.log(`   ID: ${articleId}\n`);

// Obtener artículo completo
const fullArticle = await fetchAPI(`/api/articles/${articleId}`);
const existingTags = fullArticle.data?.attributes?.tags || [];
const existingIds = Array.isArray(existingTags) 
  ? existingTags.map(t => typeof t === 'object' ? (t.documentId || t.id) : t).filter(Boolean)
  : [];

console.log(`Tags actuales: ${existingIds.length}`);

// Buscar tags relevantes por slug
const tagIdsToAdd = [];
for (const tagName of relevantTagNames) {
  const tag = tags.find(t => {
    const slug = (t.attributes?.slug || t.slug || '').toLowerCase();
    return slug === tagName || slug.includes(tagName);
  });
  
  if (tag) {
    const tagId = tag.documentId || tag.id;
    const tagDisplayName = tag.attributes?.name || tag.name || 'Sin nombre';
    if (!existingIds.includes(tagId)) {
      tagIdsToAdd.push({ id: tagId, name: tagDisplayName });
      console.log(`   ✅ Encontrada: ${tagDisplayName}`);
    } else {
      console.log(`   ⏭️  Ya existe: ${tagDisplayName}`);
    }
  } else {
    console.log(`   ❌ No encontrada: ${tagName}`);
  }
}

if (tagIdsToAdd.length === 0) {
  console.log('\n✅ El artículo ya tiene todas las tags relevantes');
  process.exit(0);
}

console.log(`\n📝 Añadiendo ${tagIdsToAdd.length} tags...`);

// Actualizar artículo
const attrs = fullArticle.data?.attributes || fullArticle.data || {};
const allTagIds = [...new Set([...existingIds, ...tagIdsToAdd.map(t => t.id)])];

try {
  await fetchAPI(`/api/articles/${articleId}`, 'PUT', {
    data: { 
      title: attrs.title,
      slug: attrs.slug,
      excerpt: attrs.excerpt,
      content: attrs.content,
      tags: allTagIds 
    }
  });
  
  console.log('\n✅ Tags añadidas exitosamente:');
  tagIdsToAdd.forEach(t => console.log(`   - ${t.name}`));
} catch (e) {
  console.log(`\n❌ Error: ${e.message}`);
  process.exit(1);
}


