# 🚀 Configuración de Blog con SSR (Server-Side Rendering)

## 📋 **¿Qué problema resuelve esto?**

**Problema anterior:**
- Cuando creas o publicas un artículo nuevo en Strapi, no aparece en la web hasta hacer un **redeploy en Vercel**
- En local SÍ aparece inmediatamente porque estás en modo desarrollo

**Causa:**
- Astro por defecto genera páginas estáticas en **build time**
- Las páginas se generan una vez al hacer deploy y se cachean
- Los nuevos contenidos no se ven hasta un nuevo build

**Solución:**
- Convertir las páginas de blog a **SSR (Server-Side Rendering)**
- Las páginas se renderizan en cada request, mostrando siempre el contenido más reciente
- Los nuevos artículos aparecen **inmediatamente** sin necesidad de redeploy

---

## ✅ **Cambios Realizados**

### **1. Configuración de Astro (`astro.config.mjs`)**

```javascript
export default defineConfig({
  output: 'hybrid', // ✅ Cambiado de 'static' a 'hybrid'
  adapter: vercel(), // ✅ Agregado adaptador de Vercel
  // ... resto de configuración
});
```

**¿Qué hace esto?**
- `output: 'hybrid'` permite tener **páginas estáticas Y dinámicas** en el mismo proyecto
- Las páginas por defecto siguen siendo estáticas (rápidas)
- Solo las páginas de blog son dinámicas (siempre actualizadas)

### **2. Páginas de Blog Convertidas a SSR**

Archivos modificados:
- ✅ `/src/pages/es/blog/[slug].astro` - Artículos en español
- ✅ `/src/pages/es/blog/index.astro` - Lista de artículos en español
- ✅ `/src/pages/en/blog/[slug].astro` - Artículos en inglés
- ✅ `/src/pages/en/blog/index.astro` - Lista de artículos en inglés
- ✅ `/src/pages/fr/blog/[slug].astro` - Artículos en francés
- ✅ `/src/pages/fr/blog/index.astro` - Lista de artículos en francés
- ✅ `/src/pages/de/blog/[slug].astro` - Artículos en alemán
- ✅ `/src/pages/de/blog/index.astro` - Lista de artículos en alemán
- ✅ `/src/pages/hu/blog/[slug].astro` - Artículos en húngaro
- ✅ `/src/pages/hu/blog/index.astro` - Lista de artículos en húngaro

**Cambio clave en cada archivo:**
```typescript
// ✅ Al inicio del frontmatter
export const prerender = false;
```

Esto le dice a Astro: **"Esta página NO se debe pre-renderizar, hazla dinámica"**

### **3. Eliminación de `getStaticPaths()`**

**Antes (páginas estáticas):**
```typescript
export async function getStaticPaths() {
  const articles = await getArticles('es');
  return articles.map(article => ({
    params: { slug: article.attributes.slug },
    props: { article }
  }));
}

const { article } = Astro.props;
```

**Ahora (páginas dinámicas):**
```typescript
export const prerender = false;

const { slug } = Astro.params;
const article = await getArticleBySlug(slug, 'es');

if (!article) {
  return Astro.redirect('/es/blog');
}
```

**Ventaja:**
- El artículo se obtiene **en cada request** directamente desde Strapi
- Siempre muestra el contenido más reciente

---

## 🎯 **Ventajas de SSR para el Blog**

✅ **Contenido siempre actualizado**: Los nuevos artículos aparecen inmediatamente  
✅ **No necesitas redeploys**: Publica en Strapi y ya está disponible  
✅ **Perfecto para contenido dinámico**: Ideal para blogs y noticias  
✅ **SEO optimizado**: Google sigue indexando correctamente  
✅ **Sin complicaciones**: No necesitas webhooks ni revalidación

---

## ⚠️ **Desventajas a Considerar**

❌ **Ligeramente más lento**: Cada request hace una llamada a Strapi  
   - *Mitigación*: Strapi está en Render (rápido) y Vercel cachea automáticamente
   
❌ **Más costoso en Vercel**: Las funciones serverless tienen un límite de ejecución  
   - *Mitigación*: El plan gratuito de Vercel es muy generoso (100GB bandwidth)
   
❌ **Dependencia de Strapi**: Si Strapi cae, el blog no funciona  
   - *Mitigación*: Strapi en Render tiene alta disponibilidad

---

## 🔧 **Cómo Funciona en Producción (Vercel)**

### **Flujo de una petición:**

1. Usuario visita `/es/blog/conexion-neuromuscular`
2. Vercel ejecuta la función serverless de Astro
3. Astro hace un `fetch` a `https://scorus-cms-strapi.onrender.com/api/articles`
4. Strapi devuelve el artículo más reciente
5. Astro genera el HTML con el contenido actualizado
6. Vercel devuelve la página al usuario
7. **Vercel cachea el resultado por un tiempo** (optimización automática)

---

## 📊 **Comparación: Estático vs SSR**

| Aspecto | Estático (antes) | SSR (ahora) |
|---------|------------------|-------------|
| **Velocidad de carga** | ⚡ Muy rápido | 🚀 Rápido |
| **Contenido actualizado** | ❌ Solo en redeploy | ✅ Inmediato |
| **Costo en Vercel** | 💰 Muy bajo | 💰💰 Bajo-Medio |
| **Dependencia de Strapi** | ❌ No (build time) | ✅ Sí (request time) |
| **SEO** | ✅ Excelente | ✅ Excelente |
| **Complejidad** | 🟢 Simple | 🟢 Simple |

---

## 🧪 **Cómo Probar**

### **1. En Local**

```bash
# Iniciar servidor de desarrollo
npm run dev

# Crear un artículo nuevo en Strapi de producción
# Ir a: http://localhost:4321/es/blog
# ✅ El artículo nuevo debe aparecer inmediatamente
```

### **2. En Producción**

```bash
# Hacer deploy
git add .
git commit -m "Convert blog to SSR"
git push

# Esperar a que Vercel haga el deploy
# Crear un artículo nuevo en Strapi
# Visitar: https://tu-web.vercel.app/es/blog
# ✅ El artículo nuevo debe aparecer inmediatamente (sin redeploy)
```

---

## 🔄 **Volver a Páginas Estáticas (si quieres)**

Si por alguna razón quieres volver al modelo estático:

1. **Eliminar `export const prerender = false`** de todos los archivos de blog
2. **Restaurar `getStaticPaths()`** en las páginas `[slug].astro`
3. **Cambiar `output: 'static'`** en `astro.config.mjs`
4. **Eliminar `adapter: vercel()`** de `astro.config.mjs`

---

## 📚 **Referencias**

- [Astro: On-demand Rendering](https://docs.astro.build/en/guides/server-side-rendering/)
- [Astro: Vercel Adapter](https://docs.astro.build/en/guides/integrations-guide/vercel/)
- [Vercel: Serverless Functions](https://vercel.com/docs/functions)

---

**Desarrollado para Scorus Fitness** 🏋️‍♂️

