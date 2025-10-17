# 💻 Guía de Desarrollo

## Setup del Entorno

### Requisitos
- Node.js 20.x LTS (ver `.nvmrc`)
- npm o pnpm
- Git
- Editor de código (VS Code recomendado)

### Instalación

```bash
# Usar la versión correcta de Node
nvm use

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

## Workflow de Desarrollo

### 1. Crear Nueva Rama

```bash
git checkout -b feat/nueva-funcionalidad
```

### 2. Desarrollar

El servidor de desarrollo se iniciará en `http://localhost:4321`

Hot Module Reload está activado - los cambios se reflejan inmediatamente.

### 3. Commits

Este proyecto usa [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Ejemplos
git commit -m "feat: añadir componente Hero"
git commit -m "fix: corregir navegación móvil"
git commit -m "docs: actualizar README"
```

Tipos válidos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bugs
- `docs`: Documentación
- `style`: Formateo (sin cambios de código)
- `refactor`: Refactorización
- `perf`: Mejoras de performance
- `test`: Tests
- `chore`: Mantenimiento

### 4. Lint y Format

```bash
# Ejecutar linting
npm run lint

# Corregir automáticamente
npm run lint:fix

# Formatear código
npm run format
```

## Componentes Astro vs React

### ¿Cuándo usar Astro?

**Usa componentes `.astro` para**:
- Contenido estático
- Layouts y estructura
- SEO components
- Cualquier cosa que no requiera estado del cliente

**Ventajas**:
- 0KB JavaScript
- Performance óptima
- HTML semántico

**Ejemplo**:
```astro
---
// Header.astro
import { SITE_CONFIG } from '@lib/constants';
---

<header class="sticky top-0 bg-white">
  <h1>{SITE_CONFIG.name}</h1>
</header>
```

### ¿Cuándo usar React?

**Usa componentes React Islands para**:
- Formularios con validación
- Carousels/Sliders
- Componentes con estado
- Interactividad del cliente

**Client Directives**:
- `client:load`: Carga inmediata (crítico)
- `client:idle`: Carga cuando el navegador está idle
- `client:visible`: Carga al entrar en viewport (recomendado)

**Ejemplo**:
```astro
---
import Carousel from '@components/react/Carousel.tsx';
---

<Carousel client:visible data={slides} />
```

## Estructura de Componentes

### Componente Astro

```astro
---
/**
 * Descripción del componente
 */

import type { Props as BaseProps } from './types';

export interface Props extends BaseProps {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<div class="component">
  <h2>{title}</h2>
  {description && <p>{description}</p>}
  <slot />
</div>

<style>
  .component {
    /* Estilos scoped */
  }
</style>
```

### Componente React Island

```tsx
// Carousel.tsx
import { useState } from 'react';

interface CarouselProps {
  slides: Array<{
    title: string;
    image: string;
  }>;
}

export default function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="carousel">
      {/* Implementación */}
    </div>
  );
}
```

## Estilos con Tailwind

### Utility Classes

```astro
<button class="rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700">
  Click me
</button>
```

### Componentes Custom

```astro
<button class="btn btn-primary">
  Click me
</button>
```

Definidos en `src/styles/global.css`:

```css
@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white hover:bg-primary-700;
  }
}
```

### Utilidad `cn()`

Para combinar clases condicionalmente:

```tsx
import { cn } from '@lib/utils';

<div class={cn(
  'base-class',
  variant === 'primary' && 'primary-class',
  className
)}>
```

## Content Collections

### Crear Nuevo Post

```bash
# Crear archivo en src/content/blog/
touch src/content/blog/nuevo-post.md
```

```markdown
---
title: 'Título del Post'
description: 'Descripción corta'
pubDate: 2024-10-16
author: 'Bernat Scorus'
tags: ['nutrición', 'fitness']
---

# Contenido del post

Escribe en **Markdown** o **MDX**.
```

### Acceder a Content Collections

```astro
---
import { getCollection } from 'astro:content';

const posts = await getCollection('blog');
---

{posts.map(post => (
  <a href={`/blog/${post.slug}`}>{post.data.title}</a>
))}
```

## TypeScript

### Path Aliases

Configurados en `tsconfig.json`:

```typescript
import Header from '@components/layout/Header.astro';
import { SITE_CONFIG } from '@lib/constants';
import type { BlogPost } from '@types/blog';
```

### Tipos de Props

Siempre tipar las props:

```astro
---
export interface Props {
  title: string;
  optional?: number;
}

const { title, optional = 0 } = Astro.props;
---
```

## Testing

### Unit Tests (Vitest)

```bash
npm test
```

```typescript
// utils.test.ts
import { describe, it, expect } from 'vitest';
import { slugify } from '@lib/utils';

describe('slugify', () => {
  it('should convert text to slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
});
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

## Build y Preview

```bash
# Build para producción
npm run build

# Preview del build
npm run preview
```

## Debugging

### Astro Dev Toolbar

Aparece automáticamente en desarrollo (esquina inferior)

### Console Logs

```astro
---
console.log('Server-side log');
---

<script>
  console.log('Client-side log');
</script>
```

### React DevTools

Funciona normalmente con React Islands

## Best Practices

### Performance

1. **Astro Nativo First**: Usar `.astro` siempre que sea posible
2. **React Estratégico**: Solo para interactividad necesaria
3. **Images**: Usar `<Image>` de Astro
4. **Lazy Loading**: `client:visible` para componentes below the fold

### SEO

1. **Usar el componente SEO**: En todas las páginas
2. **Structured Data**: Añadir schemas relevantes
3. **Alt Text**: En todas las imágenes
4. **Semantic HTML**: `<article>`, `<section>`, `<nav>`, etc.

### Accesibilidad

1. **ARIA Labels**: En elementos interactivos
2. **Keyboard Navigation**: Testar con Tab
3. **Color Contrast**: Mínimo WCAG AA
4. **Focus States**: Visible en todos los elementos

### Code Quality

1. **ESLint**: Corregir todos los warnings
2. **Prettier**: Formatear antes de commit
3. **TypeScript**: No usar `any`
4. **Comments**: Solo para lógica compleja

