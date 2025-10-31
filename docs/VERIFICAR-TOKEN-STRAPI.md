# 🔍 Verificar Token en Strapi

## ✅ **Pasos para Verificar y Corregir:**

### **1. Verificar que el Token Exista en Strapi:**

1. Ve a **Strapi Admin**: `http://localhost:1337/admin`
2. Click en **Settings** → **API Tokens**
3. Busca el token o verifica que exista

### **2. Si el Token NO Existe o fue Eliminado:**

**Crear un Nuevo Token:**

1. Click en **"Create new API Token"**
2. Configura:
   - **Name**: `Astro Blog`
   - **Token type**: `Read-only` (recomendado) o `Full access`
   - **Duration**: `Unlimited`
   - **Token duration**: Dejar vacío para ilimitado
3. Click en **"Save"**
4. **IMPORTANTE**: Copia el token inmediatamente (solo se muestra una vez)
5. Actualiza `.env` y `.env.local` con el nuevo token:
   ```env
   STRAPI_API_TOKEN=nuevo_token_aqui
   ```
6. **Reinicia Astro completamente** (Ctrl+C y luego `npm run dev`)

### **3. Verificar Permisos del Token:**

1. En **API Tokens**, click en tu token
2. Verifica que tenga permisos marcados:
   - ✅ **Article** → `find`
   - ✅ **Article** → `findOne`
3. Si no están marcados, márcalos y guarda

### **4. Alternativa: Usar Permisos Públicos (Sin Token):**

Si prefieres no usar tokens:

1. Ve a **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
2. Marca:
   - ✅ **Article** → `find`
   - ✅ **Article** → `findOne`
3. Guarda
4. En `.env` y `.env.local`, deja el token vacío:
   ```env
   STRAPI_API_TOKEN=
   ```
5. **Reinicia Astro**

---

## 🧪 **Probar el Token Directamente:**

### **Con cURL:**
```bash
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:1337/api/articles?locale=es
```

### **En el Navegador (si tienes permisos públicos):**
```
http://localhost:1337/api/articles?locale=es
```

### **Con Postman/Insomnia:**
- **Method**: GET
- **URL**: `http://localhost:1337/api/articles?locale=es`
- **Headers**: 
  - `Authorization: Bearer TU_TOKEN`

---

## 🔍 **Verificar Logs en Astro:**

Cuando recargas `/es/blog`, deberías ver en la consola:

```
🔧 Strapi Config: { hasToken: true, tokenLength: 256, ... }
🔑 Token check: { hasToken: true, ... }
📡 Fetching: { hasAuthHeader: true, ... }
```

Si ves `hasToken: false` o `hasAuthHeader: false`, Astro no está leyendo el `.env`.

---

## ✅ **Solución Recomendada:**

**Para desarrollo local**, usa **permisos públicos** (más simple):
1. Configura permisos públicos en Strapi (paso 4 arriba)
2. Deja `STRAPI_API_TOKEN=` vacío en `.env`
3. Reinicia Astro

**Para producción**, usa tokens con permisos específicos.

