# 🔧 Variables de Entorno para Strapi

## 📋 **Crear archivo `.env`**

Crea un archivo `.env` en la raíz del proyecto `Nueva web bernat` con este contenido:

```env
# Strapi Configuration
PUBLIC_STRAPI_URL=http://localhost:1337

# API Token (opcional - solo si necesitas autenticación)
# Si configuraste permisos públicos en Strapi, déjalo vacío
STRAPI_API_TOKEN=
```

---

## 🔑 **¿Necesitas API Token?**

### **Opción A: Sin Token (Permisos Públicos) - Recomendado para empezar**

1. En Strapi, ve a **Settings → Users & Permissions Plugin → Roles → Public**
2. Marca para **Article**:
   - ✅ find
   - ✅ findOne
3. Guarda
4. Deja `STRAPI_API_TOKEN=` vacío en `.env`

### **Opción B: Con Token (Más Seguro)**

1. En Strapi, ve a **Settings → API Tokens**
2. Click **"Create new API Token"**
3. Configura:
   - Name: `Astro Blog`
   - Token type: `Read-only`
   - Duration: `Unlimited`
   - Permissions: Article → find, findOne
4. Copia el token
5. Añádelo a `.env`: `STRAPI_API_TOKEN=tu_token_aqui`

---

## ✅ **Verificación:**

Después de crear `.env`:
1. Reinicia el servidor de Astro (`npm run dev`)
2. Prueba la API: `http://localhost:1337/api/articles?locale=es`
3. Prueba la página: `http://localhost:4321/es/blog`

