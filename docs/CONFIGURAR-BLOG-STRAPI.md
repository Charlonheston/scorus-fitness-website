# 📝 Configurar Blog con Strapi - Guía Rápida

## ✅ **Lo Creado:**

1. ✅ Utilidad para consumir Strapi API (`src/lib/strapi.ts`)
2. ✅ Página de listado de blog en español (`src/pages/es/blog/index.astro`)
3. ✅ Página individual de artículo en español (`src/pages/es/blog/[slug].astro`)
4. ✅ Páginas en inglés (`src/pages/en/blog/index.astro` y `[slug].astro`)

---

## 🔧 **PASO 1: Configurar Variables de Entorno**

Crea un archivo `.env` en la raíz del proyecto Astro:

```env
# Strapi Configuration
PUBLIC_STRAPI_URL=http://localhost:1337

# API Token (opcional - solo si usas autenticación)
# Si configuraste permisos públicos, déjalo vacío
STRAPI_API_TOKEN=
```

**O si ya tienes un `.env`**, añade estas líneas.

---

## 🔑 **PASO 2: Obtener API Token (Opcional)**

### **Si usas permisos públicos (recomendado para empezar):**
- No necesitas token, deja `STRAPI_API_TOKEN=` vacío

### **Si necesitas autenticación:**
1. En Strapi admin, ve a **Settings → API Tokens**
2. Click en **"Create new API Token"**
3. Configura:
   - **Name:** `Astro Blog Frontend`
   - **Token type:** `Read-only`
   - **Token duration:** `Unlimited` (o el que prefieras)
   - **Token permissions:** 
     - ✅ Article → `find`
     - ✅ Article → `findOne`
4. Copia el token generado
5. Añádelo a `.env`: `STRAPI_API_TOKEN=tu_token_aqui`

---

## 🚀 **PASO 3: Probar**

1. **Asegúrate de que Strapi esté corriendo:**
   ```bash
   cd C:\Users\carlo\Desktop\scorus-cms-strapi
   npm run develop
   ```

2. **Inicia el proyecto Astro:**
   ```bash
   cd C:\Users\carlo\Desktop\Nueva web bernat
   npm run dev
   ```

3. **Abre en el navegador:**
   - Listado: `http://localhost:4321/es/blog`
   - Artículo: `http://localhost:4321/es/blog/[slug-de-tu-articulo]`
   - Inglés: `http://localhost:4321/en/blog`

---

## 📋 **Verificación:**

### **Verificar que la API funciona:**
Abre en el navegador:
```
http://localhost:1337/api/articles?locale=es
```

Deberías ver un JSON con tus artículos.

### **Si hay errores:**
1. **CORS Error:** Configura CORS en Strapi (Settings → Middlewares → CORS)
2. **404 Not Found:** Verifica que el artículo esté **Publicado**
3. **Sin datos:** Verifica que hayas configurado permisos en Settings → Roles → Public

---

## ✅ **Checklist:**

- [ ] Variables de entorno configuradas (`.env`)
- [ ] Strapi corriendo en `http://localhost:1337`
- [ ] Permisos de API configurados (find, findOne)
- [ ] Artículo creado y **publicado** en Strapi
- [ ] Astro corriendo en `http://localhost:4321`
- [ ] Página de blog accesible

---

## 🌐 **URLs de las Páginas:**

- **ES:** `http://localhost:4321/es/blog`
- **EN:** `http://localhost:4321/en/blog`
- **FR:** (pendiente crear)
- **DE:** (pendiente crear)
- **HU:** (pendiente crear)

---

## 📝 **Próximos Pasos:**

Una vez que funcione:
1. ✅ Añadir páginas para FR, DE, HU
2. ✅ Mejorar diseño y estilos
3. ✅ Añadir más campos al Content Type (categorías, tags, imágenes, etc.)
4. ✅ Optimizar imágenes

---

## ❓ **¿Problemas?**

Si ves errores:
- Revisa la consola del navegador
- Revisa la terminal de Astro
- Verifica que Strapi esté corriendo
- Verifica los permisos de API

¡Avísame si necesitas ayuda! 🚀

