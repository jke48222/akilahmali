/**
 * Generates standalone brand wordmark SVGs (for the press kit / off-site use)
 * with the Fraunces display face embedded as base64, so they render in the
 * real brand type anywhere — no font install required.
 *
 *   node scripts/generate-logos.mjs
 *
 * Outputs to public/logo/:
 *   akilah-mali-wordmark-ink.svg    (ink #1B1520, on transparent)
 *   akilah-mali-wordmark-cream.svg  (cream #F3ECF6, for dark backgrounds)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public/logo");
mkdirSync(OUT, { recursive: true });

const fontB64 = readFileSync(join(ROOT, "assets/fonts/Fraunces-Italic.ttf")).toString("base64");

const wordmark = (color) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 280" role="img" aria-label="akilah mali">
  <style>
    @font-face{font-family:'Fraunces';font-style:italic;font-weight:400;src:url(data:font/ttf;base64,${fontB64}) format('truetype');}
    .wm{font-family:'Fraunces','Georgia',serif;font-style:italic;font-weight:400;}
  </style>
  <text class="wm" x="500" y="190" text-anchor="middle" font-size="180" letter-spacing="-6" fill="${color}">akilah mali</text>
</svg>
`;

writeFileSync(join(OUT, "akilah-mali-wordmark-ink.svg"), wordmark("#1B1520"));
writeFileSync(join(OUT, "akilah-mali-wordmark-cream.svg"), wordmark("#F3ECF6"));
console.log("✓ public/logo/akilah-mali-wordmark-{ink,cream}.svg");
