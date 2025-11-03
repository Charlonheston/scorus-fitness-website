/**
 * Script para conectar tags a un artículo en Strapi
 * Uso: node connect-tags.js
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
  const envContent = readFileSync(join(__dirname, '.env'), 'utf-8');
  const lines = envContent.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('STRAPI_API_TOKEN=')) {
      STRAPI_API_TOKEN = trimmed.replace('STRAPI_API_TOKEN=', '').replace(/^["']|["']$/g, '').trim();
    }
    if (trimmed.startsWith('STRAPI_URL=')) {
      STRAPI_URL = trimmed.replace('STRAPI_URL=', '').replace(/^["']|["']$/g, '').trim();
    }
  }
} catch (error) {
  console.warn('⚠️ No se pudo leer .env, usando variables de entorno');
  STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '';
  STRAPI_URL = process.env.STRAPI_URL || 'https://scorus-cms-strapi.onrender.com';
}

// Si aún no hay token, intentar leer desde PUBLIC_STRAPI_API_TOKEN
if (!STRAPI_API_TOKEN) {
  STRAPI_API_TOKEN = process.env.PUBLIC_STRAPI_API_TOKEN || '';
}

if (!STRAPI_API_TOKEN) {
  console.error('❌ Error: STRAPI_API_TOKEN no encontrado en las variables de entorno');
  process.exit(1);
}

const articleId = 20;
const tagIds = [222, 223, 226, 250];

async function connectTags() {
  console.log('🔄 Conectando tags al artículo...');
  console.log(`📝 Artículo ID: ${articleId}`);
  console.log(`🏷️ Tags IDs: ${tagIds.join(', ')}`);
  console.log(`🔑 Token preview: ${STRAPI_API_TOKEN.substring(0, 20)}...`);

  const url = `${STRAPI_URL}/api/articles/${articleId}`;
  
  // Intentar diferentes formatos de Strapi v5 para relaciones
  // Formato 1: connect con id
  const body1 = {
    data: {
      tags: {
        connect: tagIds.map(id => ({ id }))
      }
    }
  };

  // Formato 2: array directo de IDs
  const body2 = {
    data: {
      tags: tagIds
    }
  };

  // Formato 3: connect con documentId
  const body3 = {
    data: {
      tags: {
        connect: tagIds.map(id => ({ id, __type: 'api::tag.tag' }))
      }
    }
  };

  // Probar primero con body1 (formato estándar)
  let body = body1;
  console.log('\n📋 Intentando con formato connect...');

  console.log('\n📤 Enviando request:', {
    url,
    method: 'PUT'
  });

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error con formato connect:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      // Si es 400, puede ser formato incorrecto, probar formato alternativo
      if (response.status === 400) {
        console.log('\n📋 Intentando con formato array directo...');
        const response2 = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`
          },
          body: JSON.stringify(body2)
        });
        
        if (!response2.ok) {
          const errorText2 = await response2.text();
          console.error('❌ Error con formato array:', errorText2);
          throw new Error(`HTTP ${response2.status}: ${errorText2}`);
        }
        console.log('✅ Tags conectados con formato array!');
      } else {
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    }

    const result = await response.json();
    console.log('\n✅ Tags conectados exitosamente!');

    // Verificar que los tags se conectaron
    console.log('\n🔍 Verificando tags conectados...');
    const verifyUrl = `${STRAPI_URL}/api/articles/${articleId}?populate[tags]=*`;
    const verifyResponse = await fetch(verifyUrl, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      }
    });

    if (verifyResponse.ok) {
      const article = await verifyResponse.json();
      const tags = article.data?.attributes?.tags?.data || article.data?.tags?.data || [];
      console.log(`✅ Tags conectados: ${tags.length}`);
      tags.forEach(tag => {
        console.log(`   - ${tag.attributes?.name || tag.name} (ID: ${tag.id})`);
      });
    } else {
      console.warn('⚠️ No se pudo verificar los tags');
    }

  } catch (error) {
    console.error('❌ Error conectando tags:', error.message);
    process.exit(1);
  }
}

connectTags();
