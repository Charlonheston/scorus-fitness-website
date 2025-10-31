# 🐛 Debug del Blog - Problemas Comunes

## ❌ **Problema: No se ven artículos**

### **Pasos para diagnosticar:**

#### 1. **Verificar que Strapi está corriendo:**
```
http://localhost:1337/admin
```
- Debe estar accesible
- Debe poder iniciar sesión

#### 2. **Verificar que los artículos estén PUBLICADOS:**
1. Ve a **Content Manager → Article**
2. Verifica que los artículos tengan estado **"Published"** (verde)
3. Si están en "Draft", haz click en **"Publish"**

#### 3. **Probar la API directamente:**

Abre en el navegador (reemplaza `TU_TOKEN` con tu token real):
```
http://localhost:1337/api/articles?locale=es&sort=createdAt:desc
```

O con token en header (usa Postman/Insomnia):
```
GET http://localhost:1337/api/articles?locale=es&sort=createdAt:desc
Authorization: Bearer TU_TOKEN
```

#### 4. **Verificar permisos del token:**
1. Ve a **Settings → API Tokens**
2. Verifica que tu token tenga permisos para:
   - ✅ Article → `find`
   - ✅ Article → `findOne`

#### 5. **Verificar variables de entorno:**
Asegúrate de que `.env` tenga:
```env
PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=tu_token_aqui
```

#### 6. **Ver logs en la consola del servidor:**
Cuando cargas `/es/blog`, deberías ver logs como:
```
🔍 Strapi API Response: {...}
📊 Articles count: X
📝 Article "...": {...}
✅ Valid articles after filtering: X
📚 Articles in page: X
```

---

## 🔍 **Qué revisar en los logs:**

### **Si ves `Articles count: 0`:**
- Los artículos no están publicados en Strapi
- O no hay artículos creados

### **Si ves `Valid articles after filtering: 0` pero `Articles count: X`:**
- Los artículos no tienen `title` o `slug`
- La estructura de datos es diferente a la esperada

### **Si ves errores de `401 Unauthorized`:**
- El token no tiene permisos
- O el token está incorrecto

### **Si ves errores de conexión:**
- Strapi no está corriendo
- O `PUBLIC_STRAPI_URL` está mal configurado

---

## ✅ **Solución rápida:**

1. **Crear un artículo de prueba:**
   - Title: "Test Article"
   - Slug: "test-article"
   - Content: "Este es un artículo de prueba"
   - **Publicar** (click en "Publish")

2. **Verificar que funcione:**
   ```
   http://localhost:1337/api/articles?locale=es
   ```

3. **Si la API devuelve datos, el problema está en el frontend**
4. **Si la API no devuelve datos, el problema está en Strapi**

---

## 📝 **Próximos pasos:**

Comparte conmigo:
1. ✅ ¿Qué ves en la consola del servidor de Astro?
2. ✅ ¿Qué devuelve `http://localhost:1337/api/articles?locale=es`?
3. ✅ ¿Están los artículos publicados en Strapi?

