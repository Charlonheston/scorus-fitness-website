#!/usr/bin/env node
/**
 * Script para convertir imágenes JPG/PNG a WebP
 * Uso: node scripts/convert-to-webp.mjs
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

async function convertToWebP() {
  console.log('🚀 Iniciando conversión de imágenes a WebP...\n');

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

        const inputPath = path.join(fullPath, file);
        const outputName = path.basename(file, ext) + '.webp';
        const outputPath = path.join(fullPath, outputName);

        try {
          // Verificar si ya existe
          try {
            await fs.access(outputPath);
            console.log(`⏭️  SKIP: ${outputName} (ya existe)`);
            totalSkipped++;
            continue;
          } catch {
            // No existe, continuamos
          }

          // Convertir a WebP
          console.log(`⏳ Convirtiendo: ${file} → ${outputName}`);
          
          await sharp(inputPath)
            .webp({ quality: 80 })
            .toFile(outputPath);

          // Obtener información de tamaño
          const originalStats = await fs.stat(inputPath);
          const webpStats = await fs.stat(outputPath);
          const savedPercent = (((originalStats.size - webpStats.size) / originalStats.size) * 100).toFixed(1);

          console.log(`✅ OK: ${outputName} (${(webpStats.size / 1024).toFixed(1)} KB, -${savedPercent}%)\n`);
          totalConverted++;
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
  console.log('\n✨ ¡Listo! Las imágenes WebP están en los mismos directorios.');
}

convertToWebP().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
