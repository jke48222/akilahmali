import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const contentType = "image/png";
const size = { width: 1200, height: 630 };

/* =========================================================================
   Per-SONG / per-STATION share card (query-driven, so one route serves every
   song). A crimson-family cinematic card: title + hook line over a wet-night
   gradient skinned to the song's accent.

     /song-og?title=Strange&subtitle=the%20tower%20of%20roses…&accent=%23ff4d6d

   This is the "custom OG image per station" generator (Part 2 §9). It's wired
   and ready behind the site-wide FORCE_PORTRAIT_OG policy (lib/og.ts): while
   that flag is on every share is the portrait, so nothing references this yet —
   flip the flag (and the per-song metadata branch) to switch share cards over.
   ========================================================================= */
function clampHex(v: string | null, fallback: string): string {
  return v && /^#?[0-9a-fA-F]{6}$/.test(v) ? (v.startsWith("#") ? v : `#${v}`) : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "Akilah Mali").slice(0, 60);
  const subtitle = (searchParams.get("subtitle") ?? "").slice(0, 140);
  const accent = clampHex(searchParams.get("accent"), "#ff3a46");
  const accent2 = clampHex(searchParams.get("accent2"), "#ff8a4c");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0a0204",
          backgroundImage:
            `radial-gradient(40% 50% at 18% 12%, ${accent}99, transparent 60%),` +
            `radial-gradient(34% 44% at 84% 18%, ${accent2}7a, transparent 60%),` +
            "radial-gradient(60% 60% at 60% 110%, rgba(180,20,50,0.6), transparent 60%)",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        {/* tail-light streaks converging toward a vanishing point */}
        <div style={{ position: "absolute", display: "flex", left: 0, bottom: 0, width: "100%", height: "100%" }}>
          {[18, 30, 46, 62, 78].map((x, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `${x}%`,
                bottom: "-10%",
                width: "10px",
                height: "70%",
                background: `linear-gradient(to top, ${accent}e6, ${accent2}00)`,
                transform: `rotate(${(x - 50) * 0.5}deg)`,
                borderRadius: "8px",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", fontSize: 26, letterSpacing: 10, color: "#ff7d92", textTransform: "uppercase" }}>
          Akilah Mali
        </div>
        <div style={{ display: "flex", marginTop: 12, fontSize: 128, fontWeight: 700, color: "#fdeef1", lineHeight: 1 }}>
          {title}
        </div>
        {subtitle ? (
          <div style={{ display: "flex", marginTop: 26, fontSize: 32, color: "rgba(244,230,234,0.78)", maxWidth: 940, fontStyle: "italic" }}>
            {subtitle}
          </div>
        ) : null}
      </div>
    ),
    { ...size },
  );
}
