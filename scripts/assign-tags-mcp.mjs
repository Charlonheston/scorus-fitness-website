import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
config({ path: join(rootDir, '.env.local') });
config({ path: join(rootDir, '.env') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || process.env.PUBLIC_STRAPI_API_TOKEN || '';

async function fetchStrapi(endpoint, options = {}) {
  const url = `${STRAPI_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (STRAPI_API_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}

async function main() {
  console.log('Obteniendo datos...\n');
  
  // Obtener tags
  const tagsRes = await fetchStrapi('/api/tags?pagination[pageSize]=100');
  const tags = tagsRes.data || [];
  console.log(`Tags: ${tags.length}`);
  
  // Obtener artículos
  const articlesRes = await fetchStrapi('/api/articles?pagination[pageSize]=100&populate[tags]=*');
  const articles = articlesRes.data || [];
  console.log(`Artículos: ${articles.length}\n`);
  
  // Analizar y asignar
  for (const article of articles) {
    const articleId = article.id;
    const title = article.attributes?.title || article.title || 'Sin título';
    const existingTagIds = (article.attributes?.tags?.data || article.tags?.data || []).map(t => t.id);
    
    const text = `${article.attributes?.title || article.title || ''} ${article.attributes?.excerpt || article.excerpt || ''}`.toLowerCase();
    
    const relevantTagIds = [];
    for (const tag of tags) {
      const tagId = tag.id;
      const tagName = (tag.attributes?.name || tag.name || '').toLowerCase();
      if (existingTagIds.includes(tagId)) continue;
      const words = tagName.split(/\s+/).filter(w => w.length > 3);
      if (words.some(w => text.includes(w))) relevantTagIds.push(tagId);
    }
    
    if (relevantTagIds.length === 0) {
      console.log(`⏭️  ${title} - Sin tags nuevas`);
      continue;
    }
    
    const allTagIds = [...new Set([...existingTagIds, ...relevantTagIds])];
    
    try {
      await fetchStrapi(`/api/articles/${articleId}`, {
        method: 'PUT',
        body: JSON.stringify({ data: { tags: allTagIds } })
      });
      console.log(`✅ ${title} - +${relevantTagIds.length} tags`);
    } catch (e) {
      console.log(`❌ ${title} - Error: ${e.message}`);
    }
  }
}

main();


