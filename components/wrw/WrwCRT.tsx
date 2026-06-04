"use client";

/* Reusable post layer — vignette + film grain + scanlines, pure CSS so it
   composites over the WebGL canvas without a postprocessing dependency. */
const GRAIN =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

export function WrwCRT({ z = 30 }: { z?: number }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0" style={{ zIndex: z }}>
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(120% 120% at 50% 48%, transparent 54%, rgba(0,0,0,0.6) 100%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-screen"
        style={{ backgroundImage: GRAIN }}
      />
      <div
        className="absolute inset-0 opacity-25"
        style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.4) 0 1px, transparent 1px 3px)" }}
      />
    </div>
  );
}
