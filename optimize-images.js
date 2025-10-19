const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDir = './public/images';
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
        const fileName = path.parse(file).name;
        const webpPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');

        // Crear versión WebP
        await sharp(filePath)
          .webp({ quality: 80 })
          .toFile(webpPath);

        // Optimizar original
        if (/\.(jpg|jpeg)$/i.test(file)) {
          await sharp(filePath)
            .jpeg({ quality: 75, progressive: true })
            .toFile(filePath);
        } else if (/\.png$/i.test(file)) {
          await sharp(filePath)
            .png({ compressionLevel: 9 })
            .toFile(filePath);
        }

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
