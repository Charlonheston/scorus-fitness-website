import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imageDir = path.join(__dirname, 'public', 'images');
let optimizedCount = 0;
let totalSaved = 0;

async function optimizeImages(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await optimizeImages(filePath);
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      try {
        const originalSize = stat.size;
        const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        const tempPath = path.join(os.tmpdir(), `temp-${Date.now()}-${file}`);

        // Crear versión WebP
        await sharp(filePath)
          .webp({ quality: 80 })
          .toFile(webpPath);

        // Optimizar original usando archivo temporal
        if (/\.(jpg|jpeg)$/i.test(file)) {
          await sharp(filePath)
            .jpeg({ quality: 75, progressive: true })
            .toFile(tempPath);
        } else if (/\.png$/i.test(file)) {
          await sharp(filePath)
            .png({ compressionLevel: 9 })
            .toFile(tempPath);
        }

        // Reemplazar original con versión optimizada
        fs.copyFileSync(tempPath, filePath);
        fs.unlinkSync(tempPath);

        const newSize = fs.statSync(filePath).size;
        const webpSize = fs.statSync(webpPath).size;
        const saved = originalSize - Math.min(newSize, webpSize);
        
        totalSaved += saved;
        optimizedCount++;

        console.log(`✅ ${file}`);
        console.log(`   Original: ${(originalSize / 1024).toFixed(2)} KiB`);
        console.log(`   Optimized: ${(newSize / 1024).toFixed(2)} KiB`);
        console.log(`   WebP: ${(webpSize / 1024).toFixed(2)} KiB`);
        console.log(`   Saved: ${(saved / 1024).toFixed(2)} KiB\n`);
      } catch (error) {
        console.error(`❌ Error optimizing ${file}:`, error.message);
      }
    }
  }
}

async function run() {
  console.log('🖼️  Optimizando imágenes...\n');
  await optimizeImages(imageDir);
  console.log(`\n📊 RESUMEN:`);
  console.log(`✅ Imágenes optimizadas: ${optimizedCount}`);
  console.log(`💾 Total ahorrado: ${(totalSaved / 1024 / 1024).toFixed(2)} MiB`);
}

run().catch(console.error);
