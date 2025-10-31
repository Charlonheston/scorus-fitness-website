# 🔍 Debug Problema en Producción

## 🔗 **URL de Producción:**
```
https://scorus-cms-strapi.onrender.com/api/articles?locale=es&sort=createdAt%3Adesc&pagination%5BpageSize%5D=100
```

---

## ❓ **Problema:**
Mismo problema que había en local - probablemente:
1. **401 Unauthorized** - Token no válido o sin permisos
2. **Estructura de datos diferente** - Strapi devuelve formato plano en producción
3. **Artículos filtrados** - No se muestran porque falta algún campo

---

## 🔍 **Pasos para Diagnosticar:**

### **1. Probar la API Directamente:**

Abre en el navegador:
```
https://scorus-cms-strapi.onrender.com/api/articles?locale=es
```

**Si ves:**
- ✅ JSON con datos → La API funciona, el problema está en el código
- ❌ `{"data":null,"error":{"status":401...}}` → Problema de autenticación/permisos
- ❌ `{"data":null,"error":{...}}` → Otro error de Strapi

### **2. Verificar Permisos en Strapi Producción:**

1. Ve a: **https://scorus-cms-strapi.onrender.com/admin**
2. **Settings** → **API Tokens**
   - Verifica que el token tenga permisos: Article → `find`, `findOne`
3. **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
   - Verifica que estén marcados: Article → `find`, `findOne`

### **3. Verificar Variables en Vercel:**

1. Ve a **Vercel Dashboard** → Tu proyecto → **Settings** → **Environment Variables**
2. Verifica que existan:
   - ✅ `PUBLIC_STRAPI_URL` = `https://scorus-cms-strapi.onrender.com`
   - ✅ `STRAPI_API_TOKEN` = `<tu-token>`
3. Verifica que estén marcadas para **Production**

### **4. Ver Logs en Vercel:**

1. Ve a **Deployments** → Click en el último deployment
2. Ve a **Functions** o **Build Logs**
3. Busca errores relacionados con:
   - `Failed to fetch`
   - `401 Unauthorized`
   - `Cannot read property...`

---

## 🔧 **Soluciones:**

### **Solución 1: Verificar Estructura de Datos**

El código ya maneja ambos formatos, pero podemos añadir más logging para ver qué llega:

**En producción, revisa la consola del navegador (F12) para ver:**
- Si hay errores de fetch
- Si la respuesta tiene la estructura esperada

### **Solución 2: Usar Permisos Públicos (Más Simple)**

1. En Strapi producción: **Settings** → **Roles** → **Public**
2. Marca: Article → `find`, `findOne`
3. En Vercel: Deja `STRAPI_API_TOKEN` vacía
4. Redeploy

### **Solución 3: Crear Token Nuevo en Producción**

1. Ve a Strapi producción
2. **Settings** → **API Tokens** → **Create new**
3. Configura permisos correctos
4. Actualiza en Vercel
5. Redeploy

---

## 🧪 **Test Rápido:**

Abre la consola del navegador (F12) en tu sitio de producción y busca:
- Errores en la pestaña **Console**
- Requests fallidos en la pestaña **Network**

Comparte conmigo:
1. ¿Qué ves al abrir `https://scorus-cms-strapi.onrender.com/api/articles?locale=es` directamente?
2. ¿Hay errores en la consola del navegador de tu sitio de producción?
3. ¿Las variables están correctamente configuradas en Vercel?

