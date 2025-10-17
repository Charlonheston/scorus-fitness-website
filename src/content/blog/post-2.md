---
title: 'Construyendo sitios estáticos con Astro'
description: 'Aprende cómo crear sitios web estáticos increíblemente rápidos'
pubDate: 2024-02-20
author: 'Bernat'
tags: ['astro', 'tutorial', 'desarrollo web']
---

# Construyendo sitios estáticos con Astro

En este post vamos a explorar cómo construir sitios web estáticos usando Astro.

## Ventajas de los sitios estáticos

Los sitios estáticos ofrecen muchas ventajas:

1. **Velocidad**: Sin procesamiento del servidor
2. **Seguridad**: Menos vectores de ataque
3. **Escalabilidad**: Fácil de distribuir mediante CDN
4. **Costo**: Hosting económico o gratuito

## Estructura de un proyecto Astro

Un proyecto típico de Astro tiene esta estructura:

```
/
├── public/
├── src/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   └── content/
└── package.json
```

## Content Collections

Las Content Collections de Astro permiten organizar y validar tu contenido:

```typescript
const blog = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
  }),
});
```

## Conclusión

Astro hace que crear sitios estáticos sea una experiencia increíble. ¡Pruébalo hoy mismo!

