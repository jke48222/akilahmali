import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Akilah Mali — singer & songwriter, Atlanta";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [fraunces, mono] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Fraunces-Italic.ttf")),
    readFile(join(process.cwd(), "assets/fonts/SpaceMono-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#1B1520",
          backgroundImage:
            "radial-gradient(70% 60% at 22% 18%, rgba(124,92,191,0.45) 0%, rgba(124,92,191,0) 60%)",
          color: "#F3ECF6",
          fontFamily: "Space Mono",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#9B7FD4",
          }}
        >
          <span>singer · songwriter</span>
          <span>est. 2025</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Fraunces",
              fontStyle: "italic",
              fontSize: 168,
              lineHeight: 0.95,
              letterSpacing: -4,
            }}
          >
            akilah mali
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 26,
              lineHeight: 1.5,
              maxWidth: 760,
              color: "#C9C0D6",
            }}
          >
            songs about the people she used to know, and the rooms she left them
            in.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#7D7589",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 10,
              backgroundColor: "#7C5CBF",
            }}
          />
          akilahmali.com
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, style: "italic", weight: 400 },
        { name: "Space Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
