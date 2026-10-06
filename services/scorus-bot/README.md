# Scorus Team · WhatsApp y gestión comercial

Hermes v2026.9.24 (f97608f178d1ffeca59860195ab7da295f7c8e5f), backend FastAPI y PostgreSQL. Por indicación de Carlo, el transporte inicial es Evolution v2.3.7 en contenedores, bases de datos y volúmenes independientes del negocio de barcos. Teléfono de pruebas: +447418602158. No se comparten conversaciones, sesiones, credenciales Evolution ni herramientas del negocio de barcos.

## Arranque

Desde la raíz del repositorio, copiar `.env.example`, `.env.hermes.example` y `.env.dashboard.example` a sus archivos sin `.example`, generar secretos diferentes y arrancar `docker compose -f services/scorus-bot/compose.yaml up -d --build`. En el host preparado, `deploy/bootstrap.py` y `deploy/dashboard_bootstrap.py` realizan la generación sin imprimir claves. El panel nativo permite iniciar sesión con ChatGPT/Codex y seleccionar un modelo de la cuenta; las credenciales se guardan únicamente en el volumen privado de Hermes de Scorus. También se admite configuración por clave en `.env.hermes`.

El backend escucha en 127.0.0.1:4280; TLS público mediante Caddy. Hermes, Evolution y PostgreSQL no exponen puertos públicos. `/admin` utiliza credenciales individuales de Carlo/Bernat y exige protección de origen en las acciones. Los accesos generados están fuera del repositorio en `/opt/scorus-bot/access.private.json`.

Mientras se configura el DNS externo de `api.scorusfitness.com`, la entrada HTTPS utiliza un namespace independiente `/scorus-bot` del proxy existente. El panel público se presenta en `https://scorusfitness.com/scorus-gestion` mediante proxy de servidor Vercel; las claves no llegan al navegador. No se ha cambiado la zona DNS ni el tráfico de los endpoints anteriores.

La web utiliza `SCORUS_BACKEND_URL` y `SCORUS_FORM_API_KEY`, ambas variables de servidor en Vercel; ninguna clave aparece en el navegador. El formulario falla cerrado hasta que existan privacidad publicada y habilitación explícita en el panel.

## Operación

1. Vincular el teléfono de pruebas desde el panel. La opción «responder a entradas desde cualquier móvil» permite probar desde distintos teléfonos: cada interlocutor mantiene su propio expediente y solo se permiten respuestas durante las 24 horas posteriores a su entrada. La lista explícita de destinatarios sigue disponible para pruebas proactivas.
2. Configurar modelo, Stripe de pruebas, Calendly y sus firmas de webhook. Publicar bloques y asignar tipos de evento en el panel.
3. Confirmar tarifas, condiciones, facturación y procedimiento Harbiz. Core 6 está confirmado; las otras tarifas están desactivadas para contratación hasta aprobación.
4. Flujo: valoración registrada como realizada → aprobación Bernat → checkout → webhook firmado de pago → alta Harbiz confirmada → onboarding completo → activación manual. La activación empieza la duración, separada del calendario de cuotas.
5. El bot solo accede a herramientas MCP ligadas al interlocutor mediante un token firmado de cinco minutos. Cada turno Hermes tiene proceso y directorio temporal propios, sin memoria global ni herramientas de sistema.

El panel permite atención humana, respuesta manual, reanudación, alta y activación. Responder desde el propio teléfono también pausa el bot. Los ecos del agente se distinguen por ID de proveedor, con 15 segundos para reconciliar carreras. Identidades LID sin teléfono comprobado no se vinculan mediante nombres: generan incidencia.

La interfaz oficial de Hermes se publica con contraseña propia en `https://webhook.pegateway.xyz/scorus-hermes/`, mediante el puerto local 4281 y `deploy/dashboard_caddy.py`. Sirve para configurar el modelo, revisar la skill comercial y probar el guion en su chat. Ese chat técnico no puede confirmar reservas ni pagos reales. Las conversaciones de WhatsApp, las aprobaciones de Bernat y las gestiones se consultan en el panel Scorus. El gateway nativo de Hermes permanece apagado porque el transporte utilizado es Evolution y el worker propio.

Pagos y agenda se confirman mediante proveedores. Checkout usa idempotencia y reserva persistida. Las cuotas terminan mediante schedule Stripe con fecha final y `end_behavior=cancel`. Nunca hay nueva renovación sin aceptación. Cambios por enlace Calendly requieren reconciliación y revisión si no se puede validar automáticamente el derecho o nuevo horario. Impagos, reclamaciones y devoluciones generan revisión humana; no hay suspensión o reembolso automático.

Los avisos de continuidad preparan la revisión de Bernat. El checkout del nuevo periodo se habilita tras finalizar el contrato anterior y registrar una nueva aprobación; no se solapan compromisos ni cuotas. Los derechos Elite se contabilizan por contrato y ciclos de cuatro semanas.

## Webhooks y fallos

- Evolution: `/webhooks/evolution`, cabecera Authorization independiente e instancia exacta `scorus-test`.
- Meta opcional: `/webhooks/whatsapp`, firma App Secret, número exacto y plantillas fuera de 24 horas.
- Stripe: `/webhooks/stripe`, firma y comprobación de entorno, ID, moneda e importe.
- Calendly: `/webhooks/calendly`, HMAC con antigüedad máxima de cinco minutos.

La cola reside en PostgreSQL. Un envío de resultado incierto o reinicio durante el envío se marca para revisión, nunca se repite ciegamente. Las consultas/modelos y eventos idempotentes se reintentan como máximo tres veces. Bajarse detiene mensajes; una intervención humana pausa automatizaciones. El worker de producción es único; no levantar réplicas sin implementar una lease persistente por conversación.

## Pruebas, backups y producción

`pytest services/scorus-bot/tests` con `PYTHONPATH=services/scorus-bot`. Las pruebas usan SQLite sin red; `deploy/postgres_acceptance.py` ejecuta también las reservas concurrentes en una base PostgreSQL temporal aislada. `deploy/backup.sh` guarda dumps, sesiones Evolution, el volumen Hermes (incluida su autorización privada) y configuración con 14 días de retención operativa; `scorus-backup.timer` programa su ejecución diaria. `deploy/restore_probe.py` comprueba la restauración en una base temporal. Mantener una copia cifrada fuera del host antes del lanzamiento comercial.

Modo inicial `test`: no se permite activar producción desde el panel. El cambio requiere número definitivo verificado, credenciales de su entorno, `SCORUS_MODE=production`, revisión de las condiciones/privacidad y todas las validaciones del panel. Cambiar de modo vuelve a cerrar el formulario y desactiva lanzamiento. Mantener separadas las pruebas y clientes reales al migrar el número.

Pendientes externos: vinculación del teléfono, proveedor IA, Stripe y Calendly del negocio, documentación comercial definitiva e integración Harbiz autorizada. Harbiz se gestiona como tarea humana confirmada mientras no se verifique una API. Audio requiere endpoint de transcripción y clave separados; mientras estén pendientes se entrega a Bernat para revisión.
