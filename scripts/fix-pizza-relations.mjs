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

// Obtener datos
const [articleRes, tagsRes, categoriesRes, authorsRes] = await Promise.all([
  fetchAPI('/api/articles?filters[slug][$eq]=receta-de-pizza-fit'),
  fetchAPI('/api/tags?pagination[pageSize]=100'),
  fetchAPI('/api/categories?pagination[pageSize]=100'),
  fetchAPI('/api/authors?pagination[pageSize]=100')
]);

const article = articleRes.data?.[0];
if (!article) {
  console.log('❌ Artículo no encontrado');
  process.exit(1);
}

const articleId = article.documentId || article.id;
const tags = tagsRes.data || [];
const categories = categoriesRes.data || [];
const authors = authorsRes.data || [];

// Tags relevantes
const relevantTagSlugs = [
  'recetas-fitness',
  'recetas-proteicas',
  'nutricion-deportiva',
  'comida-post-entreno',
  'comida-pre-entreno',
  'habitos-saludables',
  'dieta-definicion',
  'perder-grasa'
];

const tagsToConnect = relevantTagSlugs
  .map(slug => tags.find(t => (t.attributes?.slug || t.slug || '').toLowerCase() === slug))
  .filter(Boolean);

// Categoría
const nutritionCategory = categories.find(c => {
  const name = (c.attributes?.name || c.name || '').toLowerCase();
  return name.includes('nutrición') || name.includes('nutricion');
});

// Autor
const author = authors.find(a => {
  const name = (a.attributes?.name || a.name || '').toLowerCase();
  return name.includes('bernat') || name.includes('scorus');
}) || authors[0];

console.log('🔗 Conectando relaciones...\n');

// Conectar tags usando PUT directo con todos los campos
const fullArticle = await fetchAPI(`/api/articles/${articleId}`);
const attrs = fullArticle.data?.attributes || fullArticle.data || {};

const tagIds = tagsToConnect.map(t => t.documentId || t.id);
const categoryId = nutritionCategory ? (nutritionCategory.documentId || nutritionCategory.id) : null;
const authorId = author ? (author.documentId || author.id) : null;

try {
  // Actualizar con todos los campos incluyendo relaciones
  const updateData = {
    title: attrs.title,
    slug: attrs.slug,
    excerpt: attrs.excerpt,
    content: attrs.content,
    date: attrs.date || new Date().toISOString().split('T')[0]
  };

  // Añadir relaciones solo si existen
  if (tagIds.length > 0) updateData.tags = tagIds;
  if (categoryId) updateData.categories = [categoryId];
  if (authorId) updateData.author = authorId;

  await fetchAPI(`/api/articles/${articleId}`, 'PUT', {
    data: updateData
  });

  console.log('✅ Artículo actualizado!');
  console.log(`   Tags: ${tagIds.length} conectadas`);
  console.log(`   Categoría: ${nutritionCategory ? (nutritionCategory.attributes?.name || nutritionCategory.name) : 'N/A'}`);
  console.log(`   Autor: ${author ? (author.attributes?.name || author.name) : 'N/A'}`);
  
  // Verificar
  const verify = await fetchAPI(`/api/articles/${articleId}?populate[tags]=*&populate[categories]=*&populate[author]=*`);
  console.log('\n📊 Verificación:');
  console.log(`   Tags en artículo: ${verify.data?.attributes?.tags?.data?.length || 0}`);
  console.log(`   Categorías: ${verify.data?.attributes?.categories?.data?.length || 0}`);
  console.log(`   Autor: ${verify.data?.attributes?.author?.data ? 'Sí' : 'No'}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
}


