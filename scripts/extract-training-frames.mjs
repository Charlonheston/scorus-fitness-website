#!/usr/bin/env node

/**
 * Script para extraer frames del video bernat-training.webm
 * Genera 150 frames en formato WebP optimizado
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuración
const VIDEO_INPUT = join(projectRoot, 'public/videos/biography/bernat-training.webm');
const OUTPUT_DIR = join(projectRoot, 'public/images/about/biography/training-frames');
const TOTAL_FRAMES = 150;
const QUALITY = 85; // Calidad WebP (0-100)
const MAX_WIDTH = 1920; // Ancho máximo para optimizar peso

console.log('🎬 Extrayendo frames del video de entrenamiento...\n');

// Verificar que existe el video
if (!existsSync(VIDEO_INPUT)) {
  console.error(`❌ Error: No se encuentra el video en ${VIDEO_INPUT}`);
  process.exit(1);
}

// Crear directorio de salida si no existe
if (!existsSync(OUTPUT_DIR)) {
  console.log(`📁 Creando directorio: ${OUTPUT_DIR}`);
  mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Obtener duración del video
console.log('⏱️  Obteniendo duración del video...');
const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${VIDEO_INPUT}"`;
const duration = parseFloat(execSync(durationCmd, { encoding: 'utf-8' }).trim());
console.log(`   Duración: ${duration.toFixed(2)} segundos`);

// Calcular FPS para extraer exactamente TOTAL_FRAMES
const fps = TOTAL_FRAMES / duration;
console.log(`   FPS para ${TOTAL_FRAMES} frames: ${fps.toFixed(4)}`);

// Comando ffmpeg para extraer frames
const ffmpegCmd = `ffmpeg -i "${VIDEO_INPUT}" -vf "fps=${fps},scale=${MAX_WIDTH}:-1:flags=lanczos" -q:v ${QUALITY} -f image2 "${OUTPUT_DIR}/frame-%03d.webp"`;

console.log('\n🎞️  Extrayendo frames...');
console.log(`   Comando: ${ffmpegCmd}\n`);

try {
  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log('\n✅ Frames extraídos correctamente!');
  console.log(`📂 Ubicación: ${OUTPUT_DIR}`);
  console.log(`🖼️  Total de frames: ${TOTAL_FRAMES}`);
  console.log(`📏 Resolución máxima: ${MAX_WIDTH}px de ancho`);
  console.log(`💎 Calidad WebP: ${QUALITY}%`);
} catch (error) {
  console.error('\n❌ Error al extraer frames:', error.message);
  process.exit(1);
}

