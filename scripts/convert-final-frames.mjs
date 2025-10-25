import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const inputDir = 'public/images/about/biography/final-frames';

async function convertFinalFrames() {
  try {
    const files = await readdir(inputDir);
    const jpgFiles = files.filter(f => f.toLowerCase().endsWith('.jpg'));
    
    console.log(`🎬 Encontrados ${jpgFiles.length} frames JPG para convertir...`);
    
    let converted = 0;
    for (const file of jpgFiles) {
      const inputPath = join(inputDir, file);
      const outputPath = inputPath.replace(/\.jpg$/i, '.webp');
      
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      converted++;
      if (converted % 20 === 0) {
        console.log(`✅ Convertidos ${converted}/${jpgFiles.length} frames...`);
      }
    }
    
    console.log(`🎉 ¡Conversión completada! ${converted} frames convertidos a WebP`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

convertFinalFrames();

