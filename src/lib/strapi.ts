/**
 * Utilidades para consumir la API de Strapi
 */

// En Astro, las variables sin PUBLIC_ solo están disponibles en el servidor
const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN || import.meta.env.PUBLIC_STRAPI_API_TOKEN || '';

// Debug inicial
console.log('🔧 Strapi Config:', {
  url: STRAPI_URL,
  hasToken: !!STRAPI_API_TOKEN,
  tokenLength: STRAPI_API_TOKEN?.length || 0,
  envKeys: Object.keys(import.meta.env).filter(k => k.includes('STRAPI'))
});

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

export interface StrapiMedia {
  id: number;
  attributes: {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
  };
}

export interface StrapiCategory {
  id: number;
  attributes: {
    name: string;
    slug: string;
    icon?: string;
    color?: string;
  };
}

export interface StrapiTag {
  id: number;
  attributes: {
    name: string;
    slug: string;
  };
}

export interface StrapiAuthor {
  id: number;
  attributes: {
    name: string;
    title?: string;
    avatar?: StrapiMedia;
    bio?: string;
    socialLinks?: Array<{
      url: string;
      platform: string;
    }>;
  };
}

export interface StrapiArticle {
  id: number;
  attributes: {
    title: string;
    slug: string;
    date?: string;
    content: string | StrapiBlock[]; // Puede ser HTML string o Blocks array
    excerpt?: string;
    imgUrl?: StrapiMedia | null;
    imageAlt?: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    locale?: string;
    categories?: {
      data: StrapiCategory[];
    };
    tags?: {
      data: StrapiTag[];
    };
    author?: {
      data: StrapiAuthor | null;
    };
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
export function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Debug: Verificar token
  console.log('🔑 Token check:', {
    hasToken: !!STRAPI_API_TOKEN,
    tokenLength: STRAPI_API_TOKEN?.length || 0,
    tokenPreview: STRAPI_API_TOKEN ? STRAPI_API_TOKEN.substring(0, 20) + '...' : 'NO TOKEN',
    strapiUrl: STRAPI_URL
  });

  if (STRAPI_API_TOKEN) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
  } else {
    console.warn('⚠️ No API token found! Make sure STRAPI_API_TOKEN is set in .env');
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
    // Si tenemos token, usar 'preview' para incluir todos los artículos (incluso con publishedAt null)
    // Si no hay token, 'live' solo incluye artículos con publishedAt establecido
    if (STRAPI_API_TOKEN) {
      url.searchParams.append('publicationState', 'preview');
    } else {
      url.searchParams.append('publicationState', 'live');
    }
    // Populate todas las relaciones - Strapi v5 syntax
    // Intentar primero con populate[0]=* que funciona para relaciones básicas
    url.searchParams.append('populate[0]', 'imgUrl');
    url.searchParams.append('populate[1]', 'categories');
    url.searchParams.append('populate[2]', 'tags');
  url.searchParams.append('populate[3]', 'author');
  url.searchParams.append('populate[4]', 'author.avatar');
  url.searchParams.append('populate[5]', 'author.socialLinks');

    const headers = getHeaders();
    const authHeader = (headers as Record<string, string>)['Authorization'] || '';
    console.log('📡 Fetching:', {
      url: url.toString(),
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader ? authHeader.substring(0, 30) + '...' : 'No auth'
    });

    const response = await fetch(url.toString(), {
      headers: headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        headersSent: Object.keys(headers),
        errorBody: errorText
      });
      throw new Error(`Error fetching articles: ${response.status} ${response.statusText}`);
    }

    const data: StrapiResponse<StrapiArticle[]> = await response.json();
    
    // Debug: Ver qué devuelve la API
    console.log('🔍 Strapi API Response sample:', JSON.stringify(data.data?.[0] || {}, null, 2));
    console.log('📊 Articles count:', data.data?.length || 0);
    
    // Filtrar artículos inválidos y convertir content a string
    // Strapi v5 puede devolver datos con o sin 'attributes'
    const validArticles = (data.data || [])
      .filter((article: any) => {
        // Soporte para ambos formatos: con attributes y sin attributes (Strapi v5)
        const attrs = article.attributes || article;
        const isValid = article && (attrs.title || article.title) && (attrs.slug || article.slug);
        
        if (!isValid) {
          console.warn('⚠️ Invalid article filtered out:', {
            id: article.id,
            hasAttributes: !!article.attributes,
            hasTitle: !!(attrs.title || article.title),
            hasSlug: !!(attrs.slug || article.slug)
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
        
        const title = attrs.title || article.title;
        const slug = attrs.slug || article.slug;
        
        console.log(`📝 Article "${title}":`, {
          contentType: isBlocks ? 'Blocks' : isString ? 'String' : typeof contentValue,
          contentPreview: isString ? contentValue.substring(0, 50) : 'Array',
          structure: article.attributes ? 'with attributes' : 'flat structure'
        });
        
            // Normalizar a formato con attributes incluyendo relaciones
        // Manejar relaciones que pueden venir en diferentes formatos
        let categories = attrs.categories || article.categories;
        if (categories && !categories.data) {
          // Si categories existe pero no tiene data, puede ser que sea un array directo
          categories = Array.isArray(categories) ? { data: categories } : categories;
        }
        
        let tags = attrs.tags || article.tags;
        if (tags && !tags.data) {
          tags = Array.isArray(tags) ? { data: tags } : tags;
        }
        
        let author = attrs.author || article.author;
        if (author && !author.data && author.id) {
          // Si author existe como objeto directo sin wrapper data
          author = { data: author };
        }
        
        // Normalizar socialLinks del autor si existe
        if (author?.data) {
          const authorData = author.data;
          const authorAttrs = authorData.attributes || authorData;
          let socialLinks = authorAttrs.socialLinks || authorAttrs.social_links;
          
          if (socialLinks && socialLinks.data) {
            socialLinks = socialLinks.data;
          }
          
          if (authorData.attributes) {
            authorData.attributes.socialLinks = socialLinks || [];
          } else {
            authorData.socialLinks = socialLinks || [];
          }
        } else if (author && author.attributes) {
          let socialLinks = author.attributes.socialLinks || author.attributes.social_links;
          if (socialLinks && socialLinks.data) {
            socialLinks = socialLinks.data;
          }
          author.attributes.socialLinks = socialLinks || [];
        }
        
        // Normalizar imgUrl - puede venir como { data: { attributes: { url: ... } } } o null
        let imgUrl = attrs.imgUrl || article.imgUrl;
        if (imgUrl && !imgUrl.data && imgUrl.attributes) {
          // Si viene como objeto directo con attributes, envolver en data
          imgUrl = { data: imgUrl };
        }
        
        return {
          id: article.id || article.documentId,
          attributes: {
            title,
            slug,
            date: attrs.date || article.date,
            content: isString ? contentValue : blocksToText(contentValue as StrapiBlock[]),
            excerpt: attrs.excerpt || article.excerpt,
            imgUrl: imgUrl || null,
            imageAlt: attrs.imageAlt || article.imageAlt,
            createdAt: attrs.createdAt || article.createdAt || '',
            updatedAt: attrs.updatedAt || article.updatedAt || '',
            publishedAt: attrs.publishedAt || article.publishedAt,
            locale: attrs.locale || article.locale,
            categories: categories || { data: [] },
            tags: tags || { data: [] },
            author: author || null,
          },
        };
      });
    
    console.log(`✅ Valid articles after filtering: ${validArticles.length}`);
    
    return validArticles;
  } catch (error) {
    console.error('Error fetching articles from Strapi:', error);
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
    // Populate todas las relaciones - Strapi v5 syntax
    url.searchParams.append('populate[0]', 'imgUrl');
    url.searchParams.append('populate[1]', 'categories');
    url.searchParams.append('populate[2]', 'tags');
  url.searchParams.append('populate[3]', 'author');
  url.searchParams.append('populate[4]', 'author.avatar');
  url.searchParams.append('populate[5]', 'author.socialLinks');

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

    // Normalizar relaciones - igual que en getArticles
    let categories = attrs.categories || article.categories;
    if (categories && !categories.data) {
      categories = Array.isArray(categories) ? { data: categories } : categories;
    }
    
    let tags = attrs.tags || article.tags;
    if (tags && !tags.data) {
      tags = Array.isArray(tags) ? { data: tags } : tags;
    }
    
    let author = attrs.author || article.author;
    if (author && !author.data && author.id) {
      author = { data: author };
    }
    
    // Normalizar socialLinks del autor si existe
    if (author?.data) {
      const authorData = author.data;
      const authorAttrs = authorData.attributes || authorData;
      let socialLinks = authorAttrs.socialLinks || authorAttrs.social_links;
      
      if (socialLinks && socialLinks.data) {
        socialLinks = socialLinks.data;
      }
      
      if (authorData.attributes) {
        authorData.attributes.socialLinks = socialLinks || [];
      } else {
        authorData.socialLinks = socialLinks || [];
      }
    } else if (author && author.attributes) {
      let socialLinks = author.attributes.socialLinks || author.attributes.social_links;
      if (socialLinks && socialLinks.data) {
        socialLinks = socialLinks.data;
      }
      author.attributes.socialLinks = socialLinks || [];
    }
    
    // Normalizar imgUrl - puede venir como { data: { attributes: { url: ... } } } o null
    let imgUrl = attrs.imgUrl || article.imgUrl;
    if (imgUrl && !imgUrl.data && imgUrl.attributes) {
      // Si viene como objeto directo con attributes, envolver en data
      imgUrl = { data: imgUrl };
    }

    // Normalizar a formato con attributes incluyendo relaciones
    return {
      id: article.id || article.documentId,
      attributes: {
        title: attrs.title || article.title,
        slug: attrs.slug || article.slug,
        date: attrs.date || article.date,
        content: isString ? contentValue : blocksToText(contentValue as StrapiBlock[]),
        excerpt: attrs.excerpt || article.excerpt,
        imgUrl: imgUrl || null,
        imageAlt: attrs.imageAlt || article.imageAlt,
        createdAt: attrs.createdAt || article.createdAt || '',
        updatedAt: attrs.updatedAt || article.updatedAt || '',
        publishedAt: attrs.publishedAt || article.publishedAt,
        locale: attrs.locale || article.locale,
        categories: categories || { data: [] },
        tags: tags || { data: [] },
        author: author || null,
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
    // Populate todas las relaciones - Strapi v5 syntax
    url.searchParams.append('populate[0]', 'imgUrl');
    url.searchParams.append('populate[1]', 'categories');
    url.searchParams.append('populate[2]', 'tags');
  url.searchParams.append('populate[3]', 'author');
  url.searchParams.append('populate[4]', 'author.avatar');
  url.searchParams.append('populate[5]', 'author.socialLinks');

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

    // Normalizar relaciones
    let categories = attrs.categories || article.categories;
    if (categories && !categories.data) {
      categories = Array.isArray(categories) ? { data: categories } : categories;
    }
    
    let tags = attrs.tags || article.tags;
    if (tags && !tags.data) {
      tags = Array.isArray(tags) ? { data: tags } : tags;
    }
    
    let author = attrs.author || article.author;
    if (author && !author.data && author.id) {
      author = { data: author };
    }
    
    // Normalizar socialLinks del autor si existe
    if (author?.data) {
      const authorData = author.data;
      const authorAttrs = authorData.attributes || authorData;
      let socialLinks = authorAttrs.socialLinks || authorAttrs.social_links;
      
      if (socialLinks && socialLinks.data) {
        socialLinks = socialLinks.data;
      }
      
      if (authorData.attributes) {
        authorData.attributes.socialLinks = socialLinks || [];
      } else {
        authorData.socialLinks = socialLinks || [];
      }
    } else if (author && author.attributes) {
      let socialLinks = author.attributes.socialLinks || author.attributes.social_links;
      if (socialLinks && socialLinks.data) {
        socialLinks = socialLinks.data;
      }
      author.attributes.socialLinks = socialLinks || [];
    }
    
    // Normalizar imgUrl
    let imgUrl = attrs.imgUrl || article.imgUrl;
    if (imgUrl && !imgUrl.data && imgUrl.attributes) {
      imgUrl = { data: imgUrl };
    }

    // Normalizar a formato con attributes incluyendo relaciones
    return {
      id: article.id || article.documentId,
      attributes: {
        title: attrs.title || article.title,
        slug: attrs.slug || article.slug,
        date: attrs.date || article.date,
        content: isString ? contentValue : blocksToText(contentValue as StrapiBlock[]),
        excerpt: attrs.excerpt || article.excerpt,
        imgUrl: imgUrl || null,
        imageAlt: attrs.imageAlt || article.imageAlt,
        createdAt: attrs.createdAt || article.createdAt || '',
        updatedAt: attrs.updatedAt || article.updatedAt || '',
        publishedAt: attrs.publishedAt || article.publishedAt,
        locale: attrs.locale || article.locale,
        categories: categories || { data: [] },
        tags: tags || { data: [] },
        author: author || null,
      },
    };
  } catch (error) {
    console.error('Error fetching article from Strapi:', error);
    return null;
  }
}

