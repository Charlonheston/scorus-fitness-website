import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env.local') });

const STRAPI_URL = process.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const ADMIN_EMAIL = 'carloscastaner86@gmail.com';
const ADMIN_PASSWORD = '48364560Ecarlos';

let adminToken = null;

async function loginAdmin() {
  console.log('🔐 Autenticando como Admin...');
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    })
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Login failed: ${res.status} - ${text.substring(0, 200)}`);
  }
  
  const data = await res.json();
  adminToken = data.data?.token;
  console.log('✅ Autenticado correctamente\n');
  return adminToken;
}

async function fetchAPI(endpoint, method = 'GET', body = null, useAdmin = false) {
  const token = useAdmin ? adminToken : (process.env.STRAPI_API_TOKEN || '');
  const res = await fetch(`${STRAPI_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    },
    ...(body && { body: JSON.stringify(body) })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.substring(0, 500)}`);
  }
  return res.json();
}

async function main() {
  console.log('🚀 Creando localizaciones VINCULADAS usando Admin API...\n');
  
  // 1. Autenticar como admin
  await loginAdmin();
  
  // 2. Buscar artículo original
  console.log('📋 Buscando artículo original...');
  let spanishArticle;
  try {
    const articles = await fetchAPI(`/api/articles?locale=es&filters[title][$contains]=${encodeURIComponent('10 Alimentos')}`);
    if (!articles.data || articles.data.length === 0) {
      console.error('❌ No se encontró el artículo');
      return;
    }
    spanishArticle = articles.data[0];
  } catch (e) {
    console.error('❌ Error obteniendo artículo:', e.message);
    return;
  }
  
  const articleId = spanishArticle.id;
  const documentId = spanishArticle.documentId;
  const attrs = spanishArticle.attributes || spanishArticle;
  
  console.log(`✅ Artículo: "${attrs.title}"`);
  console.log(`   ID: ${articleId}, DocumentID: ${documentId}\n`);
  
  // 3. Traducciones
  const translations = {
    en: { 
      title: '10 Foods You Didn\'t Know Have Protein', 
      slug: '10-foods-you-didnt-know-have-protein', 
      excerpt: 'Discover surprising sources of protein in everyday foods that can help you reach your daily protein goals.' 
    },
    fr: { 
      title: '10 Aliments que vous ne saviez pas contenaient des protéines', 
      slug: '10-aliments-proteines-insoupconnes', 
      excerpt: 'Découvrez des sources surprenantes de protéines dans les aliments quotidiens qui peuvent vous aider à atteindre vos objectifs protéiques quotidiens.' 
    },
    de: { 
      title: '10 Lebensmittel, von denen Sie nicht wussten, dass sie Protein enthalten', 
      slug: '10-lebensmittel-mit-protein', 
      excerpt: 'Entdecken Sie überraschende Proteinquellen in alltäglichen Lebensmitteln, die Ihnen helfen können, Ihre täglichen Proteinziele zu erreichen.' 
    },
    hu: { 
      title: '10 étel, amiről nem tudtad, hogy fehérjét tartalmaz', 
      slug: '10-feherjetartalmu-etel', 
      excerpt: 'Fedezz fel meglepő fehérjeforrásokat mindennapi ételekben, amelyek segíthetnek elérni a napi fehérjecéljaidat.' 
    }
  };
  
  // 4. Crear localizaciones usando el endpoint del Content Manager con token de admin
  console.log('📝 Creando localizaciones vinculadas...\n');
  
  for (const [locale, trans] of Object.entries(translations)) {
    console.log(`🌍 ${locale.toUpperCase()}...`);
    
    // Verificar si ya existe vinculada
    try {
      const existing = await fetchAPI(`/api/articles?filters[documentId][$eq]=${documentId}&locale=${locale}`, 'GET', null, true);
      if (existing.data && existing.data.length > 0) {
        console.log(`   ✅ Ya existe y está vinculada`);
        continue;
      }
    } catch (e) {}
    
    try {
      const localizationData = {
        locale: locale,
        title: trans.title,
        slug: trans.slug,
        excerpt: trans.excerpt,
        content: attrs.content || '',
        date: attrs.date || new Date().toISOString().split('T')[0],
        imageAlt: attrs.imageAlt || '',
        publishedAt: null,
      };
      
      // Usar el endpoint del Content Manager con token de admin
      const result = await fetchAPI(
        `/api/content-manager/collection-types/api::article.article/${articleId}/actions/localize`,
        'POST',
        { data: localizationData },
        true // usar token de admin
      );
      
      console.log(`   ✅ Localización creada y VINCULADA`);
      if (result.data?.documentId) {
        console.log(`   📋 DocumentID: ${result.data.documentId} (debe coincidir: ${documentId})`);
      }
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message.substring(0, 300)}`);
      
      // Si falla, mostrar información de depuración
      if (error.message.includes('405')) {
        console.log(`   ⚠️  El endpoint /actions/localize no está disponible`);
        console.log(`   💡 Intentando método alternativo con documentId...`);
        
        // Último recurso: crear con el mismo documentId especificado
        try {
          const newArticle = await fetchAPI(`/api/articles`, 'POST', {
            data: {
              locale: locale,
              title: trans.title,
              slug: trans.slug,
              excerpt: trans.excerpt,
              content: attrs.content || '',
              date: attrs.date || new Date().toISOString().split('T')[0],
              imageAlt: attrs.imageAlt || '',
              publishedAt: null,
              documentId: documentId, // Intentar forzar el mismo documentId
            }
          }, true);
          console.log(`   ✅ Artículo creado con documentId forzado`);
        } catch (e3) {
          console.error(`   ❌ Error final: ${e3.message.substring(0, 200)}`);
        }
      }
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log('\n✅ Proceso completado');
  console.log('\n🔍 Verificando localizaciones...');
  
  // Verificar que todas están vinculadas (usar token de API normal)
  try {
    const apiToken = process.env.STRAPI_API_TOKEN || '';
    const res = await fetch(`${STRAPI_URL}/api/articles?filters[documentId][$eq]=${documentId}`, {
      headers: { 'Authorization': `Bearer ${apiToken}` }
    });
    const allLocalizations = await res.json();
    console.log(`\n📊 Total de localizaciones vinculadas: ${allLocalizations.data?.length || 0}`);
    if (allLocalizations.data) {
      allLocalizations.data.forEach(art => {
        const title = art.attributes?.title || art.title || 'N/A';
        const docId = art.documentId;
        const isLinked = docId === documentId;
        console.log(`   ${isLinked ? '✅' : '❌'} ${art.locale || art.attributes?.locale || 'N/A'}: "${title}" (ID: ${art.id}, DocID: ${docId})`);
      });
    }
  } catch (e) {
    console.error('Error verificando:', e.message);
  }
}

main().catch(console.error);

