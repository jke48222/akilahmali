import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const contentType = "image/png";
const size = { width: 1200, height: 630 };

/* =========================================================================
   THE DRIVE — crimson cinematic share card for /music/endless-cycle.

   A neon-crimson night-drive card: wet-night base, tail-light streaks, the
   album title. Referenced from the endless-cycle metadata (page.tsx) when the
   site-wide FORCE_PORTRAIT_OG policy is OFF; while it's on, every link shares
   the portrait, so this stays ready behind that single flag.

   NOTE: Next's file-based OG can't vary by the ?song= query, so this is the
   per-ALBUM card. Per-SONG cards would need per-song PATHS (e.g.
   /music/endless-cycle/[song]) rather than ?song= deep links.
   ========================================================================= */
export async function GET() {
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
            "radial-gradient(40% 50% at 18% 12%, rgba(255,60,80,0.55), transparent 60%)," +
            "radial-gradient(34% 44% at 84% 18%, rgba(255,140,60,0.42), transparent 60%)," +
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
                background: "linear-gradient(to top, rgba(255,70,90,0.9), rgba(255,150,70,0))",
                transform: `rotate(${(x - 50) * 0.5}deg)`,
                borderRadius: "8px",
              }}
            />
          ))}
        </div>

        <div style={{ display: "flex", fontSize: 26, letterSpacing: 10, color: "#ff7d92", textTransform: "uppercase" }}>
          Akilah Mali · The Drive
        </div>
        <div style={{ display: "flex", marginTop: 12, fontSize: 150, fontWeight: 700, color: "#fdeef1", lineHeight: 1 }}>
          Endless Cycle
        </div>
        <div style={{ display: "flex", marginTop: 26, fontSize: 30, color: "rgba(244,230,234,0.75)", maxWidth: 880 }}>
          a first-person drive through a rain-soaked, neon-crimson city — that never arrives
        </div>
      </div>
    ),
    { ...size },
  );
}
