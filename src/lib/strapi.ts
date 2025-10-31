/**
 * Utilidades para consumir la API de Strapi
 */

// En Astro, las variables sin PUBLIC_ solo están disponibles en el servidor
const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN || import.meta.env.PUBLIC_STRAPI_API_TOKEN || '';

// Debug inicial (solo en desarrollo)
if (import.meta.env.DEV) {
  console.log('🔧 Strapi Config:', {
    url: STRAPI_URL,
    hasToken: !!STRAPI_API_TOKEN,
    tokenLength: STRAPI_API_TOKEN?.length || 0,
    envKeys: Object.keys(import.meta.env).filter(k => k.includes('STRAPI'))
  });
}

/**
 * Tipos para la respuesta de Strapi
 */

// Tipo para Blocks (Rich Text)
export type StrapiBlock = {
  type: string;
  children?: StrapiBlock[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  [key: string]: any;
};

export interface StrapiArticle {
  id: number;
  attributes: {
    title: string;
    slug: string;
    content: string | StrapiBlock[]; // Puede ser HTML string o Blocks array
    publishedAt?: string; // Opcional - Strapi lo añade automáticamente si el contenido está publicado
    createdAt: string;
    updatedAt: string;
    locale?: string;
    localizations?: {
      data: StrapiArticle[];
    };
  };
}

export interface StrapiResponse<T> {
  data: T;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

/**
 * Headers para las requests a Strapi
 */
function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Debug: Verificar token (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log('🔑 Token check:', {
      hasToken: !!STRAPI_API_TOKEN,
      tokenLength: STRAPI_API_TOKEN?.length || 0,
      tokenPreview: STRAPI_API_TOKEN ? STRAPI_API_TOKEN.substring(0, 20) + '...' : 'NO TOKEN',
      strapiUrl: STRAPI_URL
    });
  }

  if (STRAPI_API_TOKEN) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  } else {
    // Solo mostrar warning en desarrollo, en producción puede usar permisos públicos
    if (import.meta.env.DEV) {
      console.warn('⚠️ No API token found! Make sure STRAPI_API_TOKEN is set in .env');
    }
  }

  return headers;
}

/**
 * Convierte Blocks de Strapi a texto plano o HTML
 */
function blocksToText(blocks: StrapiBlock[] | string | undefined): string {
  if (!blocks) return '';
  if (typeof blocks === 'string') return blocks;
  
  let text = '';
  for (const block of blocks) {
    if (block.text) {
      text += block.text;
    }
    if (block.children) {
      text += blocksToText(block.children);
    }
  }
  return text.trim();
}

/**
 * Obtiene todos los artículos del blog
 */
export async function getArticles(locale: string = 'es'): Promise<StrapiArticle[]> {
  try {
    const url = new URL(`${STRAPI_URL}/api/articles`);
    url.searchParams.append('locale', locale);
    // Ordenar por createdAt en lugar de publishedAt (ya que publishedAt puede no existir)
    url.searchParams.append('sort', 'createdAt:desc');
    url.searchParams.append('pagination[pageSize]', '100');

    const headers = getHeaders();
    const authHeader = (headers as Record<string, string>)['Authorization'] || '';
    
    if (import.meta.env.DEV) {
      console.log('📡 Fetching:', {
        url: url.toString(),
        hasAuthHeader: !!authHeader,
        authHeaderPreview: authHeader ? authHeader.substring(0, 30) + '...' : 'No auth'
      });
    }

    const response = await fetch(url.toString(), {
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { raw: errorText };
      }
      
      // Log siempre en producción si hay error
      console.error('❌ Strapi API Error:', {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        hasAuthHeader: !!authHeader,
        error: errorJson,
        env: {
          strapiUrl: STRAPI_URL,
          hasToken: !!STRAPI_API_TOKEN,
          isProd: import.meta.env.PROD
        }
      });
      
      // Si es 401, dar más información
      if (response.status === 401) {
        console.error('🔐 401 Unauthorized - Verifica:', {
          '1. Token en Vercel': 'Settings → Environment Variables → STRAPI_API_TOKEN',
          '2. Permisos en Strapi': 'Settings → Users & Permissions → Roles → Public → Article → find',
          '3. API Token válido': 'Settings → API Tokens → Verificar que existe y tiene permisos'
        });
      }
      
      throw new Error(`Error fetching articles: ${response.status} ${response.statusText}`);
    }

    const data: StrapiResponse<StrapiArticle[]> = await response.json();
    
    // Debug: Ver qué devuelve la API
    if (import.meta.env.DEV) {
      console.log('🔍 Strapi API Response sample:', JSON.stringify(data.data?.[0] || {}, null, 2));
      console.log('📊 Articles count:', data.data?.length || 0);
      console.log('🔍 Full response structure:', {
        hasData: !!data.data,
        dataType: Array.isArray(data.data) ? 'array' : typeof data.data,
        firstItemStructure: data.data?.[0] ? {
          hasId: !!data.data[0].id,
          hasAttributes: !!data.data[0].attributes,
          keys: Object.keys(data.data[0] || {})
        } : null
      });
    }
    
    // En producción, log mínimo si hay problemas
    if (import.meta.env.PROD && (!data.data || data.data.length === 0)) {
      console.warn('⚠️ No articles found in production. Response structure:', {
        hasData: !!data.data,
        dataType: typeof data.data,
        error: (data as any).error,
        meta: (data as any).meta
      });
    }
    
    // Filtrar artículos inválidos y convertir content a string
    // Strapi v5 puede devolver datos con o sin 'attributes'
    const validArticles = (data.data || [])
      .filter((article: any) => {
        // Soporte para ambos formatos: con attributes y sin attributes (Strapi v5)
        const attrs = article.attributes || article;
        const hasTitle = !!(attrs?.title || article?.title);
        const hasSlug = !!(attrs?.slug || article?.slug);
        const isValid = article && hasTitle && hasSlug;
        
        if (!isValid && import.meta.env.DEV) {
          console.warn('⚠️ Invalid article filtered out:', {
            id: article?.id || article?.documentId,
            hasAttributes: !!article?.attributes,
            hasTitle,
            hasSlug,
            articleKeys: Object.keys(article || {})
          });
        }
        return isValid;
      })
      .map((article: any) => {
        // Normalizar estructura: siempre usar formato con attributes
        const attrs = article.attributes || article;
        const contentValue = attrs.content || article.content;
        const isBlocks = Array.isArray(contentValue);
        const isString = typeof contentValue === 'string';
        
        const title = attrs?.title || article?.title;
        const slug = attrs?.slug || article?.slug;
        
        if (import.meta.env.DEV) {
          console.log(`📝 Article "${title}":`, {
            contentType: isBlocks ? 'Blocks' : isString ? 'String' : typeof contentValue,
            contentPreview: isString ? contentValue.substring(0, 50) : 'Array',
            structure: article.attributes ? 'with attributes' : 'flat structure'
          });
        }
        
        // Normalizar a formato con attributes
        return {
          id: article.id || article.documentId,
          attributes: {
            title,
            slug,
            content: isString ? contentValue : blocksToText(contentValue as StrapiBlock[]),
            createdAt: attrs.createdAt || article.createdAt || '',
            updatedAt: attrs.updatedAt || article.updatedAt || '',
            publishedAt: attrs.publishedAt || article.publishedAt,
            locale: attrs.locale || article.locale,
          },
        };
      });
    
    if (import.meta.env.DEV) {
      console.log(`✅ Valid articles after filtering: ${validArticles.length}`);
    }
    
    return validArticles;
  } catch (error) {
    // Log detallado del error (siempre visible)
    console.error('❌ Error fetching articles from Strapi:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        strapiUrl: STRAPI_URL,
        hasToken: !!STRAPI_API_TOKEN,
        isProd: import.meta.env.PROD
      }
    });
    return [];
  }
}

/**
 * Obtiene un artículo específico por slug
 */
export async function getArticleBySlug(
  slug: string,
  locale: string = 'es'
): Promise<StrapiArticle | null> {
  try {
    const url = new URL(`${STRAPI_URL}/api/articles`);
    url.searchParams.append('locale', locale);
    url.searchParams.append('filters[slug][$eq]', slug);

    const response = await fetch(url.toString(), {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error fetching article: ${response.statusText}`);
    }

    const data: StrapiResponse<StrapiArticle[]> = await response.json();
    const article: any = data.data?.[0];
    
    if (!article) {
      return null;
    }

    // Soporte para ambos formatos: con attributes y sin attributes
    const attrs = article.attributes || article;
    const contentValue = attrs.content || article.content;
    const isString = typeof contentValue === 'string';

    // Normalizar a formato con attributes
    return {
      id: article.id || article.documentId,
      attributes: {
        title: attrs.title || article.title,
        slug: attrs.slug || article.slug,
        content: isString ? contentValue : blocksToText(contentValue as StrapiBlock[]),
        createdAt: attrs.createdAt || article.createdAt || '',
        updatedAt: attrs.updatedAt || article.updatedAt || '',
        publishedAt: attrs.publishedAt || article.publishedAt,
        locale: attrs.locale || article.locale,
      },
    };
  } catch (error) {
    console.error('Error fetching article from Strapi:', error);
    return null;
  }
}

/**
 * Obtiene un artículo específico por ID
 */
export async function getArticleById(
  id: number,
  locale: string = 'es'
): Promise<StrapiArticle | null> {
  try {
    const url = new URL(`${STRAPI_URL}/api/articles/${id}`);
    url.searchParams.append('locale', locale);

    const response = await fetch(url.toString(), {
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error fetching article: ${response.statusText}`);
    }

    const data: StrapiResponse<StrapiArticle> = await response.json();
    const article: any = data.data;
    
    if (!article) {
      return null;
    }

    // Soporte para ambos formatos: con attributes y sin attributes
    const attrs = article.attributes || article;
    const contentValue = attrs.content || article.content;
    const isString = typeof contentValue === 'string';

    // Normalizar a formato con attributes
    return {
      id: article.id || article.documentId,
      attributes: {
        title: attrs.title || article.title,
        slug: attrs.slug || article.slug,
        content: isString ? contentValue : blocksToText(contentValue as StrapiBlock[]),
        createdAt: attrs.createdAt || article.createdAt || '',
        updatedAt: attrs.updatedAt || article.updatedAt || '',
        publishedAt: attrs.publishedAt || article.publishedAt,
        locale: attrs.locale || article.locale,
      },
    };
  } catch (error) {
    console.error('Error fetching article from Strapi:', error);
    return null;
  }
}

