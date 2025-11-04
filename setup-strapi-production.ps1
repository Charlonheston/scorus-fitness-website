# Script para configurar la web local para usar Strapi de producción
# ====================================================================

Write-Host ""
Write-Host "🔗 Configurar Web Local → Strapi de Producción" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si existe .env.local
if (Test-Path ".env.local") {
    Write-Host "⚠️  Ya existe un archivo .env.local" -ForegroundColor Yellow
    $overwrite = Read-Host "¿Quieres sobrescribirlo? (s/N)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "Operación cancelada." -ForegroundColor Red
        exit
    }
    Copy-Item ".env.local" ".env.local.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Write-Host "✅ Backup creado: .env.local.backup.*" -ForegroundColor Green
    Write-Host ""
}

Write-Host "📋 Configuración de Strapi de Producción" -ForegroundColor Yellow
Write-Host ""

# URL de Strapi (ya sabemos cuál es)
$strapiUrl = "https://scorus-cms-strapi.onrender.com"
Write-Host "✅ URL de Strapi de producción:" -ForegroundColor Green
Write-Host "   $strapiUrl" -ForegroundColor Gray
Write-Host ""

# Solicitar Token
Write-Host "🔑 Token de API de Strapi" -ForegroundColor Cyan
Write-Host "   Este token debe crearse en: $strapiUrl/admin" -ForegroundColor Gray
Write-Host "   Settings → API Tokens → Create new API Token" -ForegroundColor Gray
Write-Host ""
Write-Host "   Configuración recomendada:" -ForegroundColor Yellow
Write-Host "   - Name: Astro Local Development" -ForegroundColor Gray
Write-Host "   - Token type: Read-only" -ForegroundColor Gray
Write-Host "   - Duration: Unlimited" -ForegroundColor Gray
Write-Host "   - Permissions: Article → find, findOne" -ForegroundColor Gray
Write-Host ""
$strapiToken = Read-Host "   Ingresa tu STRAPI_API_TOKEN"

# Validar token
if (-not $strapiToken -or $strapiToken.Trim() -eq "") {
    Write-Host ""
    Write-Host "❌ Error: El token no puede estar vacío" -ForegroundColor Red
    exit 1
}

# Crear contenido del .env.local
$envContent = @"
# ============================================
# CONFIGURACIÓN PARA USAR STRAPI DE PRODUCCIÓN
# Generado: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
# ============================================

# URL del Strapi en PRODUCCIÓN (Render)
PUBLIC_STRAPI_URL=$strapiUrl

# Token de API de Strapi (de producción)
STRAPI_API_TOKEN=$strapiToken
"@

# Guardar archivo
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8 -NoNewline

Write-Host ""
Write-Host "✅ Archivo .env.local creado exitosamente!" -ForegroundColor Green
Write-Host ""

Write-Host "📝 Próximos pasos:" -ForegroundColor Cyan
Write-Host "   1. Reinicia el servidor de desarrollo (Ctrl + C y luego npm run dev)" -ForegroundColor Gray
Write-Host "   2. Verifica en la consola del navegador que muestra la URL correcta" -ForegroundColor Gray
Write-Host "   3. Ve a /es/blog para ver los artículos de producción" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 Para verificar que funciona:" -ForegroundColor Cyan
Write-Host "   - Abre la consola del navegador (F12)" -ForegroundColor Gray
Write-Host "   - Deberías ver: 🔧 Strapi Config con url: $strapiUrl" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   - Este archivo .env.local NO se subirá a Git (está en .gitignore)" -ForegroundColor Gray
Write-Host "   - Tu web local solo LEE datos de producción (no puede modificar)" -ForegroundColor Gray
Write-Host ""


