# ✅ Probar el Blog - Checklist

## 🔧 **Configuración Completada:**

1. ✅ Archivo `.env` creado con:
   - `PUBLIC_STRAPI_URL=http://localhost:1337`
   - `STRAPI_API_TOKEN` configurado

2. ✅ API Token creado en Strapi

3. ✅ Páginas de blog creadas:
   - `/es/blog` - Listado en español
   - `/es/blog/[slug]` - Artículo individual en español
   - `/en/blog` - Listado en inglés
   - `/en/blog/[slug]` - Artículo individual en inglés

---

## 🚀 **Próximos Pasos para Probar:**

### **1. Verificar Permisos del API Token en Strapi:**

1. Ve a **Settings → API Tokens**
2. Verifica que tu token tenga permisos para:
   - ✅ **Article** → `find`
   - ✅ **Article** → `findOne`

### **2. Verificar que el Artículo esté Publicado:**

1. Ve a **Content Manager → Article**
2. Verifica que tu artículo tenga el estado **"Published"** (verde)
3. Si está en "Draft", click en **"Publish"**

### **3. Probar la API directamente:**

Abre en el navegador (con el token en el header o en la URL si funciona):

```
http://localhost:1337/api/articles?locale=es
```

O con el token:
```
http://localhost:1337/api/articles?locale=es&token=TU_TOKEN
```

### **4. Reiniciar Astro:**

Después de crear `.env`, **reinicia el servidor de Astro** para que cargue las variables:

```bash
# Detén Astro (Ctrl+C) si está corriendo
# Luego:
npm run dev
```

### **5. Probar las Páginas:**

1. **Listado de artículos:**
   - `http://localhost:4321/es/blog`

2. **Artículo individual:**
   - `http://localhost:4321/es/blog/[slug-de-tu-articulo]`
   - Reemplaza `[slug-de-tu-articulo]` con el slug real de tu artículo

---

## ❌ **Si Ves Error 401:**

Significa que el token no tiene permisos o está mal configurado:

1. Verifica en Strapi → Settings → API Tokens que el token tenga permisos
2. O configura permisos públicos en Settings → Roles → Public

---

## ✅ **Si Todo Funciona:**

Verás:
- ✅ Listado de artículos en `/es/blog`
- ✅ Cada artículo es clickeable
- ✅ Al hacer click, ves el artículo completo
- ✅ Contenido renderizado correctamente

---

## 📝 **Notas:**

- El token ya está configurado en `.env`
- Si cambias el token, reinicia Astro
- Si no ves artículos, verifica que estén **publicados** en Strapi

---

## 🎯 **Siguiente:**

Una vez que funcione:
1. ✅ Mejorar diseño y estilos
2. ✅ Añadir más campos (imágenes, categorías, etc.)
3. ✅ Añadir páginas para FR, DE, HU

¡Avísame cuando pruebes y si hay algún problema! 🚀

