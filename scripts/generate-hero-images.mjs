#!/usr/bin/env node
import sharp from 'sharp';
import { promises as fs } from 'fs';

const srcFile = 'public/images/hero/bernat-hero.jpg';
const sizes = [
  { width: 640, suffix: '-640w' },
  { width: 1024, suffix: '-1024w' },
  { width: 1920, suffix: '' }
];

console.log('🚀 Generando imágenes hero responsivas...\n');

Promise.all(sizes.map(async (size) => {
  const outName = srcFile.replace(/\.jpg$/, size.suffix + '.webp');
  console.log(`⏳ ${outName}`);
  
  return sharp(srcFile)
    .resize(size.width, Math.round(size.width * 9 / 16), { 
      fit: 'cover', 
      withoutEnlargement: true 
    })
    .webp({ quality: 60 })
    .toFile(outName);
}))
.then(() => {
  console.log('\n✅ Listo! Imágenes hero generadas correctamente.');
})
.catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
