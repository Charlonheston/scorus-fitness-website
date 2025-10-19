#!/usr/bin/env node
/**
 * Script para convertir imágenes JPG/PNG a WebP con múltiples tamaños
 * Uso: node scripts/convert-to-webp.mjs
 * 
 * Genera:
 * - imagen-400w.webp (móvil)
 * - imagen-800w.webp (tablet)
 * - imagen.webp (desktop)
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGE_DIRS = [
  'public/images/gym',
  'public/images/services',
  'public/images/heroes',
];

const SIZES = [
  { width: 400, suffix: '-400w' },
  { width: 800, suffix: '-800w' },
  { width: 1200, suffix: '' }, // Sin sufijo es la versión grande
];

async function convertToWebP() {
  console.log('🚀 Iniciando conversión de imágenes a WebP con múltiples tamaños...\n');

  let totalConverted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const dir of IMAGE_DIRS) {
    const fullPath = path.join(__dirname, '..', dir);
    
    try {
      const files = await fs.readdir(fullPath);
      
      for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

        // Saltar si ya tiene un sufijo (es una versión redimensionada)
        if (file.match(/-(400w|800w|1200w)\./)) continue;

        const inputPath = path.join(fullPath, file);
        const baseName = path.basename(file, ext);

        try {
          for (const size of SIZES) {
            const outputName = baseName + size.suffix + '.webp';
            const outputPath = path.join(fullPath, outputName);

            // Verificar si ya existe
            try {
              await fs.access(outputPath);
              console.log(`⏭️  SKIP: ${outputName} (ya existe)`);
              totalSkipped++;
              continue;
            } catch {
              // No existe, continuamos
            }

            console.log(`⏳ Redimensionando a ${size.width}px: ${file} → ${outputName}`);
            
            await sharp(inputPath)
              .resize(size.width, size.width * 2, { // Mantener aspect ratio
                fit: 'cover',
                withoutEnlargement: true,
              })
              .webp({ quality: 80 })
              .toFile(outputPath);

            const webpStats = await fs.stat(outputPath);
            console.log(`✅ OK: ${outputName} (${(webpStats.size / 1024).toFixed(1)} KB)\n`);
            totalConverted++;
          }
        } catch (error) {
          console.error(`❌ ERROR en ${file}: ${error.message}\n`);
          totalErrors++;
        }
      }
    } catch (error) {
      console.error(`⚠️  No se pudo procesar directorio ${dir}: ${error.message}`);
    }
  }

  console.log('\n📊 Resumen:');
  console.log(`   ✅ Convertidas: ${totalConverted}`);
  console.log(`   ⏭️  Omitidas: ${totalSkipped}`);
  console.log(`   ❌ Errores: ${totalErrors}`);
  console.log('\n✨ ¡Listo! Las imágenes WebP con múltiples tamaños están listos.');
}

convertToWebP().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
