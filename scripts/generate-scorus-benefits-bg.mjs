import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const srcFile = 'public/images/academia/scorus-benefits-bg.jpg';
const outputDir = 'public/images/academia';
const sizes = [640, 1024, 1920];
const quality = 80;

async function generateImages() {
  try {
    console.log('🎬 Generando imágenes WebP de Scorus Benefits Background...\n');

    // Generar versión estándar WebP
    await sharp(srcFile)
      .webp({ quality })
      .toFile(path.join(outputDir, 'scorus-benefits-bg.webp'));
    console.log('✅ scorus-benefits-bg.webp generado');

    // Generar versiones responsive
    for (const size of sizes) {
      await sharp(srcFile)
        .resize(size, Math.round(size * 9 / 16), { fit: 'cover', position: 'center' })
        .webp({ quality })
        .toFile(path.join(outputDir, `scorus-benefits-bg-${size}w.webp`));
      console.log(`✅ scorus-benefits-bg-${size}w.webp generado`);
    }

    console.log('\n🎉 ¡Todas las imágenes se generaron correctamente!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateImages();
