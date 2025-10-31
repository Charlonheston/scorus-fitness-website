# ⚙️ Configurar Vercel para Producción - Paso a Paso

## 🔗 **URL de tu Strapi:**
```
https://scorus-cms-strapi.onrender.com
```

---

## 📋 **Paso 1: Obtener API Token de Strapi (PRIMERO)**

**Antes de configurar Vercel, necesitas el token:**

1. Ve a: **https://scorus-cms-strapi.onrender.com/admin**
2. Crea tu usuario admin (si aún no lo has hecho)
3. Ve a **Settings** → **API Tokens**
4. Click **"Create new API Token"**
5. Configura:
   - **Name**: `Astro Production`
   - **Token type**: `Read-only`
   - **Duration**: `Unlimited`
   - **Permissions**: 
     - ✅ **Article** → `find`
     - ✅ **Article** → `findOne`
6. Click **"Save"**
7. **Copia el token** (solo se muestra una vez) ⚠️

---

## 📋 **Paso 2: Configurar Variables en Vercel**

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto **"Nueva web bernat"** (o como se llame)
3. Ve a **Settings** → **Environment Variables**

### **Añadir Variables (una por una):**

Click en **"Add Environment Variable"** para cada una:

| Variable | Value | Environments |
|----------|-------|--------------|
| `PUBLIC_STRAPI_URL` | `https://scorus-cms-strapi.onrender.com` | ✅ Production<br>✅ Preview<br>✅ Development |
| `STRAPI_API_TOKEN` | `<pega-el-token-que-creaste>` | ✅ Production<br>✅ Preview<br>✅ Development |

**Importante:**
- ✅ Marca **todas las opciones** (Production, Preview, Development)
- ✅ `PUBLIC_STRAPI_URL` **DEBE** tener el prefijo `PUBLIC_` (es pública)
- ✅ `STRAPI_API_TOKEN` **NO** tiene prefijo `PUBLIC_` (es privada, solo servidor)

---

## 📋 **Paso 3: Redeploy**

Después de añadir las variables:

1. Ve a **Deployments**
2. Click en los **3 puntos** (...) del último deployment
3. Selecciona **"Redeploy"**
4. Confirma el redeploy

**O simplemente:**
- Haz un nuevo commit y push a GitHub (Vercel deploy automático)

---

## ✅ **Paso 4: Verificar**

Después del redeploy:

1. Ve a tu sitio en Vercel: `https://tu-sitio.vercel.app/es/blog`
2. Deberías ver tus artículos de Strapi
3. Si no aparecen, verifica:
   - ✅ Que los artículos estén **publicados** en Strapi
   - ✅ Que el token tenga permisos correctos
   - ✅ Revisa la consola del navegador (F12) para errores

---

## 🔧 **Variables de Entorno - Resumen:**

### **En Vercel:**

```env
PUBLIC_STRAPI_URL=https://scorus-cms-strapi.onrender.com
STRAPI_API_TOKEN=tu-token-aqui
```

### **En tu `.env.local` local (para desarrollo):**

```env
PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=tu-token-local-o-deja-vacio-si-usas-permisos-publicos
```

---

## 🌐 **Alternativa: Usar Permisos Públicos**

Si prefieres **NO usar tokens** (más simple):

### **En Strapi:**
1. **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
2. Marca:
   - ✅ **Article** → `find`
   - ✅ **Article** → `findOne`
3. Guarda

### **En Vercel:**
```env
PUBLIC_STRAPI_URL=https://scorus-cms-strapi.onrender.com
STRAPI_API_TOKEN=  (deja vacío)
```

---

## ⚠️ **Troubleshooting:**

### **Error: "Failed to fetch" o "401 Unauthorized"**

- Verifica que `STRAPI_API_TOKEN` esté correctamente configurada
- Verifica que el token tenga permisos en Strapi
- Verifica que `PUBLIC_STRAPI_URL` apunte a la URL correcta (sin `/admin`)

### **Error: "CORS" o "Network Error"**

- Verifica que Strapi esté accesible: `https://scorus-cms-strapi.onrender.com/api/articles`
- Si ves error CORS, configura CORS en Strapi (ver `docs/DEPLOY-RENDER.md`)

### **No se ven artículos**

- Verifica que los artículos estén **publicados** en Strapi (no en Draft)
- Verifica permisos del token o permisos públicos
- Revisa la consola del navegador para errores específicos

---

## ✅ **Checklist:**

- [ ] Strapi desplegado y funcionando en Render
- [ ] Admin de Strapi accesible
- [ ] API Token creado en Strapi (y copiado)
- [ ] Variables añadidas en Vercel
- [ ] Redeploy realizado
- [ ] Blog funcionando en producción

---

## 🎉 **¡Listo!**

Una vez configurado, tu blog estará completamente funcional en producción con contenido desde Strapi.

¿Necesitas ayuda con algún paso específico?

