# Configuración de Google Sheets para Formulario de Contacto

Este documento explica cómo configurar Google Sheets para recibir los datos del formulario de contacto.

## Paso 1: Crear una Hoja de Google Sheets

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. En la primera fila, añade estos encabezados:
   - **A1:** Fecha y Hora
   - **B1:** Nombre
   - **C1:** Email
   - **D1:** Teléfono
   - **E1:** Servicio
   - **F1:** Mensaje
   - **G1:** Idioma

## Paso 2: Crear el Script de Google Apps Script

1. En tu hoja de Google Sheets, ve a **Extensiones** > **Apps Script**
2. Elimina el código predeterminado y pega el siguiente código:

```javascript
function doPost(e) {
  try {
    // Obtener la hoja activa
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Obtener los datos del POST
    const data = JSON.parse(e.postData.contents);
    
    // Obtener la fecha y hora actual
    const fechaHora = new Date();
    
    // Preparar los datos para insertar
    const row = [
      fechaHora,                    // Fecha y Hora
      data.name || '',              // Nombre
      data.email || '',             // Email
      data.phone || '',             // Teléfono
      data.service || '',           // Servicio
      data.message || '',           // Mensaje
      data.language || 'es'         // Idioma
    ];
    
    // Insertar la fila en la hoja
    sheet.appendRow(row);
    
    // Retornar respuesta exitosa
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Datos guardados correctamente' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Retornar error
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Función para probar el script (opcional)
function doGet(e) {
  return ContentService
    .createTextOutput('El webhook está funcionando correctamente')
    .setMimeType(ContentService.MimeType.TEXT);
}
```

3. Guarda el proyecto con un nombre (por ejemplo: "Contact Form Webhook")
4. Haz clic en **Desplegar** > **Nueva implementación**
5. Selecciona:
   - **Tipo:** Aplicación web
   - **Descripción:** Webhook para formulario de contacto
   - **Ejecutar como:** Yo
   - **Quién tiene acceso:** Cualquiera
6. Haz clic en **Desplegar**
7. **IMPORTANTE:** Copia la URL del webhook que se genera (algo como: `https://script.google.com/macros/s/AKfyc.../exec`)

## Paso 3: Configurar la Variable de Entorno

1. Crea un archivo `.env` en la raíz del proyecto (si no existe)
2. Añade la siguiente variable:

```
PUBLIC_GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/TU_ID_AQUI/exec
```

**IMPORTANTE:** La variable debe comenzar con `PUBLIC_` para que Astro la exponga al cliente.

3. Reemplaza `TU_ID_AQUI` con la URL completa que copiaste en el paso anterior
4. Reinicia el servidor de desarrollo si está corriendo para que cargue la nueva variable

## Paso 4: Verificar la Configuración

1. Prueba el webhook visitando la URL en tu navegador (deberías ver "El webhook está funcionando correctamente")
2. Envía un formulario de prueba desde la web
3. Verifica que los datos aparezcan en tu hoja de Google Sheets

## Notas Importantes

- El webhook debe estar configurado como "Cualquiera" puede acceder para que funcione desde la web
- Los datos se añadirán automáticamente a la hoja cada vez que alguien envíe el formulario
- La fecha y hora se registrará automáticamente cuando se reciba el formulario
- El idioma se detectará automáticamente según la página desde la que se envíe el formulario

## Solución de Problemas

Si los datos no se guardan:
1. Verifica que el webhook tenga permisos de "Cualquiera"
2. Revisa la consola del navegador para ver errores
3. Verifica que la URL del webhook esté correcta en la variable de entorno
4. Asegúrate de que los encabezados de la hoja coincidan con el orden del script

