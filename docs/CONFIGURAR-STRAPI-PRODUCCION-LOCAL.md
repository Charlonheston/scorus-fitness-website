# 🔗 Configurar Web Local para Usar Strapi de Producción

Guía para hacer que tu web de Astro en **local** use el Strapi que está en **producción** (Render), en lugar del Strapi local.

---

## 📋 **Pasos Rápidos**

### **1️⃣ Crear Token de API en Strapi de Producción**

1. Ve a: **https://scorus-cms-strapi.onrender.com/admin**
2. Inicia sesión
3. Ve a **Settings** → **API Tokens**
4. Click **"Create new API Token"**
5. Configura:
   - **Name**: `Astro Local Development`
   - **Token type**: `Read-only`
   - **Duration**: `Unlimited`
   - **Permissions**: 
     - ✅ **Article** → `find`
     - ✅ **Article** → `findOne`
6. Click **"Save"**
7. **Copia el token** (solo se muestra una vez) ⚠️

---

### **2️⃣ Crear Archivo `.env.local`**

En la raíz de tu proyecto Astro (`Nueva web bernat/`), crea un archivo `.env.local`:

```env
# URL del Strapi en PRODUCCIÓN
PUBLIC_STRAPI_URL=https://scorus-cms-strapi.onrender.com

# Token de API de Strapi (de producción)
STRAPI_API_TOKEN=tu_token_de_produccion_aqui
```

**⚠️ IMPORTANTE:**
- Reemplaza `tu_token_de_produccion_aqui` con el token que copiaste en el paso 1
- El archivo `.env.local` está en `.gitignore` y NO se subirá a Git

---

### **3️⃣ Reiniciar el Servidor de Desarrollo**

```bash
# Detener el servidor (Ctrl + C)
# Luego reiniciar
npm run dev
```

**¡Listo!** Tu web local ahora está usando el Strapi de producción. 🎉

---

## 🔍 **Verificar que Funciona**

1. Abre la consola del navegador (F12)
2. Ve a la pestaña **Console**
3. Deberías ver un log que dice:
   ```
   🔧 Strapi Config: {
     url: "https://scorus-cms-strapi.onrender.com",
     hasToken: true,
     tokenLength: 256
   }
   ```
4. Ve a `/es/blog` y deberías ver los artículos de producción

---

## 📝 **Script Automático (PowerShell)**

Si prefieres usar un script, ejecuta:

```powershell
.\setup-strapi-production.ps1
```

Este script te guiará paso a paso para configurar el `.env.local`.

---

## 🔄 **Volver a Strapi Local**

Si en algún momento quieres volver a usar Strapi local:

**Opción A: Comentar las variables**
```env
# PUBLIC_STRAPI_URL=https://scorus-cms-strapi.onrender.com
# STRAPI_API_TOKEN=tu_token

# Usar Strapi local (fallback en strapi.ts)
PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=
```

**Opción B: Eliminar el archivo**
```bash
# Eliminar .env.local para usar los valores por defecto
rm .env.local
```

---

## ❓ **Preguntas Frecuentes**

### **¿Por qué usar Strapi de producción en local?**

✅ **Ventajas:**
- Siempre trabajas con los datos reales
- No necesitas tener Strapi corriendo localmente
- Perfecto para probar cambios en la web antes de desplegar

### **¿Afecta esto a producción?**

❌ **NO.** Tu web local solo **lee** datos de producción. No puedes modificar contenido desde local (solo leer).

### **¿Necesito tener Strapi local corriendo?**

❌ **NO.** Si usas Strapi de producción, no necesitas tener Strapi local.

### **¿Qué pasa si no tengo token?**

Si no configuras `STRAPI_API_TOKEN`, la web intentará hacer requests sin autenticación. Esto solo funciona si:
- Strapi tiene permisos públicos configurados
- O si estás usando un token que tenga permisos

**Recomendación:** Siempre usa un token para mayor seguridad.

---

## 🔧 **Configuración Actual en el Código**

El archivo `src/lib/strapi.ts` está configurado así:

```typescript
// Prioridad: 1. Variable de entorno, 2. Fallback a localhost
const STRAPI_URL = import.meta.env.PUBLIC_STRAPI_URL || 'http://localhost:1337';
const STRAPI_API_TOKEN = import.meta.env.STRAPI_API_TOKEN || import.meta.env.PUBLIC_STRAPI_API_TOKEN || '';
```

**Esto significa:**
- Si defines `PUBLIC_STRAPI_URL` en `.env.local`, se usará esa URL
- Si no la defines, usará `http://localhost:1337` (Strapi local)
- El token funciona igual: primero busca en variables de entorno

---

## ✅ **Checklist**

- [ ] Token de API creado en Strapi de producción
- [ ] Archivo `.env.local` creado con `PUBLIC_STRAPI_URL` y `STRAPI_API_TOKEN`
- [ ] Servidor de desarrollo reiniciado
- [ ] Verificado en consola del navegador que usa la URL correcta
- [ ] Artículos de producción se muestran en `/es/blog`

---

**Desarrollado para Scorus** 🏋️‍♂️


