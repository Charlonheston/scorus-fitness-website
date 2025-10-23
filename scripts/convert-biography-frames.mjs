#!/usr/bin/env node
/**
 * Convierte frames JPG a WebP (desktop) y WebP móvil submuestreado saltando frames.
 * Requisitos: npm i sharp
 * Uso: node scripts/convert-biography-frames.mjs
 */

import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DIRS = [
  'public/images/about/biography/frames',
  'public/images/about/biography/training-frames',
];

const QUALITY_DESKTOP = 80;
const QUALITY_MOBILE = 55;
const FRAME_STEP_MOBILE = 4; // mantener 1 de cada 4

async function ensureDir(p) {
  await fs.mkdir(p, { recursive: true }).catch(() => {});
}

async function convertDir(dir) {
  const full = path.join(__dirname, '..', dir);
  const files = (await fs.readdir(full)).filter(f => f.toLowerCase().endsWith('.jpg'));
  let converted = 0;
  for (const file of files) {
    const input = path.join(full, file);
    const base = path.basename(file, path.extname(file));
    const outDesktop = path.join(full, base + '.webp');

    // Desktop webp
    try {
      await fs.access(outDesktop).catch(async () => {
        const buf = await sharp(input).webp({ quality: QUALITY_DESKTOP }).toBuffer();
        await fs.writeFile(outDesktop, buf);
      });
    } catch (_) {}

    // Mobile submuestreado: crear carpeta mobile-webp/
    const mobileDir = path.join(full, 'mobile-webp');
    await ensureDir(mobileDir);

    // Detectar si este frame toca según step
    // Los nombres acaban en Timeline 1_XXXXXXXX.jpg
    const m = base.match(/_(\d{8})$/);
    if (!m) continue;
    const frameNumber = parseInt(m[1], 10);
    // Normalizamos al índice lógico comenzando en el primero de la serie
    // Mantener cada FRAME_STEP_MOBILE frame
    if ((frameNumber % FRAME_STEP_MOBILE) !== 0) continue;

    const outMobile = path.join(mobileDir, base + '.webp');
    try {
      await fs.access(outMobile).catch(async () => {
        const bufMob = await sharp(input).webp({ quality: QUALITY_MOBILE }).toBuffer();
        await fs.writeFile(outMobile, bufMob);
      });
    } catch (_) {}
    converted++;
  }
  return converted;
}

async function run() {
  let total = 0;
  for (const dir of INPUT_DIRS) {
    const n = await convertDir(dir);
    total += n;
    console.log(`✔ ${dir}: ${n} frames móviles generados (saltando cada ${FRAME_STEP_MOBILE - 1}).`);
  }
  console.log(`\n✅ Listo. Total móviles generados: ${total}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});


