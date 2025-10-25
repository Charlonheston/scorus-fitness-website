import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, parse } from 'path';

const inputDir = './public/images/about/biography';

// Lista de archivos PNG específicos a convertir
const pngFiles = [
  'benweider.png',
  'mr universo.png',
  'arnol classic.png',
  'campeon-NABBA.png'
];

async function convertLogos() {
  try {
    console.log(`🎬 Convirtiendo ${pngFiles.length} logos a WebP...`);

    for (let i = 0; i < pngFiles.length; i++) {
      const file = pngFiles[i];
      const { name } = parse(file);
      const inputPath = join(inputDir, file);
      const outputPath = join(inputDir, `${name}.webp`);

      await sharp(inputPath)
        .webp({ quality: 90, lossless: false })
        .toFile(outputPath);

      console.log(`✅ Convertido: ${file} → ${name}.webp`);
    }
    
    console.log(`🎉 ¡Conversión completada! ${pngFiles.length} logos convertidos a WebP`);
  } catch (error) {
    console.error('Error during conversion:', error);
  }
}

convertLogos();

