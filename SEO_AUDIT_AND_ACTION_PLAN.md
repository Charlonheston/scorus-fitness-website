# 📊 AUDITORÍA SEO Y PLAN DE ACCIÓN - SCORUS FITNESS

**Fecha:** 8 de noviembre de 2025  
**Sitio Web:** https://scorusfitness.com  
**Framework:** Astro con i18n (ES, EN, FR, DE, HU)

---

## 🎯 RESUMEN EJECUTIVO

### ✅ Puntos Fuertes Actuales
- Schema.org implementado (LocalBusiness, Person, BlogPosting, Service, Breadcrumb)
- Componente SEO reutilizable con Open Graph
- Robots.txt configurado correctamente
- Sitemap configurado en Astro
- Canonical URLs implementados
- Estructura de URLs limpia y semántica
- Contenido multilingüe

### ⚠️ Áreas Críticas de Mejora
1. **Hreflang tags** - NO implementados (CRÍTICO para sitio multilingüe)
2. **Meta descriptions** - Faltan en algunas páginas
3. **Structured Data** - Puede expandirse (FAQPage, VideoObject, Offer)
4. **Twitter Cards** - No implementados
5. **OG Images específicas** - Usar imágenes únicas por página
6. **Alt texts** - Revisar y optimizar todas las imágenes

---

## 📋 AUDITORÍA DETALLADA POR PÁGINA

### 🏠 HOME (`/es/index.astro`)

#### Estado Actual
- ✅ Title: "Scorus Fitness | Entrenamiento Personal en Alicante"
- ✅ Meta Description: Presente
- ✅ H1: Presente
- ✅ Schema.org: LocalBusiness + Person

#### Mejoras Necesarias
1. **Hreflang tags** (CRÍTICO)
   - Implementar para ES, EN, FR, DE, HU
   - Incluir `x-default` para usuarios sin idioma específico

2. **Twitter Cards**
   - Añadir `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`

3. **Schema.org Enhancement**
   - Añadir `aggregateRating` si hay reseñas
   - Incluir más detalles en `LocalBusiness` (priceRange, image, etc.)

4. **OG Image específica**
   - Crear/usar imagen específica de home (actualmente usa genérica)

5. **Meta Keywords**
   - Añadir keywords relevantes (aunque Google no las use, Bing y otros sí)

6. **Alt texts de imágenes**
   - Revisar todas las imágenes hero y CTA

---

### 🏋️ SERVICIOS

#### `/es/servicios/index.astro`

**Estado Actual:**
- ❓ Necesita verificación de meta tags

**Mejoras Necesarias:**
1. **Meta tags completos**
   ```astro
   title="Servicios de Entrenamiento Personal | Scorus Fitness"
   description="Programas personalizados de entrenamiento, consultoría online, talleres y seminarios. Transforma tu cuerpo con Bernat Scorus en Alicante."
   ```

2. **Schema.org: ItemList**
   - Lista estructurada de todos los servicios

3. **Breadcrumbs** (Schema + Visual)
   - Home > Servicios

#### `/es/servicios/entrenamiento-personal.astro`

**Estado Actual:**
- ✅ Title y Description presentes (vía JSON)
- ✅ Estructura clara de precios
- ✅ Jerarquía H1/H2 correcta

**Mejoras Necesarias:**
1. **Schema.org: Offer/AggregateOffer**
   ```json
   {
     "@type": "Service",
     "name": "Entrenamiento Personal",
     "offers": [
       {
         "@type": "Offer",
         "name": "Bono 8 Sesiones",
         "price": "200",
         "priceCurrency": "EUR"
       }
     ]
   }
   ```

2. **FAQPage Schema**
   - Si hay preguntas frecuentes, añadir schema

3. **Hreflang** para todas las localizaciones

#### Otras Subpáginas de Servicios

**Páginas a revisar:**
- `/es/servicios/consultoria-online.astro`
- `/es/servicios/asesoramiento-online.astro`
- `/es/servicios/talleres.astro`
- `/es/servicios/seminarios.astro`
- `/es/servicios/video-cursos.astro`

**Acción:** Verificar que todas tengan:
- ✅ Title único y descriptivo
- ✅ Meta description (150-160 caracteres)
- ✅ H1 optimizado
- ✅ Schema.org Service
- ✅ Hreflang tags
- ✅ Breadcrumbs

---

### 🎓 ACADEMIA

#### `/es/academia/index.astro`

**Estado Actual:**
- ✅ Title: "Academia | Scorus Fitness"
- ✅ Description presente
- ✅ Estructura de programas clara

**Mejoras Necesarias:**
1. **Schema.org: EducationalOrganization**
   ```json
   {
     "@type": "EducationalOrganization",
     "name": "Scorus Academia",
     "description": "...",
     "provider": {
       "@id": "https://scorusfitness.com/#organization"
     }
   }
   ```

2. **Schema.org: Course** (para cada programa)
   ```json
   {
     "@type": "Course",
     "name": "RE-BORN",
     "description": "...",
     "provider": "..."
   }
   ```

3. **Title más descriptivo**
   - Cambiar a: "Scorus Academia | Formación Profesional en Fitness"

4. **Hreflang tags**

#### Subpáginas de Academia
- `/es/academia/seminarios.astro`
- `/es/academia/re-born.astro`

**Acción:** Aplicar mismo análisis que servicios

---

### 🏋️‍♂️ GYM (`/es/gym.astro`)

**Estado Actual:**
- ✅ Title: "Scorus GYM | Entrenamiento en Alicante"
- ✅ Description presente
- ✅ Galería de imágenes

**Mejoras Necesarias:**
1. **ImageGallery Schema**
   ```json
   {
     "@type": "ImageGallery",
     "associatedMedia": [...]
   }
   ```

2. **Alt texts descriptivos**
   - Actualmente: "Scorus Fitness - Vista principal del gimnasio"
   - Mejorar: "Interior del gimnasio boutique Scorus Fitness en Alicante con equipamiento profesional de culturismo"

3. **LocalBusiness Schema específico**
   - Más detallado que el general, con fotos del gym

4. **Video Schema** (si hay videos)

5. **Hreflang tags**

---

### 👤 BIOGRAFÍA (`/es/biografia.astro`)

**Estado Actual:**
- ✅ Title: "Biografía | Bernat Scorus"
- ⚠️ Description muy corta: "De la superación personal a la excelencia en el fitness. Scrollytelling."

**Mejoras Necesarias:**
1. **Meta Description mejorada**
   ```
   "Conoce la historia de Bernat Scorus, culturista profesional y entrenador personal en Alicante. De la superación personal a campeón mundial de culturismo. Más de 15 años transformando vidas."
   ```

2. **Schema.org: Person (expandido)**
   ```json
   {
     "@type": "Person",
     "name": "Bernat Scorus",
     "jobTitle": "Culturista Profesional y Entrenador Personal",
     "description": "...",
     "award": ["Campeón Mundial de Culturismo", ...],
     "alumniOf": "...",
     "knowsAbout": ["Culturismo", "Fitness", "Nutrición Deportiva"]
   }
   ```

3. **VideoObject Schema** (para el video de intro)
   ```json
   {
     "@type": "VideoObject",
     "name": "Historia de Bernat Scorus",
     "description": "...",
     "thumbnailUrl": "...",
     "uploadDate": "..."
   }
   ```

4. **Hreflang tags**

---

### 📝 BLOG

#### `/es/blog/index.astro`

**Estado Actual:**
- ❓ Necesita verificación de meta tags completos

**Mejoras Necesarias:**
1. **Meta tags**
   ```astro
   title="Blog de Fitness y Culturismo | Scorus Fitness"
   description="Artículos sobre entrenamiento, nutrición, suplementación y hábitos saludables. Consejos de Bernat Scorus, culturista profesional."
   ```

2. **Schema.org: Blog**
   ```json
   {
     "@type": "Blog",
     "name": "Scorus Fitness Blog",
     "blogPost": [...]
   }
   ```

3. **Paginación SEO**
   - Si hay múltiples páginas, usar `rel="next"` y `rel="prev"`

4. **Hreflang tags**

#### `/es/blog/[slug].astro`

**Estado Actual:**
- ✅ BlogPosting Schema implementado
- ✅ Meta tags dinámicos
- ✅ Author, publishedDate, modifiedDate

**Mejoras Necesarias:**
1. **Expandir BlogPosting Schema**
   ```json
   {
     "@type": "BlogPosting",
     "headline": "...",
     "wordCount": "...",
     "keywords": ["..."],
     "articleSection": "Nutrición",
     "inLanguage": "es-ES"
   }
   ```

2. **Hreflang para artículos multilingües** (YA IMPLEMENTADO EN PARTE)
   - Verificar que funcione correctamente

3. **JSON-LD para imágenes del artículo**
   ```json
   {
     "@type": "ImageObject",
     "url": "...",
     "caption": "..."
   }
   ```

4. **Tiempo de lectura** (SEO UX)
   - Añadir campo "X min de lectura"

5. **Related Articles Schema**

---

### 📞 CONTACTO (`/es/contacto.astro`)

**Estado Actual:**
- ✅ Meta tags presentes (vía JSON)
- ✅ ContactInfo presente

**Mejoras Necesarias:**
1. **Schema.org: ContactPage**
   ```json
   {
     "@type": "ContactPage",
     "mainEntity": {
       "@type": "LocalBusiness",
       "contactPoint": {
         "@type": "ContactPoint",
         "telephone": "+34 673 975 252",
         "email": "bernat@scorusfitness.com",
         "contactType": "Customer Service",
         "areaServed": "ES",
         "availableLanguage": ["Spanish", "English", "French"]
       }
     }
   }
   ```

2. **Hreflang tags**

---

## 🔧 MEJORAS TÉCNICAS GENERALES

### 1. 🌍 **HREFLANG IMPLEMENTATION (PRIORIDAD MÁXIMA)**

**Problema:** El sitio es multilingüe pero no indica a Google qué versión mostrar a cada usuario.

**Solución:** Crear componente `Hreflang.astro`

```astro
---
// src/components/seo/Hreflang.astro
export interface Props {
  currentLocale: string;
  currentSlug?: string;
  articleLocalizations?: Array<{ locale: string; slug: string }>;
  isBlogPage?: boolean;
}

const { currentLocale, currentSlug, articleLocalizations, isBlogPage } = Astro.props;

const SITE_URL = 'https://scorusfitness.com';
const SUPPORTED_LOCALES = ['es', 'en', 'fr', 'de', 'hu'];

function getAlternateUrls() {
  const urls: Record<string, string> = {};
  
  if (isBlogPage && articleLocalizations) {
    // Para artículos del blog, usar las localizaciones específicas
    articleLocalizations.forEach(({ locale, slug }) => {
      urls[locale] = `${SITE_URL}/${locale}/blog/${slug}`;
    });
  } else {
    // Para otras páginas, asumir que existen en todos los idiomas
    SUPPORTED_LOCALES.forEach(locale => {
      const path = currentSlug ? `/${locale}/${currentSlug}` : `/${locale}`;
      urls[locale] = `${SITE_URL}${path}`;
    });
  }
  
  return urls;
}

const alternateUrls = getAlternateUrls();
---

<!-- Hreflang tags -->
{Object.entries(alternateUrls).map(([locale, url]) => (
  <link rel="alternate" hreflang={locale} href={url} />
))}

<!-- x-default for undefined language preference -->
<link rel="alternate" hreflang="x-default" href={alternateUrls['es']} />
```

**Implementación en Layout:**
```astro
// src/layouts/Layout.astro
import Hreflang from '@components/seo/Hreflang.astro';

<Hreflang
  currentLocale={currentLocale}
  currentSlug={currentSlug}
  articleLocalizations={articleLocalizations}
  isBlogPage={isBlogPage}
/>
```

---

### 2. 🐦 **TWITTER CARDS**

**Crear:** `src/components/seo/TwitterCards.astro`

```astro
---
export interface Props {
  title: string;
  description: string;
  image?: string;
  card?: 'summary' | 'summary_large_image';
}

const { 
  title, 
  description, 
  image = 'https://scorusfitness.com/og-image.jpg',
  card = 'summary_large_image'
} = Astro.props;
---

<!-- Twitter Card -->
<meta name="twitter:card" content={card} />
<meta name="twitter:site" content="@bernatscorus" />
<meta name="twitter:creator" content="@bernatscorus" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={image} />
```

**Incluir en `SEO.astro`**

---

### 3. 📊 **SCHEMA.ORG ENHANCEMENTS**

#### FAQPage Schema Component

```typescript
// src/lib/schema.ts

export interface FAQ {
  question: string;
  answer: string;
}

export function getFAQPageSchema(faqs: FAQ[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
```

#### VideoObject Schema

```typescript
export function getVideoSchema(video: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: Date;
  duration?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate.toISOString(),
    duration: video.duration,
  };
}
```

#### Offer Schema (para servicios con precios)

```typescript
export function getOfferSchema(offer: {
  name: string;
  price: number;
  priceCurrency: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    name: offer.name,
    price: offer.price,
    priceCurrency: offer.priceCurrency,
    description: offer.description,
    url: offer.url,
    availability: 'https://schema.org/InStock',
  };
}
```

---

### 4. 🖼️ **OPTIMIZACIÓN DE IMÁGENES**

#### Alt Texts Mejorados

**Antes:**
```html
<img src="gym-01.jpg" alt="Scorus Fitness - Vista principal del gimnasio" />
```

**Después:**
```html
<img 
  src="gym-01.jpg" 
  alt="Interior del gimnasio boutique Scorus Fitness en Alicante con equipamiento profesional de culturismo y máquinas de última generación"
  title="Gimnasio Scorus Fitness Alicante"
/>
```

#### Lazy Loading

```astro
<Image
  src={image}
  alt="..."
  loading="lazy"
  decoding="async"
/>
```

#### OG Images específicas

Crear imágenes 1200x630px para cada sección principal:
- `og-home.jpg`
- `og-services.jpg`
- `og-academy.jpg`
- `og-gym.jpg`
- `og-biography.jpg`
- `og-blog.jpg`

---

### 5. 🔗 **BREADCRUMBS VISUALES**

**Crear:** `src/components/ui/Breadcrumbs.astro`

```astro
---
export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface Props {
  items: BreadcrumbItem[];
  currentLang: string;
}

const { items, currentLang } = Astro.props;

// Añadir Home al principio
const allItems = [
  { name: 'Home', url: `/${currentLang}` },
  ...items,
];
---

<nav aria-label="Breadcrumb" class="mb-8">
  <ol class="flex items-center space-x-2 text-sm text-gray-600">
    {allItems.map((item, index) => (
      <li class="flex items-center">
        {index > 0 && (
          <span class="mx-2 text-gray-400">/</span>
        )}
        {index === allItems.length - 1 ? (
          <span class="font-semibold text-red-600">{item.name}</span>
        ) : (
          <a href={item.url} class="hover:text-red-600 transition-colors">
            {item.name}
          </a>
        )}
      </li>
    ))}
  </ol>
</nav>
```

**Uso:**
```astro
<Breadcrumbs
  currentLang="es"
  items={[
    { name: 'Servicios', url: '/es/servicios' },
    { name: 'Entrenamiento Personal', url: '/es/servicios/entrenamiento-personal' }
  ]}
/>
```

---

### 6. 📱 **MOBILE OPTIMIZATION**

1. **Viewport Meta Tag** (ya está, pero verificar)
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0" />
   ```

2. **Touch Icons**
   ```html
   <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
   <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
   <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
   ```

---

### 7. ⚡ **PERFORMANCE OPTIMIZATION**

#### Preload Critical Resources

```astro
<head>
  <!-- Preload critical fonts -->
  <link
    rel="preload"
    href="/fonts/inter-var.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />
  
  <!-- Preconnect to external domains -->
  <link rel="preconnect" href="https://scorus-cms-strapi.onrender.com" />
  <link rel="dns-prefetch" href="https://scorus-cms-strapi.onrender.com" />
</head>
```

#### Image Optimization

- Usar WebP con fallback a JPEG
- Implementar `srcset` para responsive images
- Lazy load imágenes below the fold

#### Critical CSS

```astro
<style is:inline>
  /* Critical CSS above the fold */
  .hero { ... }
</style>
```

---

### 8. 🔍 **SITEMAP ENHANCEMENT**

**Verificar que el sitemap incluya:**
- Todas las páginas estáticas
- Todos los artículos del blog
- Todas las localizaciones
- Prioridad correcta (`priority`)
- Frecuencia de actualización (`changefreq`)

**Ejemplo de configuración Astro:**
```javascript
// astro.config.mjs
export default defineConfig({
  site: 'https://scorusfitness.com',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
          en: 'en-US',
          fr: 'fr-FR',
          de: 'de-DE',
          hu: 'hu-HU',
        },
      },
      filter: (page) => !page.includes('/admin/'),
    }),
  ],
});
```

---

### 9. 🔒 **SECURITY HEADERS**

**Crear:** `public/_headers` (para Netlify/Vercel) o configurar en servidor

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

### 10. 📊 **ANALYTICS & TRACKING**

1. **Google Search Console**
   - Verificar propiedad
   - Enviar sitemap
   - Monitorear errores de rastreo

2. **Google Analytics 4**
   - Implementar eventos personalizados
   - Seguimiento de conversiones (formulario de contacto, clics en CTA)

3. **Structured Data Testing Tool**
   - Validar todos los schemas

---

## 📝 PLAN DE IMPLEMENTACIÓN PRIORIZADO

### 🔴 PRIORIDAD ALTA (Semana 1)

1. **Implementar Hreflang tags** en todas las páginas
   - Crear componente `Hreflang.astro`
   - Añadir a Layout principal
   - Testear con Google Search Console

2. **Completar meta descriptions faltantes**
   - Servicios (index)
   - Blog (index)
   - Todas las subpáginas de servicios

3. **Añadir Twitter Cards**
   - Crear componente
   - Integrar en SEO.astro

4. **Optimizar alt texts de imágenes**
   - Home hero
   - Gym gallery
   - Servicios

### 🟠 PRIORIDAD MEDIA (Semana 2)

5. **Expandir Schema.org**
   - FAQPage para servicios
   - VideoObject para biografía
   - Offer para precios de servicios
   - EducationalOrganization para academia

6. **Crear OG images específicas**
   - Una para cada sección principal (6 imágenes)

7. **Implementar Breadcrumbs visuales**
   - Componente reutilizable
   - Añadir a todas las páginas de nivel 2+

8. **Mejorar meta description de Biografía**

### 🟢 PRIORIDAD BAJA (Semana 3+)

9. **Performance optimization**
   - Preload critical resources
   - Image optimization (WebP, srcset)
   - Critical CSS

10. **Security headers**

11. **Analytics avanzado**
    - Eventos personalizados
    - Conversiones

---

## 🎯 KPIs PARA MEDIR EL ÉXITO

1. **Rankings de palabras clave**
   - "entrenamiento personal Alicante"
   - "gimnasio Alicante"
   - "Bernat Scorus"
   - "culturismo Alicante"

2. **Core Web Vitals**
   - LCP < 2.5s
   - FID < 100ms
   - CLS < 0.1

3. **Indexación**
   - % de páginas indexadas en Google
   - 0 errores en Search Console

4. **CTR en SERP**
   - Monitorear mejoras después de optimizar titles/descriptions

5. **Tráfico orgánico**
   - Incremento mensual del tráfico
   - Tráfico por idioma

---

## 🛠️ HERRAMIENTAS RECOMENDADAS

1. **Google Search Console** - Monitoreo de indexación y errores
2. **Google PageSpeed Insights** - Performance y Core Web Vitals
3. **Schema Markup Validator** - Validar structured data
4. **Screaming Frog** - Auditoría técnica
5. **Ahrefs/SEMrush** - Keywords y backlinks
6. **GTmetrix** - Performance detallado
7. **WebPageTest** - Performance desde múltiples ubicaciones

---

## 📌 NOTAS FINALES

- **Documentar cada cambio** en control de versiones
- **Testear en staging** antes de producción
- **Monitorear Google Search Console** después de cada cambio importante
- **Re-auditar cada 3 meses** para mantener el SEO actualizado

---

**Preparado por:** AI Assistant  
**Para:** Scorus Fitness  
**Próxima revisión:** Febrero 2026

