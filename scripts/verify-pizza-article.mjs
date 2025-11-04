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

const result = await fetchAPI('/api/articles?filters[slug][$eq]=receta-de-pizza-fit');
const article = result.data?.[0];

if (article) {
  console.log('✅ Artículo encontrado:');
  console.log('Título:', article.attributes?.title || article.title);
  console.log('Slug:', article.attributes?.slug || article.slug);
  console.log('Tags:', article.attributes?.tags?.data?.length || 0);
  console.log('Categorías:', article.attributes?.categories?.data?.length || 0);
  console.log('Autor:', article.attributes?.author?.data?.attributes?.name || 'Sin autor');
  console.log('Publicado:', article.attributes?.publishedAt ? 'Sí' : 'No (Borrador)');
} else {
  console.log('❌ Artículo no encontrado');
}


