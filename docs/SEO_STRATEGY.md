# 🔍 Estrategia SEO

## Objetivos

1. Posicionamiento orgánico para keywords clave
2. Snippet Rico en SERPs con Schema.org
3. Core Web Vitals en verde
4. Indexación multilingüe efectiva

## Keywords Objetivo

### Principales
- "entrenamiento personal alicante"
- "gimnasio alicante"
- "bernat scorus"
- "scorus fitness"

### Secundarias
- "culturismo alicante"
- "transformación física"
- "nutrición deportiva"
- "entrenador personal"

### Long-tail
- "mejor gimnasio para culturismo en alicante"
- "programa de transformación física personalizado"
- "entrenamiento personalizado online"

## On-Page SEO

### Metadatos

Cada página debe tener:

```astro
<SEO
  title="Título único (50-60 caracteres)"
  description="Descripción única (150-160 caracteres)"
  image="/og-image.jpg"
  canonical="https://scorusfitness.com/pagina"
/>
```

### Estructura de Headings

```html
<h1>Un solo H1 por página - Keyword principal</h1>
<h2>Secciones principales - Keywords secundarias</h2>
<h3>Subsecciones</h3>
```

### URLs Limpias

✅ Buenas:
- `/servicios/entrenamiento-personal`
- `/blog/nutricion-para-ganar-masa-muscular`

❌ Malas:
- `/servicios?id=123`
- `/blog/post-1`

## Structured Data (Schema.org)

### LocalBusiness

Implementado en todas las páginas:

```json
{
  "@type": "SportsActivityLocation",
  "name": "Scorus Fitness",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Conrado Albaladejo, 31",
    "addressLocality": "Alicante",
    "postalCode": "03540"
  },
  "telephone": "+34 673 97 52 52",
  "openingHours": "Mo-Fr 10:00-14:00,15:00-22:00"
}
```

### Person (Bernat Scorus)

```json
{
  "@type": "Person",
  "name": "Bernat Scorus",
  "jobTitle": "Entrenador Personal y Culturista Profesional",
  "sameAs": [
    "https://instagram.com/bernatscorus",
    "https://youtube.com/@ScorusFitness"
  ]
}
```

### BlogPosting

Para cada artículo:

```json
{
  "@type": "BlogPosting",
  "headline": "Título del artículo",
  "datePublished": "2024-10-16",
  "author": {
    "@type": "Person",
    "name": "Bernat Scorus"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Scorus Fitness"
  }
}
```

### Service

Para cada servicio:

```json
{
  "@type": "Service",
  "name": "Entrenamiento Personal",
  "description": "...",
  "provider": {
    "@type": "SportsActivityLocation",
    "name": "Scorus Fitness"
  }
}
```

### FAQ

En páginas relevantes:

```json
{
  "@type": "FAQPage",
  "mainEntity": [{
    "@type": "Question",
    "name": "¿Cuánto dura una sesión?",
    "acceptedAnswer": {
      "@type": "Answer",
      "text": "Las sesiones duran 60 minutos..."
    }
  }]
}
```

## SEO Multilingüe

### Hreflang Tags

Implementado automáticamente:

```html
<link rel="alternate" hreflang="es" href="https://scorusfitness.com/es/servicios" />
<link rel="alternate" hreflang="en" href="https://scorusfitness.com/en/services" />
<link rel="alternate" hreflang="fr" href="https://scorusfitness.com/fr/services" />
<link rel="alternate" hreflang="de" href="https://scorusfitness.com/de/dienstleistungen" />
<link rel="alternate" hreflang="x-default" href="https://scorusfitness.com/es/servicios" />
```

### Canonical URLs

Una por idioma, apuntando a sí misma:

```html
<!-- Página en español -->
<link rel="canonical" href="https://scorusfitness.com/es/servicios" />
```

## Technical SEO

### Sitemap

Generado automáticamente en cada build:

```xml
<url>
  <loc>https://scorusfitness.com/es/</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://scorusfitness.com/en/" />
  <xhtml:link rel="alternate" hreflang="fr" href="https://scorusfitness.com/fr/" />
  <xhtml:link rel="alternate" hreflang="de" href="https://scorusfitness.com/de/" />
</url>
```

### Robots.txt

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://scorusfitness.com/sitemap-index.xml
```

### Performance = SEO

Core Web Vitals son factor de ranking:

- **LCP < 2.5s**: Optimizar imágenes hero
- **FID < 100ms**: Minimizar JavaScript
- **CLS < 0.1**: Reservar espacio para imágenes

Con Astro, esto se logra fácilmente:
- 0KB JS por defecto
- HTML estático
- Images optimizadas

## Content Strategy

### Blog SEO

1. **Keyword Research**: Usar Ahrefs/SEMrush
2. **Long-form Content**: 1500+ palabras
3. **Internal Linking**: Enlaces a otros posts y servicios
4. **External Links**: A fuentes autoritativas
5. **Multimedia**: Imágenes, videos (con alt text)

### Ejemplo de Estructura de Post

```markdown
# Título con Keyword Principal (H1)

**Meta Description preview en primer párrafo**

## Introducción

## Sección 1 - Keyword Secundaria (H2)

### Subsección (H3)

## Sección 2 - Keyword Secundaria (H2)

## Conclusión

### FAQs (H3)

#### ¿Pregunta 1? (H4)

Respuesta con keywords naturales.
```

## Local SEO

### Google My Business

- Mantener perfil actualizado
- Publicar regularmente
- Responder reseñas
- Añadir fotos

### NAP Consistency

Nombre, Dirección, Teléfono consistentes en:
- Sitio web (footer)
- Google My Business
- Redes sociales
- Directorios locales

### Reviews

- Solicitar reseñas a clientes satisfechos
- Responder todas las reseñas (positivas y negativas)
- Implementar Review Schema

## Link Building

### Estrategias

1. **Contenido de Calidad**: Crear contenido enlazable
2. **Guest Posting**: En blogs de fitness relevantes
3. **Directorios**: Registrar en directorios locales
4. **Menciones**: Monitorear y solicitar enlaces

### Links Internos

Estructura de silos:

```
Home
├── Servicios (pilar)
│   ├── Entrenamiento Personal
│   ├── Consultoría Online
│   └── Seminarios
├── Academia (pilar)
│   ├── RE-BORN
│   └── Scorus Campus
└── Blog (pilar)
    ├── Nutrición
    ├── Culturismo
    └── Rutinas
```

## Optimización para IA

### Contenido Estructurado

Para ChatGPT, Bard, etc.:

1. **HTML Semántico**: `<article>`, `<section>`, `<aside>`
2. **Listas**: Usar `<ul>`, `<ol>` para enumeraciones
3. **Tablas**: Para datos tabulares
4. **Schema.org**: Datos estructurados

### Respuestas Directas

Formatear contenido para featured snippets:

```html
<div>
  <h2>¿Cuántas veces entrenar por semana?</h2>
  <p>Lo ideal es entrenar 3-5 veces por semana...</p>
</div>
```

## Monitoring

### Herramientas

- **Google Search Console**: Indexación y queries
- **Google Analytics 4**: Tráfico orgánico
- **Ahrefs/SEMrush**: Rankings y backlinks
- **PageSpeed Insights**: Core Web Vitals

### KPIs

- Posicionamiento de keywords objetivo
- Tráfico orgánico mensual
- Tasa de conversión
- Tiempo en página
- Bounce rate

## Checklist de Lanzamiento

- [ ] Todas las páginas tienen metadatos únicos
- [ ] Schema.org implementado correctamente
- [ ] Sitemap enviado a Search Console
- [ ] robots.txt configurado
- [ ] Hreflang implementado
- [ ] Core Web Vitals en verde
- [ ] No hay errores 404
- [ ] HTTPS configurado
- [ ] Google My Business actualizado
- [ ] Alt text en todas las imágenes

