// Generates brand PNG icons (no external deps) using Node's zlib for PNG encoding.
// Produces public/icon-192.png and public/icon-512.png — a brand gradient with a
// rounded "graduation cap" mark, so the PWA / installed app has a real icon.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public');
mkdirSync(outDir, { recursive: true });

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function buildPng(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // brand colors
  const c1 = [124, 92, 255]; // #7c5cff
  const c2 = [34, 211, 238]; // #22d3ee
  const bg = [11, 16, 32]; // #0b1020
  const radius = size * 0.22;

  const raw = Buffer.alloc(size * (size * 4 + 1));
  let p = 0;
  for (let y = 0; y < size; y++) {
    raw[p++] = 0; // filter: none
    for (let x = 0; x < size; x++) {
      // rounded-rect mask
      const dx = Math.max(radius - x, x - (size - 1 - radius), 0);
      const dy = Math.max(radius - y, y - (size - 1 - radius), 0);
      const inside = dx * dx + dy * dy <= radius * radius;
      const t = (x + y) / (2 * size);
      let r = lerp(c1[0], c2[0], t);
      let g = lerp(c1[1], c2[1], t);
      let b = lerp(c1[2], c2[2], t);
      if (!inside) {
        r = bg[0];
        g = bg[1];
        b = bg[2];
      }
      // graduation-cap "M" mark in the center band
      const nx = x / size;
      const ny = y / size;
      const onMark =
        inside &&
        ny > 0.34 &&
        ny < 0.66 &&
        ((Math.abs(nx - 0.32) < 0.05) ||
          (Math.abs(nx - 0.68) < 0.05) ||
          (Math.abs(ny - 0.5 - (nx - 0.5) * 0.9) < 0.05 && nx < 0.5) ||
          (Math.abs(ny - 0.5 + (nx - 0.5) * 0.9) < 0.05 && nx > 0.5));
      if (onMark) {
        r = 255;
        g = 255;
        b = 255;
      }
      raw[p++] = Math.round(r);
      raw[p++] = Math.round(g);
      raw[p++] = Math.round(b);
      raw[p++] = inside ? 255 : 0;
    }
  }

  const idat = deflateSync(raw, { level: 9 });
  const png = Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return png;
}

for (const size of [192, 512]) {
  const png = buildPng(size);
  writeFileSync(join(outDir, `icon-${size}.png`), png);
  console.log(`wrote public/icon-${size}.png (${png.length} bytes)`);
}
