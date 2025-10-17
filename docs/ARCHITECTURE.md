# 🏗️ Arquitectura del Proyecto

## Stack Tecnológico

### Framework Principal
- **Astro 4.x**: Framework de sitios web estáticos optimizado para performance
- **Ventajas**:
  - 0KB JavaScript por defecto (HTML estático)
  - Arquitectura de Islands para JS solo donde se necesita
  - Performance excepcional out-of-the-box
  - Soporte multi-framework (React, Vue, Svelte)

### Styling
- **TailwindCSS 3.x**: Framework utility-first
- **Configuración personalizada**: Colores de marca, fuentes, animaciones

### Componentes Interactivos
- **React 18**: Para componentes que requieren interactividad (carousels, forms)
- **Astro Islands**: Hidratación parcial selectiva

### Content Management
- **Content Collections** (Astro nativo): Para blog y contenido estructurado
- **Sanity.io**: CMS headless para contenido dinámico
- **MDX**: Para posts ricos con componentes interactivos

### Internacionalización
- **astro-i18next**: Soporte multilingüe (ES, EN, FR, DE)
- Rutas localizadas: `/{lang}/{page}`

## Decisiones Arquitectónicas

### ¿Por qué Astro?

1. **Performance Excepcional**
   - Genera HTML estático por defecto
   - Sin JavaScript innecesario en el cliente
   - Core Web Vitals óptimos garantizados

2. **SEO Superior**
   - HTML semántico por naturaleza
   - Contenido completamente crawleable
   - Sin problemas de renderizado del lado del cliente

3. **Developer Experience**
   - Sintaxis familiar (HTML + componentes)
   - TypeScript de primera clase
   - Hot Module Reload rápido

4. **Flexibility**
   - Arquitectura de Islands permite usar React solo donde se necesita
   - SSG + SSR híbrido disponible
   - Fácil integración con servicios externos

### Patrón Astro Islands

```
┌─────────────────────────────────────┐
│  Página (HTML Estático)             │
│                                     │
│  ┌──────────┐    ┌──────────┐     │
│  │ Carousel │    │  Form    │     │
│  │ (React)  │    │ (React)  │     │
│  └──────────┘    └──────────┘     │
│    ↑ Isla           ↑ Isla         │
│    Solo JS        Solo JS          │
│    necesario      necesario        │
└─────────────────────────────────────┘
```

**Componentes Astro** (0KB JS):
- Header, Footer, Navigation
- Cards, Buttons, Layouts
- Contenido estático

**React Islands** (JS hidratado):
- Carousels/Sliders
- Formularios con validación
- Menú móvil
- Componentes con estado

### Data Flow

```
┌─────────────┐
│  Sanity CMS │
│   (Content) │
└──────┬──────┘
       │
       │ Build Time
       ▼
┌─────────────┐
│ Astro Build │ ← Content Collections (MD/MDX)
└──────┬──────┘
       │
       │ Generate
       ▼
┌─────────────┐
│ Static HTML │
│  (dist/)    │
└─────────────┘
```

## Estructura de Directorios

```
src/
├── components/
│   ├── ui/              # Componentes base Astro (0KB JS)
│   ├── react/           # Islas React (interactivas)
│   ├── layout/          # Header, Footer, Nav
│   ├── sections/        # Secciones de página
│   ├── blog/            # Componentes del blog
│   └── seo/             # SEO y metadatos
│
├── content/             # Content Collections
│   ├── config.ts        # Schema definitions
│   └── blog/            # Posts en MD/MDX
│
├── layouts/             # Page layouts
│   └── Layout.astro     # Base layout
│
├── pages/               # File-based routing
│   └── [lang]/          # i18n routes
│
├── lib/                 # Utilidades
│   ├── api/             # API clients
│   ├── i18n/            # i18n utils
│   ├── constants.ts
│   ├── utils.ts
│   └── schema.ts        # Schema.org helpers
│
├── types/               # TypeScript types
└── styles/              # Global styles
```

## Performance Strategy

### Optimizaciones

1. **Imágenes**
   - Componente `<Image>` de Astro
   - Formatos WebP/AVIF automáticos
   - Lazy loading por defecto
   - Responsive srcset

2. **JavaScript**
   - Astro nativo para todo lo posible (0KB)
   - React solo para interactividad
   - Code splitting automático
   - `client:` directives estratégicos:
     - `client:load`: Carga inmediata (header)
     - `client:idle`: Carga cuando idle (analytics)
     - `client:visible`: Carga al entrar en viewport (carousels)

3. **CSS**
   - TailwindCSS con purge automático
   - Critical CSS inline
   - No CSS-in-JS pesado

4. **Fuentes**
   - Preconnect a Google Fonts
   - font-display: swap

### Targets de Performance

- **Lighthouse Performance**: > 95
- **Lighthouse SEO**: > 95
- **Lighthouse Accessibility**: > 95
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

## SEO Architecture

### Metadatos
- Componente `<SEO>` centralizado
- Open Graph completo
- Twitter Cards
- Canonical URLs
- Hreflang para i18n

### Structured Data
- LocalBusiness schema (global)
- Person schema (Bernat Scorus)
- BlogPosting para artículos
- Service para servicios
- BreadcrumbList en todas las páginas

### Sitemap
- Generación automática con `@astrojs/sitemap`
- Incluye todas las variantes de idioma
- Actualización en cada build

## Escalabilidad

### Ventajas de Astro

1. **Build Performance**
   - Builds incrementales
   - Procesamiento paralelo
   - Rápido incluso con 1000+ páginas

2. **Mantenibilidad**
   - Menos dependencias que Next.js
   - Arquitectura simple
   - HTML debuggeable

3. **Flexibilidad**
   - Fácil migrar a SSR si necesario
   - Adapters para múltiples plataformas
   - Integración con servicios externos

## Conclusión

Esta arquitectura con Astro proporciona:
- ⚡ Performance excepcional
- 🔍 SEO superior
- 🛠️ DX excelente
- 🌍 Multilingüe desde el inicio
- ♿ Accesibilidad garantizada

