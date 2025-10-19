#!/usr/bin/env node
import sharp from 'sharp';

console.log('🚀 Optimizando logos...\n');

Promise.all([
  sharp('public/images/logos/logo-scorus-white.png')
    .resize(80, 80, { 
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .webp({ quality: 50 })
    .toFile('public/images/logos/logo-scorus-white.webp')
    .then(() => console.log('✅ logo-scorus-white.webp')),
  
  sharp('public/images/logos/logo-scorus.png')
    .resize(80, 80, { 
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .webp({ quality: 50 })
    .toFile('public/images/logos/logo-scorus.webp')
    .then(() => console.log('✅ logo-scorus.webp'))
])
.then(() => console.log('\n✨ Logos optimizados correctamente!'))
.catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
