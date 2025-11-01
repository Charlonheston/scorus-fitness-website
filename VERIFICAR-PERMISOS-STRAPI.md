# 🔐 Verificación de Permisos en Strapi

## Problema
El artículo no se renderiza porque la API de Strapi está devolviendo `401 Unauthorized`.

## Solución: Configurar Permisos en Strapi

### Paso 1: Verificar Permisos del API Token

1. Abre Strapi: `http://localhost:1337/admin`
2. Ve a **Settings** → **API Tokens**
3. Busca el token que creaste (o crea uno nuevo):
   - **Name**: `Astro Blog API`
   - **Token type**: `Full access` (o `Custom`)
   - **Token duration**: `Unlimited`
4. Si es **Custom**, verifica que tenga estos permisos marcados:
   - **Article** → `find` ✅
   - **Article** → `findOne` ✅

### Paso 2: Verificar Permisos del Rol Public

1. En Strapi, ve a **Settings** → **Users & Permissions Plugin** → **Roles**
2. Haz clic en **Public**
3. En la sección **Article**, marca:
   - ✅ `find` (ver lista de artículos)
   - ✅ `findOne` (ver un artículo individual)
4. Haz clic en **Save** en la esquina superior derecha

### Paso 3: Verificar que el Artículo esté Publicado

1. Ve a **Content Manager** → **Article**
2. Verifica que el artículo tenga el estado **Published** (verde)
3. Si está en **Draft**, haz clic en **Publish**

### Paso 4: Verificar el Locale

1. En **Content Manager** → **Article**
2. Verifica que el artículo tenga el **locale** correcto (ES, EN, etc.)
3. Si creaste el artículo en español, debe tener `locale: es`

### Paso 5: Probar la API directamente

Abre tu navegador y prueba estas URLs:

**Con token (recomendado para producción):**
```
http://localhost:1337/api/articles?locale=es
```

Si quieres probar sin token (requiere permisos Public):
```
http://localhost:1337/api/articles?locale=es
```

### Paso 6: Regenerar Token (si es necesario)

Si el token no funciona:

1. Ve a **Settings** → **API Tokens**
2. Elimina el token antiguo
3. Crea uno nuevo:
   - **Name**: `Astro Blog API`
   - **Token type**: `Full access`
   - Copia el token generado
4. Actualiza `.env.local`:
   ```
   STRAPI_API_TOKEN=tu_nuevo_token_aquí
   ```

---

## ✅ Checklist

- [ ] API Token creado y con permisos `find` y `findOne` en Article
- [ ] Rol Public tiene permisos `find` y `findOne` en Article
- [ ] Artículo está publicado (no en Draft)
- [ ] Artículo tiene el locale correcto (es, en, etc.)
- [ ] Token actualizado en `.env.local`

---

## 🧪 Probar Conexión

Ejecuta el script de diagnóstico:

```powershell
cd "C:\Users\carlo\Desktop\Nueva web bernat"
# Cargar variables primero
$envContent = Get-Content .env.local
$envContent | ForEach-Object { 
    if ($_ -match '^([^=]+)=(.*)$') { 
        $key = $matches[1]
        $value = $matches[2]
        [Environment]::SetEnvironmentVariable($key, $value, 'Process')
    }
}
node test-strapi-connection.js
```

