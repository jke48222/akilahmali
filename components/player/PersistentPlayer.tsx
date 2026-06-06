"use client";

/* =========================================================================
   The persistent player — a Siri-style fluid orb. Fixed to the corner on a
   fully transparent background, it survives navigation (mounted in the root
   layout) and breathes/morphs to whatever the global player is playing:
   layered, hue-shifted metaballs skinned in the track's accent colour, a soft
   bloom, and a luminous progress arc. Hover reveals the play/pause core; tap
   opens a frosted-glass transport panel.

   Hidden when nothing is loaded, and on immersive routes that run their own
   audio (the WRW control room / turntable) so the two never fight.
   ========================================================================= */

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { usePlayer } from "./PlayerProvider";

// Routes that own their own audio — keep the global orb out of the way.
const SILENCED_PREFIXES = ["/music/who-really-won"];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* hex → HSL so we can derive analogous hues for layered, iridescent depth. */
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16) / 255;
  const g = parseInt(m.slice(2, 4), 16) / 255;
  const b = parseInt(m.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  const d = max - min;
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}
const hsla = (h: number, s: number, l: number, a: number) =>
  `hsla(${h.toFixed(0)}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%, ${a})`;

export function PersistentPlayer() {
  const { current, isPlaying, progress, toggle, pause, next, prev, seek, getAnalyser } =
    usePlayer();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const progressRef = useRef(0);
  progressRef.current = progress;
  const playingRef = useRef(false);
  playingRef.current = isPlaying;

  const silenced = SILENCED_PREFIXES.some((p) => pathname?.startsWith(p));
  const hidden = !current || silenced;

  // Entering an immersive route that runs its own audio → pause the global player.
  useEffect(() => {
    if (silenced) pause();
  }, [silenced, pause]);

  useEffect(() => {
    if (hidden) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { h, s, l } = hexToHsl(current!.accent);
    const reduced = prefersReducedMotion();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = canvas.clientWidth || 120;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2;
    const cy = size / 2;
    const baseR = size * 0.24;
    const bins = new Uint8Array(128);

    // smoothed energy bands for fluid, non-jittery motion
    let bass = 0;
    let treble = 0;

    // One fluid metaball layer: a smooth closed curve whose radius is shaped by
    // the spectrum (mirrored for organic symmetry) plus slow idle wobble.
    const POINTS = 72;
    const drawBlob = (
      scale: number,
      amp: number,
      rot: number,
      hueShift: number,
      light: number,
      alpha: number,
      blur: number,
      energy: number,
      t: number,
    ) => {
      const pts: Array<[number, number]> = [];
      const R = baseR * scale;
      for (let i = 0; i < POINTS; i++) {
        const a = (i / POINTS) * Math.PI * 2;
        const mirror = i <= POINTS / 2 ? i : POINTS - i; // symmetric spectrum map
        const fa = bins[Math.floor((mirror / (POINTS / 2)) * 48)] / 255;
        const wobble =
          0.08 * Math.sin(a * 3 + rot) +
          0.05 * Math.sin(a * 5 - rot * 1.3) +
          0.03 * Math.sin(a * 2 + t * 1.4);
        const breathe = 0.05 * Math.sin(t * 1.6 + scale * 3);
        const r = R * (1 + wobble + breathe) + fa * amp * (0.4 + energy);
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      // smooth closed path through midpoints
      ctx.beginPath();
      const mx0 = (pts[0][0] + pts[POINTS - 1][0]) / 2;
      const my0 = (pts[0][1] + pts[POINTS - 1][1]) / 2;
      ctx.moveTo(mx0, my0);
      for (let i = 0; i < POINTS; i++) {
        const cur = pts[i];
        const nxt = pts[(i + 1) % POINTS];
        ctx.quadraticCurveTo(cur[0], cur[1], (cur[0] + nxt[0]) / 2, (cur[1] + nxt[1]) / 2);
      }
      ctx.closePath();

      const grad = ctx.createRadialGradient(cx, cy, R * 0.15, cx, cy, R + amp);
      grad.addColorStop(0, hsla(h + hueShift, s, Math.min(0.92, l + light), alpha));
      grad.addColorStop(0.55, hsla(h + hueShift, s, l, alpha * 0.65));
      grad.addColorStop(1, hsla(h + hueShift, s, l, 0));
      ctx.fillStyle = grad;
      ctx.shadowColor = hsla(h + hueShift, s, l, 0.8);
      ctx.shadowBlur = blur + energy * 22;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawProgress = (energy: number) => {
      const r = size * 0.46;
      const start = -Math.PI / 2;
      const end = start + progressRef.current * Math.PI * 2;
      // faint full track
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = hsla(h, s, l, 0.14);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // played arc
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, end);
      ctx.strokeStyle = hsla(h, s, Math.min(0.85, l + 0.1), 0.95);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.shadowColor = hsla(h, s, l, 0.9);
      ctx.shadowBlur = 6 + energy * 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // glowing head
      const hx = cx + Math.cos(end) * r;
      const hy = cy + Math.sin(end) * r;
      ctx.beginPath();
      ctx.arc(hx, hy, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = hsla(h, s, 0.95, 1);
      ctx.shadowColor = hsla(h, s, l, 1);
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const render = (t: number) => {
      const analyser = getAnalyser();
      let rawBass = 0;
      let rawTreble = 0;
      if (analyser) {
        analyser.getByteFrequencyData(bins);
        let lo = 0;
        for (let i = 0; i < 18; i++) lo += bins[i];
        let hi = 0;
        for (let i = 40; i < 90; i++) hi += bins[i];
        rawBass = lo / (18 * 255);
        rawTreble = hi / (50 * 255);
      }
      // smooth toward targets (fluid, no jitter)
      bass += (rawBass - bass) * 0.18;
      treble += (rawTreble - treble) * 0.18;
      const energy = playingRef.current ? bass : 0;

      ctx.clearRect(0, 0, size, size);

      // layered metaballs (additive within the canvas for an iridescent core)
      ctx.globalCompositeOperation = "lighter";
      drawBlob(1.0, size * 0.1, t * 0.18, 0, 0.16, 0.5, 16, energy, t);
      drawBlob(0.84, size * 0.12, -t * 0.26, 30, 0.22, 0.5, 12, energy + treble * 0.5, t);
      drawBlob(0.66, size * 0.13, t * 0.34, -28, 0.3, 0.6, 10, energy + treble, t);

      // bright liquid core
      const coreR = baseR * (0.6 + energy * 0.3);
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0, hsla(h, Math.min(1, s + 0.1), 0.97, 0.95));
      core.addColorStop(0.5, hsla(h, s, Math.min(0.85, l + 0.15), 0.5));
      core.addColorStop(1, hsla(h, s, l, 0));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "source-over";
      drawProgress(energy);
    };

    if (reduced) {
      render(0);
      return;
    }
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      render(performance.now() / 1000);
    };
    loop();
    return () => cancelAnimationFrame(rafRef.current);
  }, [hidden, current, getAnalyser]);

  if (hidden) return null;

  const accent = current!.accent;

  return (
    <div className="fixed bottom-6 right-6 z-[55] flex flex-col items-end gap-3">
      {expanded && (
        <div
          className="w-72 rounded-[22px] border border-white/10 bg-white/[0.06] p-4 text-white backdrop-blur-2xl"
          style={{
            boxShadow: `0 0 0 1px ${accent}26, 0 18px 50px -12px ${accent}40, 0 10px 40px rgba(0,0,0,0.45)`,
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.3em]" style={{ color: accent }}>
                Now Playing
              </p>
              <p className="mt-1.5 truncate font-display italic text-[20px] leading-tight">
                {current!.title}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                {current!.artist}
              </p>
            </div>
            <button
              onClick={() => setExpanded(false)}
              aria-label="Collapse player"
              className="-mr-1 -mt-1 rounded-full p-1 text-white/50 transition-colors hover:text-white"
            >
              <X size={16} strokeWidth={1.4} />
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={1000}
            value={Math.round(progress * 1000)}
            onChange={(e) => seek(Number(e.target.value) / 1000)}
            aria-label="Seek"
            className="mt-4 h-1 w-full cursor-pointer appearance-none rounded-full"
            style={{
              accentColor: accent,
              background: `linear-gradient(to right, ${accent} ${progress * 100}%, rgba(255,255,255,0.18) ${progress * 100}%)`,
            }}
          />

          <div className="mt-4 flex items-center justify-center gap-6">
            <button onClick={prev} aria-label="Previous track" className="text-white/60 transition-colors hover:text-white">
              <SkipBack size={18} strokeWidth={1.4} />
            </button>
            <button
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="grid h-11 w-11 place-items-center rounded-full text-black transition-transform hover:scale-105"
              style={{ backgroundColor: accent, boxShadow: `0 0 20px -2px ${accent}` }}
            >
              {isPlaying ? <Pause size={18} strokeWidth={1.8} /> : <Play size={18} strokeWidth={1.8} className="ml-0.5" />}
            </button>
            <button onClick={next} aria-label="Next track" className="text-white/60 transition-colors hover:text-white">
              <SkipForward size={18} strokeWidth={1.4} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Collapse player" : `Now playing: ${current!.title}. Open player`}
        className="group relative grid h-[120px] w-[120px] place-items-center bg-transparent transition-transform duration-300 hover:scale-[1.04] active:scale-95"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {/* play/pause core — fades in on hover so the orb stays clean at rest */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="relative grid h-9 w-9 place-items-center rounded-full text-white/95 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100"
          style={{ background: "rgba(0,0,0,0.28)", boxShadow: `0 0 16px -2px ${accent}` }}
          aria-hidden="true"
        >
          {isPlaying ? <Pause size={15} strokeWidth={1.8} /> : <Play size={15} strokeWidth={1.8} className="ml-0.5" />}
        </span>
      </button>
    </div>
  );
}
