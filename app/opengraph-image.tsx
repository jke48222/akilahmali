import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Akilah Mali";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Social link preview (Open Graph + Twitter/X, which re-exports this) — just
 * Akilah's portrait. The source photo is square, so the 1200×630 card centers
 * it and pads the sides with the wall color baked into `public/og-portrait.jpg`
 * (pre-rendered with a feathered, seamless extension), giving a clean portrait
 * on every platform whether the card renders square (iMessage) or wide (IG,
 * LinkedIn, X).
 */
export default async function OpengraphImage() {
  const data = await readFile(join(process.cwd(), "public/og-portrait.jpg"));
  const src = `data:image/jpeg;base64,${data.toString("base64")}`;

  return new ImageResponse(
    (
      <img
        src={src}
        width={size.width}
        height={size.height}
        alt=""
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    ),
    { ...size },
  );
}
