import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const srcFile = 'public/images/services/scorus-campus-hero.jpg';
const outputDir = 'public/images/services';
const sizes = [640, 1024, 1920];
const quality = 80;

async function generateImages() {
  try {
    console.log('🎬 Generando imágenes de Scorus Campus Hero...\n');

    // Generar versión estándar WebP
    await sharp(srcFile)
      .webp({ quality })
      .toFile(path.join(outputDir, 'scorus-campus-hero.webp'));
    console.log('✅ scorus-campus-hero.webp generado');

    // Generar versiones responsive
    for (const size of sizes) {
      await sharp(srcFile)
        .resize(size, Math.round(size * 9 / 16), { fit: 'cover', position: 'center' })
        .webp({ quality })
        .toFile(path.join(outputDir, `scorus-campus-hero-${size}w.webp`));
      console.log(`✅ scorus-campus-hero-${size}w.webp generado`);
    }

    console.log('\n🎉 ¡Todas las imágenes se generaron correctamente!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

generateImages();
