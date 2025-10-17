# i18n Quick Start Guide

## 🚀 Guía Rápida para Usar i18n en Scorus Fitness

### 1️⃣ Usar traducciones en un componente Astro

```astro
---
// src/pages/es/index.astro
import { t } from 'astro-i18next';
import Layout from '@/layouts/Layout.astro';
---

<Layout>
  <h1>{t('home:hero.title')}</h1>
  <p>{t('home:hero.subtitle')}</p>
  <a href="#">{t('home:hero.cta_primary')}</a>
</Layout>
```

**Nota:** El formato es `namespace:key.subkey`

### 2️⃣ Crear links localizados

```astro
---
import { localizePath } from 'astro-i18next';
import { t } from 'astro-i18next';
---

<!-- ✅ CORRECTO -->
<a href={localizePath('/servicios')}>
  {t('nav.services')}
</a>

<!-- ❌ INCORRECTO -->
<a href="/servicios">Servicios</a>
```

### 3️⃣ Obtener idioma actual

```astro
---
import { l18next } from 'astro-i18next';

const currentLang = l18next.language; // 'es', 'en', 'fr', 'de'
const isSpanish = currentLang === 'es';
---

{isSpanish && <p>Contenido solo en español</p>}
```

### 4️⃣ Añadir nueva traducción

#### Paso 1: Editar JSON (todos los idiomas)

**`public/locales/es/common.json`**
```json
{
  "new_text": "Nuevo texto en español"
}
```

**`public/locales/en/common.json`**
```json
{
  "new_text": "New text in English"
}
```

#### Paso 2: Usar en componente

```astro
---
import { t } from 'astro-i18next';
---

<p>{t('common:new_text')}</p>
```

### 5️⃣ Crear nueva página traducida

#### Estructura de carpetas:
```
src/pages/
├── es/
│   └── nueva-pagina.astro
├── en/
│   └── nueva-pagina.astro  (o new-page.astro si traduces la URL)
├── fr/
│   └── nouvelle-page.astro
└── de/
    └── neue-seite.astro
```

#### Contenido de la página:

**`src/pages/es/nueva-pagina.astro`**
```astro
---
import { t, changeLanguage } from 'astro-i18next';
import Layout from '@/layouts/Layout.astro';

changeLanguage('es');
---

<Layout title={t('nueva_pagina.title')}>
  <h1>{t('nueva_pagina.hero.title')}</h1>
  <p>{t('nueva_pagina.hero.description')}</p>
</Layout>
```

**`src/pages/en/new-page.astro`**
```astro
---
import { t, changeLanguage } from 'astro-i18next';
import Layout from '@/layouts/Layout.astro';

changeLanguage('en');
---

<Layout title={t('nueva_pagina.title')}>
  <h1>{t('nueva_pagina.hero.title')}</h1>
  <p>{t('nueva_pagina.hero.description')}</p>
</Layout>
```

### 6️⃣ Configurar rutas traducidas

Si quieres que la URL también se traduzca (por ejemplo, `/servicios` → `/services`):

**`astro-i18next.config.mjs`**
```javascript
export default {
  // ...
  routes: {
    en: {
      "nueva-pagina": "new-page",
    },
    fr: {
      "nueva-pagina": "nouvelle-page",
    },
    de: {
      "nueva-pagina": "neue-seite",
    },
  },
};
```

### 7️⃣ Usar variables en traducciones

**JSON:**
```json
{
  "welcome": "Bienvenido, {{name}}!"
}
```

**Componente:**
```astro
---
import { t } from 'astro-i18next';
---

<p>{t('welcome', { name: 'Carlos' })}</p>
<!-- Resultado: "Bienvenido, Carlos!" -->
```

### 8️⃣ Pluralización

**JSON:**
```json
{
  "items": "{{count}} item",
  "items_plural": "{{count}} items"
}
```

**Componente:**
```astro
<p>{t('items', { count: 1 })}</p>  <!-- "1 item" -->
<p>{t('items', { count: 5 })}</p>  <!-- "5 items" -->
```

## 📋 Checklist para Nueva Funcionalidad

- [ ] Crear keys en `public/locales/es/{namespace}.json`
- [ ] Traducir a EN, FR, DE
- [ ] Usar `t()` en componentes
- [ ] Usar `localizePath()` para links
- [ ] Probar en los 4 idiomas

## 🎯 Namespaces Disponibles

| Namespace | Uso | Archivo |
|-----------|-----|---------|
| `common` | Nav, footer, CTAs | `common.json` |
| `home` | Página inicio | `home.json` |
| `services` | Servicios | `services.json` |
| `academy` | Academia | `academy.json` |
| `gym` | Gym | `gym.json` |
| `bio` | Biografía | `bio.json` |
| `contact` | Contacto | `contact.json` |

## 🆘 Errores Comunes

### Error: "Translation not found"

**Causa:** La key no existe en el JSON o el namespace está mal.

**Solución:**
1. Verifica que la key existe en todos los archivos de idioma
2. Usa el formato correcto: `namespace:key.subkey`
3. Reinicia el servidor `npm run dev`

### Error: Links rotos entre idiomas

**Causa:** No estás usando `localizePath()`

**Solución:**
```astro
<!-- ❌ MAL -->
<a href="/servicios">Servicios</a>

<!-- ✅ BIEN -->
<a href={localizePath('/servicios')}>{t('nav.services')}</a>
```

## 🔥 Pro Tips

1. **Usa autocomplete:** Importa tipos para autocompletado
2. **Organiza por secciones:** Agrupa traducciones relacionadas
3. **Documenta traducciones complejas:** Añade comentarios en el código
4. **Prueba siempre en todos los idiomas:** No asumas que funciona

## 📚 Más Información

Ver documentación completa: [`docs/I18N.md`](./I18N.md)

