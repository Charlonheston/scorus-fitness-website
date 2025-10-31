# 🔑 Token de Strapi - Desarrollo vs Producción

## 📝 **Token que me diste antes (Desarrollo Local):**

```
0cd9f2f5fd727e6407b2bd63dd35bd8c7866230f6a04feca30b2606a2bb81bac21849df572169ef196787b71faf31ecca3f6aaefe5108bd5bda89734475c60d280bf32ea72809a84f7ee53fc3a2f22abb542c233ed815ed430e7f6e1d7a35894546bd965259763262f2635b00cceb17c11f81a84223844400baa295664332686
```

Este token fue creado en tu **Strapi local** (`localhost:1337`).

---

## ⚠️ **¿Funciona para Producción?**

**Probablemente NO**, porque:
- Fue creado en Strapi local
- Los tokens están asociados a cada instancia de Strapi
- El Strapi de producción en Render es una instancia diferente

---

## ✅ **Solución: Crear Token en Strapi de Producción**

### **Pasos:**

1. Ve a: **https://scorus-cms-strapi.onrender.com/admin**
2. Inicia sesión (o crea tu usuario admin si aún no lo has hecho)
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
7. **Copia el nuevo token** (solo se muestra una vez) ⚠️

---

## 🔧 **Variables para Vercel:**

Una vez tengas el token de producción, configura en Vercel:

```
PUBLIC_STRAPI_URL=https://scorus-cms-strapi.onrender.com
STRAPI_API_TOKEN=<el-nuevo-token-de-produccion>
```

---

## 💡 **Alternativa: Probar el Token Antiguo**

Puedes intentar usar el token antiguo primero:

1. Añade en Vercel:
   ```
   STRAPI_API_TOKEN=0cd9f2f5fd727e6407b2bd63dd35bd8c7866230f6a04feca30b2606a2bb81bac21849df572169ef196787b71faf31ecca3f6aaefe5108bd5bda89734475c60d280bf32ea72809a84f7ee53fc3a2f22abb542c233ed815ed430e7f6e1d7a35894546bd965259763262f2635b00cceb17c11f81a84223844400baa295664332686
   ```

2. Haz redeploy
3. Prueba: `https://tu-sitio.vercel.app/es/blog`
4. Si ves error **401 Unauthorized**, entonces necesitas crear un token nuevo en producción

---

## ✅ **Recomendación:**

**Mejor crear un token nuevo** en producción para estar seguro. Es más rápido que probar y luego tener que cambiarlo.

