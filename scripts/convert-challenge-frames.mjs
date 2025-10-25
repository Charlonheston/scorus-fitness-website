#!/usr/bin/env node
/**
 * Convierte todos los frames de escritorio del nuevo video a WebP (calidad alta)
 * y genera una versión móvil subsampleada (saltando frames) en mobile-webp/.
 *
 * Uso: node scripts/convert-challenge-frames.mjs [step]
 *  - step (opcional): cada cuántos frames conservar en móvil (por defecto: 4)
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

const DESKTOP_DIR = path.resolve('public/images/about/biography/challenge-frames');
const MOBILE_DIR = path.join(DESKTOP_DIR, 'mobile-webp');
const STEP = Math.max(2, Number(process.argv[2]) || 4); // salto para móvil

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true }).catch(() => {});
}

function isImage(file) {
  const ext = path.extname(file).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
}

function toWebpName(file) {
  return path.basename(file, path.extname(file)) + '.webp';
}

async function convertDesktopToWebp(files) {
  let converted = 0, skipped = 0;
  for (const file of files) {
    const inputPath = path.join(DESKTOP_DIR, file);
    const outputName = toWebpName(file);
    const outputPath = path.join(DESKTOP_DIR, outputName);
    try {
      // si ya existe el .webp, saltar
      await fs.access(outputPath);
      skipped++;
      continue;
    } catch {}
    // convertir a webp (calidad 80) sin reescalar
    const buf = await sharp(inputPath).webp({ quality: 80 }).toBuffer();
    await fs.writeFile(outputPath, buf);
    converted++;
  }
  return { converted, skipped };
}

async function generateMobileSubset(files) {
  let written = 0;
  await ensureDir(MOBILE_DIR);
  for (let idx = 0; idx < files.length; idx += STEP) {
    const file = files[idx];
    const desktopWebp = path.join(DESKTOP_DIR, toWebpName(file));
    const mobileOut = path.join(MOBILE_DIR, toWebpName(file));
    try {
      await fs.access(mobileOut);
      continue; // ya existe
    } catch {}
    // compresión más agresiva para móvil
    const buf = await sharp(desktopWebp).webp({ quality: 55 }).toBuffer();
    await fs.writeFile(mobileOut, buf);
    written++;
  }
  return { written };
}

async function main() {
  console.log(`➡️  Directorio desktop: ${DESKTOP_DIR}`);
  console.log(`➡️  Directorio móvil:   ${MOBILE_DIR}`);
  console.log(`➡️  Submuestreo móvil cada ${STEP} frames`);

  await ensureDir(DESKTOP_DIR);
  await ensureDir(MOBILE_DIR);

  let files = await fs.readdir(DESKTOP_DIR);
  files = files.filter(isImage).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (files.length === 0) {
    console.log('⚠️  No se encontraron imágenes en challenge-frames.');
    return;
  }

  const { converted, skipped } = await convertDesktopToWebp(files);
  const { written } = await generateMobileSubset(files);

  console.log('\n📊 Resumen');
  console.log(`  ✅ Desktop convertidos: ${converted} (omitidos: ${skipped})`);
  console.log(`  📱 Móvil escritos:      ${written} (step=${STEP})`);
}

main().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});


