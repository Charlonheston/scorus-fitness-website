import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const STRAPI_URL = (process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337').trim().replace(/\/$/, '');
const AUTH_TOKEN = (process.env.STRAPI_API_TOKEN || '').trim();

async function fetchAPI(endpoint) {
  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {})
    }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json();
}

function printLocales(items, label) {
  console.log(`\n===== ${label} =====`);
  items.forEach((item) => {
    const attrs = item.attributes || item;
    const locales = [attrs];
    if (attrs.localizations?.data) {
      attrs.localizations.data.forEach((loc) => locales.push(loc.attributes));
    }
    locales.forEach((loc) => {
      const locale = loc.locale;
      const name = loc.name || loc.title || loc.slug;
      const slug = loc.slug || '';
      console.log(`- ${locale}: ${name} (slug: ${slug}) [documentId: ${item.documentId || item.id}]`);
    });
  });
}

console.log(' URL:', STRAPI_URL);
console.log(' Token length:', AUTH_TOKEN.length);

try {
  const categoriesRes = await fetchAPI('/api/categories?locale=all&pagination[pageSize]=100&populate=localizations');
  const tagsRes = await fetchAPI('/api/tags?locale=all&pagination[pageSize]=200&populate=localizations');

  printLocales(categoriesRes.data || [], 'Categorías');
  printLocales(tagsRes.data || [], 'Tags');
} catch (error) {
  console.error(' Error:', error.message);
}
