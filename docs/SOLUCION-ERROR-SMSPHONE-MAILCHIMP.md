# 🔧 Solución al Error SMSPHONE en Mailchimp

## ❌ **Error que estás viendo:**

```
Error: "Please check the box to acknowledge our SMS terms."
Field: "SMSPHONE"
```

## 🔍 **Causa del Problema:**

Mailchimp tiene un campo `SMSPHONE` (Número de teléfono para SMS) configurado en tu lista que **requiere aceptar términos de SMS**. Aunque no estemos enviando este campo, Mailchimp lo valida automáticamente.

## ✅ **Solución: Hacer SMSPHONE Opcional en Mailchimp**

### **Pasos:**

1. **Ve a Mailchimp** e inicia sesión
2. **Ve a Audience** → **All contacts**
3. **Haz clic en Settings** → **List fields and *MERGE* tags**
4. **Busca el campo "SMSPHONE"** o "Número de teléfono para SMS"
5. **Haz clic en el campo** para editarlo
6. **Desmarca "Required"** (Requerido) si está marcado
7. **Guarda los cambios**

### **Alternativa: Desactivar el Campo**

Si no necesitas el campo SMSPHONE:

1. En la misma página de **List fields and *MERGE* tags**
2. **Haz clic en el campo SMSPHONE**
3. **Haz clic en "Delete"** o "Eliminar"
4. **Confirma la eliminación**

## 📝 **Después de Configurar Mailchimp:**

Una vez que hayas hecho SMSPHONE opcional o lo hayas eliminado:

1. **Prueba el formulario de nuevo**
2. **Debería funcionar correctamente**
3. **Los contactos se agregarán con:**
   - ✅ Email
   - ✅ Nombre y apellidos (en merge_fields)
   - ✅ Estado: Suscrito
   - ✅ Tags: "Cliente web oficial SF", servicio, idioma, teléfono

## 🔄 **Si Quieres Mantener SMSPHONE:**

Si necesitas el campo SMSPHONE pero quieres que funcione automáticamente:

1. **Mantén SMSPHONE como opcional** (no requerido)
2. **El código actual NO enviará el teléfono a SMSPHONE** (va como tag)
3. **Si quieres enviarlo a SMSPHONE**, necesitarías añadir una casilla de verificación en el formulario para aceptar términos de SMS

## 💡 **Nota:**

Actualmente, el código envía el teléfono como **tag** en lugar de como merge field para evitar este error. Una vez que configures Mailchimp, podemos actualizar el código para enviar nombre y apellidos como merge_fields.













