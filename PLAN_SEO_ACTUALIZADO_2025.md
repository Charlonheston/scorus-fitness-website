# 🎯 PLAN DE ACCIÓN SEO ACTUALIZADO - SCORUS FITNESS

**Fecha:** 8 de noviembre de 2025  
**Estado:** Plan de implementación basado en auditoría completa  
**Sitio:** https://scorusfitness.com

---

## ✅ ESTADO ACTUAL - YA IMPLEMENTADO

### Componentes SEO Funcionales
- ✅ **Componente SEO.astro** - Meta tags básicos, OG, robots
- ✅ **Twitter Cards** - Implementado y funcional
- ✅ **Hreflang tags** - Sistema multilingüe completo (ES, EN, FR, DE, HU)
- ✅ **Structured Data** - LocalBusiness, Person, BlogPosting, Service, Breadcrumb
- ✅ **Canonical URLs** - Implementados en todas las páginas
- ✅ **DNS Prefetch/Preconnect** - Optimización de recursos externos
- ✅ **Meta descriptions** - Presentes en mayoría de páginas principales

### Páginas con SEO Base Correcto
- ✅ Home (`/es/index.astro`) - Title, description, schema
- ✅ Servicios índice (`/es/servicios/index.astro`) - Completo
- ✅ Entrenamiento Personal - Meta tags y estructura
- ✅ Academia índice - Title y description
- ✅ Gym - Title y description
- ✅ Contacto - Meta tags completos
- ✅ Blog - Sistema completo con artículos

---

## 🔴 PRIORIDAD ALTA - IMPLEMENTAR INMEDIATAMENTE

### 1. MEJORAR ALT TEXTS DE IMÁGENES (2-3 horas)

**Problema:** Alt texts genéricos que no aportan valor SEO

**Páginas afectadas:**
- `/es/gym.astro` - 10 imágenes con alt genérico
- `/es/index.astro` - Imágenes hero y secciones
- Servicios - Imágenes de hero en todas las subpáginas

**Acción:**
```astro
<!-- ❌ ANTES (Gym) -->
<img src="/images/gym/gym-01.jpg" alt="Scorus Fitness - Vista principal del gimnasio" />

<!-- ✅ DESPUÉS -->
<img 
  src="/images/gym/gym-01.jpg" 
  alt="Interior del gimnasio boutique Scorus Fitness en Alicante con equipamiento profesional de culturismo, máquinas de última generación y zona de pesas libres"
  title="Gimnasio Scorus Fitness Alicante - Equipamiento Premium"
  loading="lazy"
/>
```

**Archivo a modificar:** 
- `src/pages/es/gym.astro` (líneas 17-27)
- `src/pages/en/gym.astro` (líneas similares)
- Repetir para FR, DE, HU

**Keywords objetivo en alt texts:**
- "gimnasio boutique Alicante"
- "culturismo profesional"
- "entrenamiento personal Alicante"
- "equipamiento fitness premium"
- "zona de pesas libres"

---

### 2. MEJORAR META DESCRIPTION DE BIOGRAFÍA (30 min)

**Problema:** Description muy corta y poco optimizada

**Acción:**
```astro
<!-- ❌ ANTES -->
const description = 'De la superación personal a la excelencia en el fitness. Scrollytelling.';

<!-- ✅ DESPUÉS -->
const description = 'Conoce la historia de Bernat Scorus, culturista profesional, campeón mundial de culturismo y entrenador personal en Alicante. Más de 25 años transformando cuerpos y vidas con metodologías probadas y enfoque personalizado.';
```

**Archivo:** `src/pages/es/biografia.astro` (línea 6)
**Repetir para:** EN, FR, DE, HU con traducciones apropiadas

---

### 3. EXPANDIR KEYWORDS EN PÁGINAS PRINCIPALES (1 hora)

**Problema:** Keywords limitadas o no optimizadas

**Archivo:** `src/components/seo/SEO.astro`

**Acción por página:**

#### Home
```typescript
keywords: [
  'entrenamiento personal Alicante',
  'gimnasio Alicante',
  'Bernat Scorus',
  'culturismo Alicante',
  'fitness personalizado',
  'transformación física',
  'campeón mundial culturismo',
  'entrenador personal profesional',
  'nutrición deportiva Alicante',
  'coaching fitness'
]
```

#### Servicios
```typescript
keywords: [
  'entrenamiento personal',
  'consultoría fitness online',
  'asesoramiento deportivo',
  'coaching personalizado',
  'planes entrenamiento',
  'nutrición personalizada',
  'scorus campus',
  'seminarios fitness',
  'talleres culturismo'
]
```

#### Gym
```typescript
keywords: [
  'gimnasio boutique Alicante',
  'gym privado Alicante',
  'entrenamiento personalizado',
  'culturismo Alicante',
  'equipamiento profesional',
  'sala entrenamiento privada',
  'gimnasio premium'
]
```

#### Academia
```typescript
keywords: [
  'formación fitness',
  'cursos culturismo',
  'seminarios entrenamiento',
  'talleres fitness',
  'educación deportiva',
  'certificación fitness',
  'formación profesional',
  'scorus academia'
]
```

---

### 4. AÑADIR OG IMAGES ESPECÍFICAS (2 horas)

**Problema:** Usando imagen genérica para todas las secciones

**Acción:**

1. **Crear imágenes 1200x630px:**
   - `public/images/og/og-home.jpg`
   - `public/images/og/og-services.jpg`
   - `public/images/og/og-academy.jpg`
   - `public/images/og/og-gym.jpg`
   - `public/images/og/og-biography.jpg`
   - `public/images/og/og-blog.jpg`
   - `public/images/og/og-contact.jpg`

2. **Actualizar componente Layout.astro:**
```astro
<!-- Ejemplo para Home -->
<Layout
  title="Scorus Fitness | Entrenamiento Personal en Alicante"
  description="..."
  image="/images/og/og-home.jpg"  <!-- ⚡ NUEVA -->
/>
```

**Contenido sugerido para cada OG image:**
- **Home:** Bernat + Logo + "Transformación Física y Mental"
- **Servicios:** Grid de iconos de servicios
- **Academia:** Aula/seminario con logo
- **Gym:** Interior del gimnasio con logo overlay
- **Biografía:** Foto de Bernat con trofeos
- **Blog:** Portada estilo revista fitness
- **Contacto:** Mapa + información de contacto

---

## 🟠 PRIORIDAD MEDIA - IMPLEMENTAR SEMANA 2

### 5. SCHEMA.ORG AVANZADO (4-6 horas)

#### 5.1 FAQPage Schema para Servicios

**Archivo nuevo:** `src/components/schema/FAQSchema.astro`

```typescript
---
export interface FAQ {
  question: string;
  answer: string;
}

export interface Props {
  faqs: FAQ[];
}

const { faqs } = Astro.props;

const faqSchema = {
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
---

<script type="application/ld+json" set:html={JSON.stringify(faqSchema)} />
```

**Uso en `/es/servicios/entrenamiento-personal.astro`:**
```astro
---
import FAQSchema from '@components/schema/FAQSchema.astro';

const faqs = [
  {
    question: '¿Cuántas sesiones a la semana necesito?',
    answer: 'Depende de tus objetivos. Recomendamos 2-4 sesiones semanales para resultados óptimos.'
  },
  {
    question: '¿Incluye plan nutricional?',
    answer: 'Sí, todos nuestros programas incluyen asesoramiento nutricional personalizado.'
  },
  {
    question: '¿Cuánto tiempo hasta ver resultados?',
    answer: 'Los primeros cambios visibles aparecen entre 4-6 semanas con dedicación constante.'
  },
  {
    question: '¿Es necesario experiencia previa?',
    answer: 'No, adaptamos el programa a tu nivel actual, desde principiantes hasta avanzados.'
  }
];
---

<Layout ...>
  <FAQSchema faqs={faqs} />
  
  <!-- Sección FAQ visual -->
  <section class="py-20">
    <h2>Preguntas Frecuentes</h2>
    {faqs.map(faq => (
      <div class="faq-item">
        <h3>{faq.question}</h3>
        <p>{faq.answer}</p>
      </div>
    ))}
  </section>
</Layout>
```

**Repetir para:**
- Consultoría Online
- Asesoramiento Online
- Scorus Campus
- Talleres
- Seminarios

---

#### 5.2 VideoObject Schema para Biografía

**Archivo:** `src/pages/es/biografia.astro`

```astro
---
const videoSchema = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'La Historia de Bernat Scorus - De la Superación a la Excelencia',
  description: 'Descubre el viaje inspirador de Bernat Scorus desde sus inicios hasta convertirse en campeón mundial de culturismo y referente en entrenamiento personal.',
  thumbnailUrl: 'https://scorusfitness.com/images/about/biography/thumbnail.jpg',
  uploadDate: '2024-01-15T00:00:00Z',
  duration: 'PT5M30S', // 5 minutos 30 segundos
  contentUrl: 'https://scorusfitness.com/videos/biography/intro.mp4',
  embedUrl: 'https://scorusfitness.com/es/biografia#video',
  publisher: {
    '@type': 'Organization',
    name: 'Scorus Fitness',
    logo: {
      '@type': 'ImageObject',
      url: 'https://scorusfitness.com/logo.png'
    }
  }
};
---

<Layout ...>
  <script type="application/ld+json" set:html={JSON.stringify(videoSchema)} />
  <!-- Resto del contenido -->
</Layout>
```

---

#### 5.3 Offer Schema para Servicios con Precios

**Archivo nuevo:** `src/lib/schema.ts` (añadir función)

```typescript
export interface PricingOffer {
  name: string;
  price: string;
  priceCurrency: string;
  description: string;
  url: string;
  validFrom?: string;
  availability?: string;
}

export function getOfferSchema(offers: PricingOffer[]) {
  if (offers.length === 1) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Offer',
      name: offers[0].name,
      price: offers[0].price,
      priceCurrency: offers[0].priceCurrency,
      description: offers[0].description,
      url: offers[0].url,
      availability: offers[0].availability || 'https://schema.org/InStock',
      validFrom: offers[0].validFrom || new Date().toISOString(),
    };
  }
  
  return {
    '@context': 'https://schema.org',
    '@type': 'AggregateOffer',
    offerCount: offers.length,
    offers: offers.map(offer => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.price,
      priceCurrency: offer.priceCurrency,
      description: offer.description,
      url: offer.url,
      availability: offer.availability || 'https://schema.org/InStock',
    })),
  };
}
```

**Uso en `/es/servicios/entrenamiento-personal.astro`:**
```astro
---
import { getOfferSchema } from '@lib/schema';

const offers = [
  {
    name: 'Bono 8 Sesiones',
    price: '200',
    priceCurrency: 'EUR',
    description: 'Perfecto para quienes entrenan 1-2 veces por semana',
    url: 'https://scorusfitness.com/es/servicios/entrenamiento-personal#bono-8',
  },
  {
    name: 'Bono 12 Sesiones',
    price: '280',
    priceCurrency: 'EUR',
    description: 'Ideal para entrenar 2-3 veces por semana',
    url: 'https://scorusfitness.com/es/servicios/entrenamiento-personal#bono-12',
  },
  {
    name: 'Bono 20 Sesiones',
    price: '400',
    priceCurrency: 'EUR',
    description: 'Para quienes buscan máxima transformación, 4-5 sesiones semanales',
    url: 'https://scorusfitness.com/es/servicios/entrenamiento-personal#bono-20',
  },
];

const offerSchema = getOfferSchema(offers);
---

<Layout schema={offerSchema}>
  <!-- Contenido -->
</Layout>
```

---

#### 5.4 EducationalOrganization Schema para Academia

**Archivo:** `src/pages/es/academia/index.astro`

```astro
---
const academySchema = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'Scorus Academia',
  description: 'Centro de formación profesional en fitness, culturismo y entrenamiento personal. Talleres, seminarios y programas especializados.',
  url: 'https://scorusfitness.com/es/academia',
  logo: 'https://scorusfitness.com/logo.png',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Calle Alicante 123',
    addressLocality: 'Alicante',
    addressRegion: 'Alicante',
    postalCode: '03001',
    addressCountry: 'ES',
  },
  founder: {
    '@type': 'Person',
    name: 'Bernat Scorus',
    jobTitle: 'Culturista Profesional y Entrenador Personal',
  },
  areaServed: ['ES', 'EU', 'LATAM'],
  availableLanguage: ['Spanish', 'English', 'French', 'German', 'Hungarian'],
};
---

<Layout schema={academySchema}>
  <!-- Contenido -->
</Layout>
```

---

#### 5.5 Course Schema para Programas de Academia

**Archivo:** `src/pages/es/academia/re-born.astro`

```astro
---
const courseSchema = {
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: 'RE-BORN - Programa de Transformación Integral',
  description: 'Programa exclusivo de transformación física, mental y espiritual para hombres de 35-55 años. Reconstrucción completa con acompañamiento personalizado.',
  provider: {
    '@type': 'EducationalOrganization',
    name: 'Scorus Academia',
    sameAs: 'https://scorusfitness.com/es/academia',
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'blended', // Presencial + Online
    courseWorkload: 'PT180H', // 180 horas estimadas
    instructor: {
      '@type': 'Person',
      name: 'Bernat Scorus',
    },
  },
  offers: {
    '@type': 'Offer',
    category: 'Paid',
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
  },
  educationalLevel: 'All Levels',
  inLanguage: 'es',
};
---

<Layout schema={courseSchema}>
  <!-- Contenido -->
</Layout>
```

**Repetir para:**
- Talleres
- Seminarios
- Video Cursos

---

#### 5.6 ImageGallery Schema para Gym

**Archivo:** `src/pages/es/gym.astro`

```astro
---
const gymImages = [
  { src: '/images/gym/gym-01.jpg', alt: '...', caption: 'Vista principal del gimnasio' },
  // ... resto de imágenes
];

const imageGallerySchema = {
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: 'Scorus GYM - Instalaciones',
  description: 'Galería de fotos del gimnasio boutique Scorus Fitness en Alicante',
  associatedMedia: gymImages.map(img => ({
    '@type': 'ImageObject',
    contentUrl: `https://scorusfitness.com${img.src}`,
    caption: img.caption,
    description: img.alt,
  })),
};
---

<Layout schema={imageGallerySchema}>
  <!-- Galería -->
</Layout>
```

---

### 6. BREADCRUMBS VISUALES (2-3 horas)

**Problema:** Existe schema de breadcrumbs pero no hay breadcrumbs visuales

**Ya existe:** `src/components/ui/Breadcrumbs.astro` (verificar)

**Acción:** Añadir breadcrumbs visuales en todas las páginas de nivel 2+

#### Implementación en Servicios

**Archivo:** `src/pages/es/servicios/entrenamiento-personal.astro`

```astro
---
import Breadcrumbs from '@components/ui/Breadcrumbs.astro';
---

<Layout ...>
  <Breadcrumbs
    currentLang="es"
    items={[
      { name: 'Servicios', url: '/es/servicios' },
      { name: 'Entrenamiento Personal', url: '/es/servicios/entrenamiento-personal' }
    ]}
  />
  
  <!-- Resto del contenido -->
</Layout>
```

**Páginas a actualizar:**
- Todas las subpáginas de servicios (8 páginas)
- Todas las subpáginas de academia (4 páginas)
- Artículos del blog (dinámico)

---

## 🟢 PRIORIDAD BAJA - IMPLEMENTAR SEMANA 3+

### 7. PERFORMANCE OPTIMIZATION (6-8 horas)

#### 7.1 Lazy Loading de Imágenes

**Archivo:** Global - Todas las imágenes below the fold

```astro
<!-- ❌ ANTES -->
<img src="/images/gym/gym-05.jpg" alt="..." />

<!-- ✅ DESPUÉS -->
<img src="/images/gym/gym-05.jpg" alt="..." loading="lazy" decoding="async" />
```

**Usar Astro Image component:**
```astro
---
import { Image } from 'astro:assets';
import gymImage from '@images/gym/gym-05.jpg';
---

<Image
  src={gymImage}
  alt="Equipamiento profesional Scorus Fitness"
  loading="lazy"
  decoding="async"
  quality={85}
/>
```

---

#### 7.2 WebP con Fallback

**Crear:** Script de conversión de imágenes

```bash
# Instalar sharp
npm install sharp

# Crear script: scripts/convert-to-webp.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function convertToWebP(inputPath, outputPath) {
  await sharp(inputPath)
    .webp({ quality: 85 })
    .toFile(outputPath);
}

// Convertir todas las imágenes del gym
const gymDir = 'public/images/gym';
fs.readdirSync(gymDir)
  .filter(file => file.endsWith('.jpg'))
  .forEach(async file => {
    const inputPath = path.join(gymDir, file);
    const outputPath = path.join(gymDir, file.replace('.jpg', '.webp'));
    await convertToWebP(inputPath, outputPath);
    console.log(`✅ Converted ${file}`);
  });
```

**Uso en HTML:**
```html
<picture>
  <source srcset="/images/gym/gym-01.webp" type="image/webp">
  <source srcset="/images/gym/gym-01.jpg" type="image/jpeg">
  <img src="/images/gym/gym-01.jpg" alt="...">
</picture>
```

---

#### 7.3 Responsive Images (srcset)

```astro
<Image
  src={gymImage}
  alt="..."
  widths={[320, 640, 960, 1280, 1920]}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
  loading="lazy"
/>
```

---

#### 7.4 Preload Critical Resources

**Archivo:** `src/layouts/Layout.astro` (añadir en `<head>`)

```astro
<!-- Preload hero image (above the fold) -->
<link
  rel="preload"
  as="image"
  href="/images/hero/home-hero.jpg"
  type="image/jpeg"
/>

<!-- Preload critical CSS (ya inline, pero si se separa) -->
<link
  rel="preload"
  href="/styles/critical.css"
  as="style"
/>
```

---

#### 7.5 Critical CSS Inline

**Ya implementado parcialmente**, mejorar:

```astro
<style is:inline>
  /* Hero section - Above the fold */
  .hero {
    min-height: 100vh;
    background: #000;
    color: #fff;
  }
  
  /* Header */
  header {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 50;
  }
  
  /* Resto del CSS debe cargarse async */
</style>
```

---

### 8. TIEMPO DE LECTURA EN BLOG (1 hora)

**Función helper:** `src/lib/utils.ts`

```typescript
export function calculateReadingTime(content: string): string {
  // Promedio 200 palabras por minuto
  const wordsPerMinute = 200;
  
  // Remover HTML tags para contar solo texto
  const text = content.replace(/<[^>]*>/g, '');
  
  // Contar palabras
  const words = text.trim().split(/\s+/).length;
  
  // Calcular minutos
  const minutes = Math.ceil(words / wordsPerMinute);
  
  return minutes === 1 ? '1 min' : `${minutes} min`;
}
```

**Uso en blog post:**
```astro
---
import { calculateReadingTime } from '@lib/utils';

const article = ...;
const readingTime = calculateReadingTime(article.content);
---

<article>
  <header>
    <h1>{article.title}</h1>
    <div class="meta">
      <time>{article.date}</time>
      <span>·</span>
      <span>⏱️ {readingTime} de lectura</span>
    </div>
  </header>
</article>
```

---

### 9. PAGINACIÓN SEO EN BLOG (1 hora)

**Archivo:** `src/pages/es/blog/index.astro`

```astro
---
// Si implementas paginación
const currentPage = 1;
const totalPages = 5;
const basePath = '/es/blog';
---

<Layout>
  <head>
    {currentPage > 1 && (
      <link
        rel="prev"
        href={`${basePath}${currentPage === 2 ? '' : `/page/${currentPage - 1}`}`}
      />
    )}
    {currentPage < totalPages && (
      <link rel="next" href={`${basePath}/page/${currentPage + 1}`} />
    )}
  </head>
</Layout>
```

---

### 10. TOUCH ICONS PARA MÓVILES (30 min)

**Crear iconos:**
- apple-touch-icon.png (180x180)
- favicon-32x32.png
- favicon-16x16.png
- favicon.ico

**Añadir en Layout:**
```astro
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="shortcut icon" href="/favicon.ico" />

<!-- Android Chrome -->
<link rel="manifest" href="/site.webmanifest" />
<meta name="theme-color" content="#dc2626" />
```

**Crear:** `public/site.webmanifest`
```json
{
  "name": "Scorus Fitness",
  "short_name": "Scorus",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#dc2626",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

---

### 11. SECURITY HEADERS (1 hora)

**Para Netlify:** Crear `public/_headers`

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:;

/images/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable
```

**Para Vercel:** Crear `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

---

## 📊 RESUMEN DE TAREAS POR PRIORIDAD

### 🔴 ALTA (Semana 1) - 6-8 horas
1. ✅ Mejorar alt texts de imágenes (2-3h)
2. ✅ Mejorar meta description biografía (30min)
3. ✅ Expandir keywords (1h)
4. ✅ Crear OG images específicas (2h)

### 🟠 MEDIA (Semana 2) - 8-12 horas
5. ✅ FAQPage Schema en servicios (2h)
6. ✅ VideoObject Schema en biografía (30min)
7. ✅ Offer Schema en servicios (1h)
8. ✅ EducationalOrganization Schema (30min)
9. ✅ Course Schema (1h)
10. ✅ ImageGallery Schema (30min)
11. ✅ Breadcrumbs visuales (2-3h)

### 🟢 BAJA (Semana 3+) - 10-14 horas
12. ✅ Lazy loading de imágenes (1h)
13. ✅ WebP conversion (2h)
14. ✅ Responsive images (1h)
15. ✅ Preload critical resources (1h)
16. ✅ Tiempo de lectura en blog (1h)
17. ✅ Paginación SEO (1h)
18. ✅ Touch icons (30min)
19. ✅ Security headers (1h)

---

## 🎯 KPIs PARA MEDIR EL ÉXITO

### Semana 1 (Después de implementar prioridad ALTA)
- ✅ 100% de imágenes con alt texts descriptivos
- ✅ Meta descriptions óptimas (150-160 chars) en todas las páginas
- ✅ Keywords específicas en cada página
- ✅ OG images específicas para compartir en RRSS

### Semana 2 (Después de implementar prioridad MEDIA)
- ✅ Schema.org completo en todas las páginas
- ✅ Rich snippets en resultados de Google (FAQs, Precios, Cursos)
- ✅ Breadcrumbs visuales en todas las páginas de nivel 2+

### Semana 3+ (Después de implementar prioridad BAJA)
- ✅ Core Web Vitals mejorados:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- ✅ Imágenes optimizadas (WebP + lazy loading)
- ✅ Security headers A+ en SecurityHeaders.com

### Seguimiento Continuo
**Google Search Console:**
- Incremento en impresiones y clics
- CTR mejorado después de optimizar titles/descriptions
- 0 errores de rastreo
- 100% de páginas indexadas

**PageSpeed Insights:**
- Mobile: 90+ (Performance)
- Desktop: 95+ (Performance)

**Rankings:**
- "entrenamiento personal Alicante" - Top 3
- "gimnasio Alicante" - Top 5
- "Bernat Scorus" - #1
- "culturismo Alicante" - Top 5

---

## 🛠️ HERRAMIENTAS PARA VALIDACIÓN

1. **Google Search Console** - https://search.google.com/search-console
2. **Google PageSpeed Insights** - https://pagespeed.web.dev/
3. **Schema Markup Validator** - https://validator.schema.org/
4. **Rich Results Test** - https://search.google.com/test/rich-results
5. **Hreflang Tags Testing** - https://technicalseo.com/tools/hreflang/
6. **Security Headers** - https://securityheaders.com/
7. **GTmetrix** - https://gtmetrix.com/
8. **WebPageTest** - https://www.webpagetest.org/

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Antes de cada cambio:
- [ ] Backup de archivos a modificar
- [ ] Test en entorno de desarrollo
- [ ] Validar con herramientas online

### Después de cada cambio:
- [ ] Deploy a staging
- [ ] Validar visualmente
- [ ] Comprobar con validators
- [ ] Deploy a producción
- [ ] Monitorear Google Search Console

### Cada semana:
- [ ] Revisar Core Web Vitals
- [ ] Comprobar errores en Search Console
- [ ] Analizar posiciones de keywords
- [ ] Revisar CTR en SERP

---

**Preparado por:** AI Assistant  
**Para:** Scorus Fitness  
**Próxima revisión:** Diciembre 2025

