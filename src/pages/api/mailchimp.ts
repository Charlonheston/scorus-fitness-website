import type { APIRoute } from 'astro';

/**
 * API Route para integrar con Mailchimp
 * 
 * Esta función recibe los datos del formulario y los envía a Mailchimp
 * para agregar/actualizar contactos en la lista.
 */

// Marcar como no prerenderizada para que funcione en modo estático
export const prerender = false;

interface MailchimpContact {
  email_address: string;
  status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending' | 'transactional';
  merge_fields?: {
    FNAME?: string;
    LNAME?: string;
    // No incluimos PHONE ni SMSPHONE para evitar errores de términos SMS
  };
  tags?: string[];
  marketing_permissions?: Array<{
    marketing_permission_id: string;
    enabled: boolean;
  }>;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parsear el body de forma segura
    let body;
    try {
      const text = await request.text();
      body = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Error al parsear body del request:', parseError);
      return new Response(
        JSON.stringify({ error: 'Body del request inválido o vacío' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const { name, email, phone, service, message, language } = body;

    // Validar campos requeridos
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'El email es requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Obtener variables de entorno
    let mailchimpApiKey = import.meta.env.MAILCHIMP_API_KEY;
    let mailchimpListId = import.meta.env.MAILCHIMP_LIST_ID;
    let mailchimpServer = import.meta.env.MAILCHIMP_SERVER; // ej: "us1", "us2", etc.

    // Si el API key incluye el server prefix (ej: "key-us1"), extraerlo
    if (mailchimpApiKey && mailchimpApiKey.includes('-') && !mailchimpServer) {
      const parts = mailchimpApiKey.split('-');
      if (parts.length > 1) {
        mailchimpServer = parts[parts.length - 1]; // Última parte es el server
        mailchimpApiKey = parts.slice(0, -1).join('-'); // Resto es el API key
      }
    }

    if (!mailchimpApiKey || !mailchimpListId || !mailchimpServer) {
      const errorMsg = 'Variables de entorno de Mailchimp no configuradas';
      console.error(errorMsg, {
        hasApiKey: !!mailchimpApiKey,
        hasListId: !!mailchimpListId,
        hasServer: !!mailchimpServer,
        apiKeyLength: mailchimpApiKey?.length || 0,
        listIdValue: mailchimpListId || 'undefined',
        serverValue: mailchimpServer || 'undefined'
      });
      return new Response(
        JSON.stringify({ 
          error: errorMsg,
          details: 'Verifica que MAILCHIMP_API_KEY, MAILCHIMP_LIST_ID y MAILCHIMP_SERVER estén configuradas'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Separar nombre y apellidos
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Preparar datos para Mailchimp
    // IMPORTANTE: El campo SMSPHONE en Mailchimp requiere aceptar términos de SMS
    // Solución temporal: Enviar solo email, status y tags (sin merge_fields)
    // El usuario debe hacer SMSPHONE opcional en Mailchimp para que funcione con merge_fields
    const contactData: any = {
      email_address: email,
      status: 'subscribed',
      // NO enviamos merge_fields para evitar el error de SMSPHONE
      // TODO: Una vez que SMSPHONE sea opcional en Mailchimp, podemos añadir:
      // merge_fields: { FNAME: firstName, LNAME: lastName }
      tags: [
        'Cliente web oficial SF',
        ...(name ? [`Nombre: ${name}`] : []), // Nombre completo como tag
        ...(service ? [`Servicio: ${service}`] : []),
        ...(language ? [`Idioma: ${language}`] : []),
        ...(phone ? [`Teléfono: ${phone}`] : []), // Teléfono como tag
      ],
    };
    
    // Log para debugging
    console.log('Datos a enviar a Mailchimp:', {
      email: contactData.email_address,
      mergeFields: contactData.merge_fields,
      tags: contactData.tags
    });

    // Construir URL de la API de Mailchimp
    const mailchimpUrl = `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${mailchimpListId}/members`;

    // Crear hash MD5 del email (Mailchimp lo usa como identificador único)
    const emailHash = await createMD5Hash(email.toLowerCase());

    // Autenticación Basic Auth para Mailchimp
    // Mailchimp API v3 requiere Basic Auth con cualquier username y el API key como password
    const authString = Buffer.from(`anystring:${mailchimpApiKey}`).toString('base64');
    
    // Log para debugging (sin exponer el API key completo)
    console.log('Mailchimp Config:', {
      server: mailchimpServer,
      listId: mailchimpListId,
      apiKeyLength: mailchimpApiKey?.length || 0,
      email: email
    });
    
    // Obtener información de la lista para ver qué merge fields están configurados
    // Esto nos ayuda a evitar enviar campos que causan problemas
    let listMergeFields: string[] = [];
    try {
      const listInfoResponse = await fetch(
        `https://${mailchimpServer}.api.mailchimp.com/3.0/lists/${mailchimpListId}/merge-fields`,
        {
          headers: {
            'Authorization': `Basic ${authString}`,
          },
        }
      );
      if (listInfoResponse.ok) {
        const listInfo = await listInfoResponse.json();
        listMergeFields = listInfo.merge_fields?.map((field: any) => field.tag) || [];
        console.log('Merge fields disponibles en la lista:', listMergeFields);
      }
    } catch (e) {
      console.warn('No se pudieron obtener los merge fields de la lista:', e);
    }

    // Usar PUT con skip_merge_validation para evitar validación de SMSPHONE
    // O usar el método upsert más flexible
    const response = await fetch(`${mailchimpUrl}/${emailHash}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...contactData,
        // Añadir skip_merge_validation para evitar validación estricta de merge fields
        skip_merge_validation: true,
      }),
    });

    let result;

    if (!response.ok) {
      let errorData = {};
      try {
        const text = await response.text();
        if (text) {
          errorData = JSON.parse(text);
        }
      } catch (e) {
        console.error('Error al parsear respuesta de error de Mailchimp:', e);
        errorData = { message: 'Error desconocido de Mailchimp' };
      }
      console.error('Error de Mailchimp (PUT):', response.status, errorData);
      
      // Si el error es que el contacto no existe (404), intentar crearlo
      if (response.status === 404) {
        console.log('Contacto no existe, creando nuevo contacto...');
        const createResponse = await fetch(mailchimpUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contactData),
        });

        if (!createResponse.ok) {
          let createError = {};
          try {
            const text = await createResponse.text();
            if (text) {
              createError = JSON.parse(text);
            }
          } catch (e) {
            console.error('Error al parsear respuesta de error al crear contacto:', e);
            createError = { message: 'Error desconocido al crear contacto' };
          }
          console.error('Error al crear contacto en Mailchimp:', createResponse.status, createError);
          return new Response(
            JSON.stringify({ 
              error: 'Error al agregar contacto a Mailchimp', 
              status: createResponse.status,
              details: createError 
            }),
            { status: createResponse.status, headers: { 'Content-Type': 'application/json' } }
          );
        }
        
        try {
          const text = await createResponse.text();
          result = text ? JSON.parse(text) : {};
        } catch (e) {
          console.error('Error al parsear respuesta de creación:', e);
          result = {};
        }
        console.log('Contacto creado exitosamente en Mailchimp');
      } else {
        // Otro error (401, 403, etc.)
        console.error('Error de Mailchimp:', response.status, errorData);
        return new Response(
          JSON.stringify({ 
            error: 'Error al actualizar contacto en Mailchimp', 
            status: response.status,
            details: errorData 
          }),
          { status: response.status, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else {
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (e) {
        console.error('Error al parsear respuesta de actualización:', e);
        result = {};
      }
      console.log('Contacto actualizado exitosamente en Mailchimp');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contacto agregado/actualizado en Mailchimp correctamente',
        data: result 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error en API de Mailchimp:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

/**
 * Función auxiliar para crear hash MD5 del email
 * Mailchimp usa el hash MD5 del email como identificador único
 */
async function createMD5Hash(str: string): Promise<string> {
  // Importar crypto de Node.js
  const crypto = await import('crypto');
  return crypto.createHash('md5').update(str.toLowerCase()).digest('hex');
}

