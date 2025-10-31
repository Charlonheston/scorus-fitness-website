# 🔧 Solución Error 401 - Unauthorized

## ❌ **Problema:**
```
{"data":null,"error":{"status":401,"name":"UnauthorizedError","message":"Missing or invalid credentials"}}
```

## ✅ **Soluciones:**

### **Opción 1: Verificar Permisos del Token en Strapi**

1. Ve a **Strapi Admin** → **Settings** → **API Tokens**
2. Encuentra tu token o crea uno nuevo:
   - Click **"Create new API Token"**
   - **Name**: `Astro Blog`
   - **Token type**: `Read-only` o `Full access`
   - **Duration**: `Unlimited`
   - **Permissions**: 
     - ✅ **Article** → `find`
     - ✅ **Article** → `findOne`
3. Copia el nuevo token
4. Actualiza `.env`:
   ```env
   STRAPI_API_TOKEN=nuevo_token_aqui
   ```
5. **Reinicia Astro** (`Ctrl+C` y luego `npm run dev`)

---

### **Opción 2: Usar Permisos Públicos (Más Simple)**

Si no quieres usar tokens, puedes hacer la API pública:

1. Ve a **Strapi Admin** → **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
2. Marca los permisos:
   - ✅ **Article** → `find`
   - ✅ **Article** → `findOne`
3. Guarda
4. En `.env`, deja el token vacío:
   ```env
   STRAPI_API_TOKEN=
   ```
5. **Reinicia Astro**

---

### **Opción 3: Verificar que Astro Lea el .env**

1. Asegúrate de que `.env` esté en la raíz del proyecto `Nueva web bernat`
2. Verifica que no haya espacios extra en `.env`:
   ```env
   PUBLIC_STRAPI_URL=http://localhost:1337
   STRAPI_API_TOKEN=tu_token_sin_espacios
   ```
3. **Reinicia completamente Astro**:
   ```bash
   # Detén Astro (Ctrl+C)
   # Luego reinicia:
   npm run dev
   ```

---

### **Opción 4: Verificar el Token Directamente**

Prueba el token con curl o Postman:

```bash
curl -H "Authorization: Bearer TU_TOKEN" http://localhost:1337/api/articles?locale=es
```

Si esto funciona, el problema está en cómo Astro lee el `.env`.
Si no funciona, el token está mal o no tiene permisos.

---

## 🧪 **Test Rápido:**

1. Crea un token nuevo en Strapi
2. Cópialo al `.env`
3. Reinicia Astro
4. Revisa los logs en la consola - deberías ver:
   ```
   🔑 Token check: { hasToken: true, ... }
   ```

Si ves `hasToken: false`, Astro no está leyendo el `.env` correctamente.

---

## 💡 **Recomendación:**

**Para desarrollo local**: Usa **Opción 2** (permisos públicos) - es más simple y no requiere tokens.

**Para producción**: Usa **Opción 1** (con tokens) - más seguro.

