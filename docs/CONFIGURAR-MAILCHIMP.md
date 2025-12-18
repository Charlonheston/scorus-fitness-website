# 📧 Configurar Integración con Mailchimp

Esta guía te ayudará a configurar la integración de tu formulario de contacto con Mailchimp para que los datos de los clientes se agreguen automáticamente a tu lista de contactos.

## 📋 **Paso 1: Obtener Credenciales de Mailchimp**

### **1.1 Obtener API Key**

1. Inicia sesión en tu cuenta de [Mailchimp](https://mailchimp.com/)
2. Ve a tu perfil (icono de usuario en la esquina superior derecha)
3. Selecciona **"Account & Billing"** → **"Extras"** → **"API keys"**
4. Si no tienes una API key, haz clic en **"Create A Key"**
5. **Copia la API key** (se mostrará solo una vez) ⚠️

### **1.2 Obtener Server Prefix**

El server prefix es la parte de la URL de tu cuenta de Mailchimp. Por ejemplo:
- Si tu URL es `https://us1.admin.mailchimp.com` → el server es `us1`
- Si tu URL es `https://us2.admin.mailchimp.com` → el server es `us2`
- Si tu URL es `https://us3.admin.mailchimp.com` → el server es `us3`

**También puedes encontrarlo en:**
- Al final de tu API key (si es antigua): `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1`
- En la URL cuando estás en el dashboard de Mailchimp

### **1.3 Obtener List ID (Audience ID)**

1. En Mailchimp, ve a **"Audience"** → **"All contacts"**
2. Haz clic en **"Settings"** → **"Audience name and defaults"**
3. En la sección **"Audience ID"**, copia el ID (ejemplo: `a1b2c3d4e5`)

---

## 📋 **Paso 2: Configurar Variables en Vercel**

### **Método 1: Panel Web de Vercel (Recomendado)**

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Haz clic en **"Add Environment Variable"** para cada una:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MAILCHIMP_API_KEY` | Tu API Key de Mailchimp | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1` |
| `MAILCHIMP_LIST_ID` | ID de tu lista/audiencia | `a1b2c3d4e5` |
| `MAILCHIMP_SERVER` | Server prefix (us1, us2, us3, etc.) | `us1` |

**Importante:**
- ✅ Marca **todas las opciones** (Production, Preview, Development)
- ✅ Estas variables **NO** deben tener el prefijo `PUBLIC_` (son privadas, solo servidor)

### **Método 2: CLI de Vercel**

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Login
vercel login

# Añadir variables (reemplaza los valores con los tuyos)
vercel env add MAILCHIMP_API_KEY
vercel env add MAILCHIMP_LIST_ID
vercel env add MAILCHIMP_SERVER

# Verificar
vercel env ls
```

---

## 📋 **Paso 3: Redeploy**

Después de añadir las variables:

1. Ve a **Deployments** en Vercel
2. Haz clic en los **3 puntos** (...) del último deployment
3. Selecciona **"Redeploy"**
4. Confirma el redeploy

**O simplemente:**
- Haz un nuevo commit y push a GitHub (Vercel deploy automático)

---

## ✅ **Paso 4: Verificar la Integración**

### **Prueba el Formulario:**

1. Ve a tu página de contacto (ej: `https://tu-sitio.vercel.app/es/contacto`)
2. Completa y envía el formulario
3. Verifica en Mailchimp:
   - Ve a **"Audience"** → **"All contacts"**
   - Busca el nuevo contacto por email
   - Verifica que tenga:
     - ✅ Email correcto
     - ✅ Nombre y apellidos separados
     - ✅ Teléfono (si se proporcionó)
     - ✅ Etiqueta "Cliente web oficial SF"
     - ✅ Etiquetas adicionales según servicio e idioma
     - ✅ Estado "Suscrito"

### **Verificar en Consola del Navegador:**

1. Abre las **Developer Tools** (F12)
2. Ve a la pestaña **"Console"**
3. Envía el formulario
4. No deberías ver errores relacionados con Mailchimp

### **Verificar Logs de Vercel:**

1. Ve a **Deployments** en Vercel
2. Haz clic en el deployment más reciente
3. Ve a la pestaña **"Functions"**
4. Busca `/api/mailchimp` en los logs
5. Verifica que no haya errores

---

## 🔧 **Solución de Problemas**

### **Error: "Configuración de Mailchimp no disponible"**

**Causa:** Las variables de entorno no están configuradas o no están disponibles.

**Solución:**
1. Verifica que las variables estén configuradas en Vercel
2. Asegúrate de que estén marcadas para el entorno correcto (Production/Preview/Development)
3. Haz redeploy después de añadir las variables

### **Error: "Error al agregar contacto a Mailchimp"**

**Causa:** Problema con las credenciales o formato de datos.

**Solución:**
1. Verifica que la API Key sea correcta
2. Verifica que el List ID sea correcto
3. Verifica que el Server prefix sea correcto (us1, us2, us3, etc.)
4. Revisa los logs de Vercel para más detalles

### **Error: "401 Unauthorized"**

**Causa:** API Key inválida o expirada.

**Solución:**
1. Genera una nueva API Key en Mailchimp
2. Actualiza la variable `MAILCHIMP_API_KEY` en Vercel
3. Haz redeploy

### **Error: "404 Not Found"**

**Causa:** List ID incorrecto o la lista no existe.

**Solución:**
1. Verifica que el List ID sea correcto
2. Asegúrate de que la lista/audiencia exista en Mailchimp
3. Verifica que tengas permisos para acceder a esa lista

---

## 📊 **Datos que se Envían a Mailchimp**

Cuando un cliente envía el formulario, se envían los siguientes datos:

| Campo Mailchimp | Campo del Formulario | Notas |
|-----------------|----------------------|-------|
| `email_address` | `email` | Obligatorio |
| `FNAME` (Nombre) | `name` (primera palabra) | Separado automáticamente |
| `LNAME` (Apellidos) | `name` (resto de palabras) | Separado automáticamente |
| `PHONE` | `phone` | Solo si se proporciona |
| `status` | - | Siempre "subscribed" |
| `tags` | - | Incluye: "Cliente web oficial SF", servicio, idioma |
| `source` | - | Se marca como "Embed Form" |

---

## 🔒 **Seguridad**

- ✅ Las variables de entorno son **privadas** (no tienen prefijo `PUBLIC_`)
- ✅ La API Key nunca se expone al cliente
- ✅ La integración se hace desde el servidor (serverless function)
- ✅ Los datos se validan antes de enviarse a Mailchimp

---

## 📝 **Notas Adicionales**

- Los contactos se **actualizan** si ya existen (basado en el email)
- Los contactos se **crean** si no existen
- El email se usa como identificador único
- Los contactos se marcan automáticamente como "Suscrito"
- Se agregan etiquetas automáticamente según el servicio e idioma seleccionados

---

## 🆘 **Soporte**

Si tienes problemas con la integración:

1. Revisa los logs de Vercel
2. Revisa la consola del navegador
3. Verifica las credenciales en Mailchimp
4. Consulta la [documentación oficial de Mailchimp API](https://mailchimp.com/developer/marketing/api/list-members/)











