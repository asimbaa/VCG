import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcInput);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with scanline filter byte (0) per row
  const rowBytes = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowBytes);

  const cx = width / 2;
  const cy = height / 2;
  const maxR = Math.hypot(cx, cy);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowBytes;
    rawData[rowOffset] = 0; // filter type 0: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);

      // Deep dark slate background (#020617 to #0f172a)
      let r = 2;
      let g = 6;
      let b = 23;
      let a = 255;

      // Glow circle in center
      const glowFactor = Math.max(0, 1 - dist / (width * 0.45));
      if (glowFactor > 0) {
        // Emerald/cyan tint
        r = Math.min(255, Math.floor(r + glowFactor * 16));
        g = Math.min(255, Math.floor(g + glowFactor * 185));
        b = Math.min(255, Math.floor(b + glowFactor * 129));
      }

      // Draw stylized "V" monogram in the safe center
      // Scaled coordinates: -1 to 1
      const nx = (x - cx) / (width * 0.28);
      const ny = (y - cy) / (height * 0.28);

      // V shape: left arm nx = - (0.5 - ny*0.6), right arm nx = (0.5 - ny*0.6)
      // For ny between -0.7 and 0.7
      if (ny >= -0.7 && ny <= 0.7) {
        const expectedX = Math.abs(ny) * 0.65;
        const armDist = Math.abs(Math.abs(nx) - (0.7 - (0.7 - ny) * 0.45));
        
        // Golden angle V lines
        const leftArmDist = Math.abs(nx - (ny * 0.55));
        const rightArmDist = Math.abs(nx - (-ny * 0.55));
        
        if (leftArmDist < 0.16 || rightArmDist < 0.16) {
          // Sovereign Gold / Emerald accent
          const goldFactor = (ny + 0.7) / 1.4;
          r = Math.floor(255 * (1 - goldFactor * 0.3));
          g = Math.floor(215 + goldFactor * 25);
          b = Math.floor(80 + goldFactor * 80);
          a = 255;
        }
      }

      // Outer border circle ring for maskable/app icons
      const ringDist = Math.abs(dist - width * 0.42);
      if (ringDist < width * 0.015) {
        r = 16;
        g = 185;
        b = 129;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. apple-touch-icon.png (180x180)
const appleIcon = createPng(180, 180, false);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log('Created apple-touch-icon.png (180x180)');

// 2. pwa-192x192.png
const pwa192 = createPng(192, 192, false);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);
console.log('Created pwa-192x192.png');

// 3. pwa-512x512.png
const pwa512 = createPng(512, 512, false);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);
console.log('Created pwa-512x512.png');

// 4. pwa-maskable-512x512.png
const pwaMaskable = createPng(512, 512, true);
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable);
console.log('Created pwa-maskable-512x512.png');
