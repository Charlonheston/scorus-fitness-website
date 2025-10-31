# 🔧 Variables de Entorno para Producción

## 📋 **Variables Requeridas:**

### **1. PUBLIC_STRAPI_URL** (Pública - accesible en el cliente)

URL de tu instancia de Strapi en producción.

**Ejemplo:**
```env
PUBLIC_STRAPI_URL=https://tu-strapi.render.com
```

**O si usas un dominio personalizado:**
```env
PUBLIC_STRAPI_URL=https://cms.tudominio.com
```

---

### **2. STRAPI_API_TOKEN** (Privada - solo servidor)

Token de API de Strapi con permisos para leer artículos.

**Ejemplo:**
```env
STRAPI_API_TOKEN=tu_token_de_produccion_aqui
```

**Nota:** Este token debe tener permisos en Strapi para:
- ✅ Article → `find`
- ✅ Article → `findOne`

---

## 🚀 **Configuración en Vercel:**

### **Método 1: Panel de Vercel (Recomendado)**

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **Settings** → **Environment Variables**
3. Añade las variables:

   | Variable | Value | Environment |
   |----------|-------|-------------|
   | `PUBLIC_STRAPI_URL` | `https://tu-strapi.render.com` | Production, Preview, Development |
   | `STRAPI_API_TOKEN` | `tu_token_aqui` | Production, Preview, Development |

4. Click **Save**
5. Haz **Redeploy** del proyecto para aplicar cambios

---

### **Método 2: CLI de Vercel**

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login
vercel login

# Añadir variables
vercel env add PUBLIC_STRAPI_URL
vercel env add STRAPI_API_TOKEN

# Verificar
vercel env ls
```

---

## 📝 **Paso a Paso Completo:**

### **1. Obtener URL de Strapi en Render:**

1. Ve a tu proyecto Strapi en [Render Dashboard](https://dashboard.render.com)
2. En tu **Web Service**, copia la **URL pública**
   - Ejemplo: `https://scorus-cms-strapi.onrender.com`
3. **IMPORTANTE**: Asegúrate de que Strapi esté configurado para aceptar requests desde tu dominio de Vercel

---

### **2. Crear Token de Producción en Strapi:**

1. Ve a tu Strapi en producción: `https://tu-strapi.render.com/admin`
2. **Settings** → **API Tokens**
3. Click **"Create new API Token"**
4. Configura:
   - **Name**: `Vercel Production`
   - **Token type**: `Read-only` (recomendado) o `Full access`
   - **Duration**: `Unlimited`
   - **Permissions**: 
     - ✅ **Article** → `find`
     - ✅ **Article** → `findOne`
5. Click **Save**
6. **Copia el token** (solo se muestra una vez)

---

### **3. Configurar CORS en Strapi (Si es necesario):**

Si recibes errores de CORS, configura en Strapi:

**En `config/middlewares.ts` de tu proyecto Strapi:**

```typescript
export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'https://tu-dominio.vercel.app',
        'https://www.tudominio.com',
        'http://localhost:4321', // Para desarrollo
      ],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

---

### **4. Configurar Variables en Vercel:**

**Panel Web:**
1. Project → Settings → Environment Variables
2. Añade:
   ```
   PUBLIC_STRAPI_URL=https://tu-strapi.render.com
   STRAPI_API_TOKEN=tu_token_aqui
   ```
3. Marca todas las opciones: Production, Preview, Development
4. Save

**CLI:**
```bash
cd "C:\Users\carlo\Desktop\Nueva web bernat"
vercel env add PUBLIC_STRAPI_URL production
vercel env add STRAPI_API_TOKEN production
```

---

### **5. Verificar Variables en Build:**

Durante el build, Vercel mostrará las variables. Verifica en los logs:

```
🔧 Strapi Config: {
  url: 'https://tu-strapi.render.com',
  hasToken: true,
  tokenLength: 256
}
```

---

## 🔒 **Seguridad:**

### **Variables Públicas vs Privadas:**

- **`PUBLIC_STRAPI_URL`**: Pública (prefijo `PUBLIC_`)
  - Accesible en el navegador
  - Se incluye en el bundle del cliente
  - ✅ Segura de exponer

- **`STRAPI_API_TOKEN`**: Privada (sin prefijo `PUBLIC_`)
  - Solo accesible en el servidor (SSR/SSG)
  - No se incluye en el bundle del cliente
  - ✅ Segura si no la expones en el código

---

## ⚠️ **Problemas Comunes:**

### **Error: "Missing or invalid credentials"**

- Verifica que `STRAPI_API_TOKEN` esté configurada en Vercel
- Verifica que el token tenga permisos en Strapi
- Haz redeploy después de añadir variables

### **Error: "CORS" o "Network Error"**

- Configura CORS en Strapi (ver paso 3)
- Verifica que `PUBLIC_STRAPI_URL` apunte a la URL correcta

### **Variables no se cargan en Build**

- Verifica que las variables estén marcadas para "Production"
- Haz un nuevo deploy después de añadir variables
- Verifica en Vercel → Project → Settings → Environment Variables

---

## ✅ **Checklist Pre-Deploy:**

- [ ] Strapi desplegado en Render y funcionando
- [ ] URL de Strapi copiada (`PUBLIC_STRAPI_URL`)
- [ ] Token de producción creado en Strapi
- [ ] Permisos del token configurados (Article → find, findOne)
- [ ] Variables añadidas en Vercel (ambas)
- [ ] CORS configurado en Strapi (si es necesario)
- [ ] Redeploy hecho después de añadir variables
- [ ] Build exitoso sin errores
- [ ] Prueba en producción: `/es/blog` muestra artículos

---

## 🧪 **Probar en Producción:**

1. Despliega tu proyecto en Vercel
2. Ve a: `https://tu-dominio.vercel.app/es/blog`
3. Verifica que los artículos se muestren
4. Verifica la consola del navegador (F12) para errores
5. Verifica los logs de Vercel si hay problemas

---

## 📞 **Siguiente Paso:**

Una vez configurado, haz un commit y push:

```bash
git add .
git commit -m "Configurar variables de entorno para producción"
git push
```

Vercel hará deploy automáticamente.

