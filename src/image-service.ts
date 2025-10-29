/**
 * Servicio personalizado de Sharp para optimización agresiva de imágenes
 * Configurado para maximizar compresión manteniendo calidad aceptable
 */

import { sharpImageService } from 'astro/assets/services/sharp';
import type { LocalImageService } from 'astro';

const customSharpService: LocalImageService = {
  ...sharpImageService,
  transform: async (inputBuffer, transformOptions) => {
    // Configuración optimizada de Sharp
    const { default: sharp } = await import('sharp');
    
    let transform = sharp(inputBuffer, {
      failOnError: false,
      limitInputPixels: false,
    });

    // Redimensionar si es necesario
    if (transformOptions.width || transformOptions.height) {
      transform = transform.resize({
        width: transformOptions.width,
        height: transformOptions.height,
        fit: transformOptions.fit || 'cover',
        position: 'centre',
        withoutEnlargement: true,
      });
    }

    // Aplicar formato y compresión optimizada
    const format = transformOptions.format || 'webp';
    
    switch (format) {
      case 'webp':
        transform = transform.webp({
          quality: 70, // Reducido de 75 para mejor compresión
          effort: 6, // Máximo esfuerzo de compresión (0-6)
          smartSubsample: true,
          nearLossless: false,
        });
        break;
      case 'jpeg':
      case 'jpg':
        transform = transform.jpeg({
          quality: 70, // Reducido de 75
          progressive: true,
          mozjpeg: true,
          optimizeScans: true,
        });
        break;
      case 'png':
        transform = transform.png({
          quality: 80,
          compressionLevel: 9, // Máxima compresión
          progressive: true,
          palette: true,
        });
        break;
      case 'avif':
        transform = transform.avif({
          quality: 65,
          effort: 9, // Máximo esfuerzo
          chromaSubsampling: '4:2:0',
        });
        break;
    }

    // Aplicar optimizaciones adicionales
    transform = transform
      .rotate() // Auto-rotar según EXIF
      .withMetadata({ orientation: 1 }); // Remover otros metadatos EXIF

    const { data, info } = await transform.toBuffer({ resolveWithObject: true });

    return {
      data,
      format: info.format as any,
    };
  },
};

export default customSharpService;

