/**
 * Generates the raster icon set from app/icon.svg (the source of truth):
 *   - app/favicon.ico        (16/32/48, legacy browsers + crawlers)
 *   - app/apple-icon.png     (180, square full-bleed for iOS masking)
 *   - public/icon-192.png    (PWA / Android, maskable)
 *   - public/icon-512.png    (PWA / Android, maskable + splash)
 *
 * Run after editing app/icon.svg:  node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(ROOT, "app/icon.svg"));
// Square full-bleed variant (no rounded corners) — iOS applies its own mask.
const squareSvg = Buffer.from(
  readFileSync(join(ROOT, "app/icon.svg"), "utf8").replace(/rx="14"/, 'rx="0"'),
);

const png = (src, size) =>
  sharp(src, { density: 600 }).resize(size, size).png().toBuffer();

/** Pack PNG buffers into a single .ico (PNG-compressed entries). */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);
  const dir = Buffer.alloc(16 * entries.length);
  let offset = 6 + dir.length;
  entries.forEach((e, i) => {
    const o = i * 16;
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, o); // width
    dir.writeUInt8(e.size >= 256 ? 0 : e.size, o + 1); // height
    dir.writeUInt8(0, o + 2); // palette
    dir.writeUInt8(0, o + 3); // reserved
    dir.writeUInt16LE(1, o + 4); // color planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(e.data.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += e.data.length;
  });
  return Buffer.concat([header, dir, ...entries.map((e) => e.data)]);
}

const sizes = [16, 32, 48];
const icoEntries = await Promise.all(
  sizes.map(async (size) => ({ size, data: await png(svg, size) })),
);
writeFileSync(join(ROOT, "app/favicon.ico"), buildIco(icoEntries));
console.log("✓ app/favicon.ico");

writeFileSync(join(ROOT, "app/apple-icon.png"), await png(squareSvg, 180));
console.log("✓ app/apple-icon.png (180)");

writeFileSync(join(ROOT, "public/icon-192.png"), await png(svg, 192));
writeFileSync(join(ROOT, "public/icon-512.png"), await png(svg, 512));
console.log("✓ public/icon-192.png + public/icon-512.png");
