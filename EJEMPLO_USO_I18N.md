# Ejemplo Práctico: Convertir Página a i18n

## 🎯 Objetivo

Convertir la página `src/pages/es/gym.astro` para usar el sistema de traducciones.

## 📝 ANTES (Hardcoded)

```astro
---
import Layout from '@/layouts/Layout.astro';
---

<Layout
  title="Scorus GYM | Entrenamiento en Alicante"
  description="Gimnasio boutique en Alicante"
>
  <section>
    <h1>Scorus GYM</h1>
    <p>Tu espacio. Tu ritmo. Tu música.</p>
    <a href="/es/contacto">Reservar Sesión</a>
  </section>
</Layout>
```

## ✅ DESPUÉS (Con i18n)

### Paso 1: Crear traducciones

**`public/locales/es/gym.json`**
```json
{
  "meta": {
    "title": "Scorus GYM | Entrenamiento en Alicante",
    "description": "Gimnasio boutique en Alicante"
  },
  "hero": {
    "title": "Scorus GYM",
    "subtitle": "Tu espacio. Tu ritmo. Tu música.",
    "cta": "Reservar Sesión"
  }
}
```

**`public/locales/en/gym.json`**
```json
{
  "meta": {
    "title": "Scorus GYM | Training in Alicante",
    "description": "Boutique gym in Alicante"
  },
  "hero": {
    "title": "Scorus GYM",
    "subtitle": "Your space. Your pace. Your music.",
    "cta": "Book Session"
  }
}
```

### Paso 2: Actualizar componente

**`src/pages/es/gym.astro`**
```astro
---
import { t, changeLanguage } from 'astro-i18next';
import { localizePath } from 'astro-i18next';
import Layout from '@/layouts/Layout.astro';

// Establecer idioma de la página
changeLanguage('es');
---

<Layout
  title={t('gym:meta.title')}
  description={t('gym:meta.description')}
>
  <section>
    <h1>{t('gym:hero.title')}</h1>
    <p>{t('gym:hero.subtitle')}</p>
    <a href={localizePath('/contacto')}>
      {t('gym:hero.cta')}
    </a>
  </section>
</Layout>
```

**`src/pages/en/gym.astro`**
```astro
---
import { t, changeLanguage } from 'astro-i18next';
import { localizePath } from 'astro-i18next';
import Layout from '@/layouts/Layout.astro';

// Establecer idioma de la página
changeLanguage('en');
---

<Layout
  title={t('gym:meta.title')}
  description={t('gym:meta.description')}
>
  <section>
    <h1>{t('gym:hero.title')}</h1>
    <p>{t('gym:hero.subtitle')}</p>
    <a href={localizePath('/contact')}>
      {t('gym:hero.cta')}
    </a>
  </section>
</Layout>
```

## 🎨 Ventajas

| Antes | Después |
|-------|---------|
| Texto hardcoded | Centralizado en JSON |
| Un idioma | 4 idiomas |
| Difícil mantener | Fácil actualizar |
| No escalable | Totalmente escalable |

## 🔄 Proceso Completo

### 1. Identificar textos
```
✅ Títulos
✅ Descripciones
✅ Botones/CTAs
✅ Labels
✅ Mensajes
```

### 2. Crear JSON
```bash
public/locales/es/[namespace].json
public/locales/en/[namespace].json
public/locales/fr/[namespace].json
public/locales/de/[namespace].json
```

### 3. Importar en componente
```astro
import { t, changeLanguage, localizePath } from 'astro-i18next';
```

### 4. Usar funciones
```astro
{t('namespace:key')}           ← Traducción
{localizePath('/ruta')}        ← Link localizado
changeLanguage('en')           ← Forzar idioma
```

### 5. Probar
```bash
npm run dev

# Visitar:
http://localhost:4321/       → Español
http://localhost:4321/en/    → English
http://localhost:4321/fr/    → Français
http://localhost:4321/de/    → Deutsch
```

## 💡 Tips

### Organización de Keys

```json
{
  "meta": { "title": "...", "description": "..." },
  "hero": { "title": "...", "subtitle": "...", "cta": "..." },
  "about": { ... },
  "features": { ... },
  "cta": { ... }
}
```

### Reutilizar Traducciones

```astro
<!-- Usar 'common' para textos compartidos -->
<button>{t('common:cta.learn_more')}</button>
<button>{t('common:cta.contact_now')}</button>
```

### Variables Dinámicas

```json
{
  "welcome": "Bienvenido, {{name}}!"
}
```

```astro
<p>{t('welcome', { name: userName })}</p>
```

## 📋 Checklist por Página

- [ ] Crear JSON en 4 idiomas
- [ ] Importar `t`, `changeLanguage`, `localizePath`
- [ ] Llamar `changeLanguage(lang)` al inicio
- [ ] Reemplazar todos los textos con `t()`
- [ ] Convertir links con `localizePath()`
- [ ] Probar en los 4 idiomas
- [ ] Verificar que el LanguageSwitcher funciona

## 🚫 Errores Comunes

### ❌ Olvidar namespace
```astro
{t('hero.title')}  ❌ No funciona
{t('gym:hero.title')}  ✅ Correcto
```

### ❌ Link sin localizar
```astro
<a href="/contacto">  ❌ Siempre español
<a href={localizePath('/contacto')}>  ✅ Se adapta
```

### ❌ No cambiar idioma
```astro
<!-- Sin changeLanguage(), usa el default -->
changeLanguage('en')  ✅ Forzar inglés
```

## 🎯 Resultado Final

```
✅ 1 código fuente
✅ 4 versiones del sitio
✅ SEO optimizado
✅ Fácil mantenimiento
✅ Escalable
```

