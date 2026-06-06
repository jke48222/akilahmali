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
import { CATALOG } from "@/lib/player/catalog";
import { AppleIcon, SpotifyIcon } from "@/components/icons";

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
  const { current, isPlaying, progress, play, toggle, pause, next, prev, seek, getAnalyser } =
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
    const c2 = hexToHsl(current!.accent2);
    const mode = current!.mode;
    const reduced = prefersReducedMotion();

    // Two-tone palette helpers: blend the track's accent → accent2 along [0,1]
    // for richer, prettier gradients than a single hue.
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const lerpHue = (a: number, b: number, t: number) => {
      const d = ((b - a + 540) % 360) - 180;
      return (a + d * t + 360) % 360;
    };
    const col = (mix: number, alpha: number, dl = 0) =>
      hsla(
        lerpHue(h, c2.h, mix),
        lerp(s, c2.s, mix),
        Math.min(0.96, lerp(l, c2.l, mix) + dl),
        alpha,
      );

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
      mix: number,
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
      grad.addColorStop(0, col(mix, alpha, light));
      grad.addColorStop(0.55, col(mix, alpha * 0.65));
      grad.addColorStop(1, col(mix, 0));
      ctx.fillStyle = grad;
      ctx.shadowColor = col(mix, 0.8);
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
      ctx.strokeStyle = col(0, 0.14);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // played arc (accent → accent2 along its sweep via the head colour)
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, end);
      ctx.strokeStyle = col(progressRef.current, 0.95, 0.1);
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.shadowColor = col(progressRef.current, 0.9);
      ctx.shadowBlur = 6 + energy * 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
      // glowing head
      const hx = cx + Math.cos(end) * r;
      const hy = cy + Math.sin(end) * r;
      ctx.beginPath();
      ctx.arc(hx, hy, 2.4, 0, Math.PI * 2);
      ctx.fillStyle = col(progressRef.current, 1, 0.25);
      ctx.shadowColor = col(progressRef.current, 1);
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    // Bright liquid centre — shared identity across modes.
    const drawCore = (energy: number, scale = 1) => {
      const coreR = baseR * (0.55 + energy * 0.3) * scale;
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
      core.addColorStop(0, col(0, 0.95, 0.32));
      core.addColorStop(0.5, col(0.4, 0.5, 0.1));
      core.addColorStop(1, col(0, 0));
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
    };

    // AURORA — layered fluid metaballs blending accent → accent2.
    const drawAurora = (t: number, energy: number) => {
      drawBlob(1.0, size * 0.1, t * 0.18, 0, 0.16, 0.5, 16, energy, t);
      drawBlob(0.84, size * 0.12, -t * 0.26, 0.55, 0.22, 0.5, 12, energy + treble * 0.5, t);
      drawBlob(0.66, size * 0.13, t * 0.34, 1, 0.3, 0.6, 10, energy + treble, t);
      drawCore(energy);
    };

    // WAVE — a circular oscilloscope ribbon that ripples with the spectrum.
    const drawWave = (t: number, energy: number) => {
      const N = 96;
      const ringR = baseR * 1.05;
      const amp = size * 0.14;
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + t * 0.25;
        const m = i <= N / 2 ? i : N - i;
        const fa = bins[Math.floor((m / (N / 2)) * 60)] / 255;
        const ripple = 0.04 * Math.sin(a * 6 - t * 3);
        const r = ringR * (1 + ripple) + fa * amp * (0.5 + energy);
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      ctx.beginPath();
      ctx.moveTo((pts[0][0] + pts[N - 1][0]) / 2, (pts[0][1] + pts[N - 1][1]) / 2);
      for (let i = 0; i < N; i++) {
        const cur = pts[i];
        const nxt = pts[(i + 1) % N];
        ctx.quadraticCurveTo(cur[0], cur[1], (cur[0] + nxt[0]) / 2, (cur[1] + nxt[1]) / 2);
      }
      ctx.closePath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = col(0.35, 0.92, 0.12);
      ctx.shadowColor = col(0, 1);
      ctx.shadowBlur = 12 + energy * 20;
      ctx.stroke();
      ctx.shadowBlur = 0;
      drawCore(energy, 0.7);
    };

    // BLOOM — flowering petals (k-fold symmetry), opening with the music.
    const drawBloom = (t: number, energy: number) => {
      const N = 120;
      const petals = 6;
      const R = baseR * 0.95;
      const depth = 0.38 + energy * 0.5;
      const pts: Array<[number, number]> = [];
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2 + t * 0.2;
        const petal = Math.abs(Math.cos((petals * a) / 2));
        const fa = bins[i % 64] / 255;
        const r = R * (0.45 + depth * petal) + fa * size * 0.05;
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < N; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.closePath();
      const grad = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * (0.45 + depth));
      grad.addColorStop(0, col(0, 0.85, 0.2));
      grad.addColorStop(0.6, col(0.6, 0.5));
      grad.addColorStop(1, col(1, 0));
      ctx.fillStyle = grad;
      ctx.shadowColor = col(0.3, 0.9);
      ctx.shadowBlur = 14 + energy * 22;
      ctx.fill();
      ctx.shadowBlur = 0;
      drawCore(energy, 0.8);
    };

    // ORBIT — particles circling at band-driven radii.
    const drawOrbit = (t: number, energy: number) => {
      const M = 22;
      for (let i = 0; i < M; i++) {
        const fa = bins[Math.floor((i / M) * 70)] / 255;
        const a = (i / M) * Math.PI * 2 + t * (0.5 + (i % 3) * 0.18);
        const r = baseR * (0.5 + (i % 3) * 0.22) + fa * size * 0.14 + energy * size * 0.06;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        const rad = 1.2 + fa * 2.6;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fillStyle = col(i % 2 ? 1 : 0, 0.85, 0.1 + fa * 0.2);
        ctx.shadowColor = col(0.5, 1);
        ctx.shadowBlur = 8 + fa * 14;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      drawCore(energy, 0.7);
    };

    // PULSE — sonar rings expanding from the centre on the beat.
    const drawPulse = (t: number, energy: number) => {
      const rings = 4;
      const maxR = size * 0.46;
      for (let k = 0; k < rings; k++) {
        const phase = (t * 0.4 + k / rings) % 1;
        const r = phase * maxR;
        const fade = (1 - phase) * (0.5 + energy * 0.6);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = col(phase, Math.max(0, fade), 0.1);
        ctx.lineWidth = 1.5 + energy * 2.5;
        ctx.shadowColor = col(0, 0.8);
        ctx.shadowBlur = 8;
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      drawCore(energy);
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
      ctx.globalCompositeOperation = "lighter";
      switch (mode) {
        case "wave":
          drawWave(t, energy);
          break;
        case "bloom":
          drawBloom(t, energy);
          break;
        case "orbit":
          drawOrbit(t, energy);
          break;
        case "pulse":
          drawPulse(t, energy);
          break;
        default:
          drawAurora(t, energy);
      }
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
          className="w-72 rounded-[22px] border border-white/10 p-4 text-white backdrop-blur-2xl"
          style={{
            // Dark glass so white text + accent read on the site's light theme.
            background: "rgba(14, 12, 20, 0.88)",
            boxShadow: `0 0 0 1px ${accent}40, 0 18px 50px -12px ${accent}55, 0 12px 44px rgba(0,0,0,0.5)`,
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
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">
                {current!.artist} · 30s preview
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

          {/* song picker — choose any track to play */}
          <div className="mt-3 max-h-44 space-y-0.5 overflow-y-auto pr-1">
            {CATALOG.map((t) => {
              const active = current!.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => play(t)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/10"
                >
                  <span
                    className="grid h-5 w-5 shrink-0 place-items-center"
                    style={{ color: active ? accent : "rgba(255,255,255,0.5)" }}
                  >
                    {active && isPlaying ? (
                      <Pause size={11} strokeWidth={2} />
                    ) : (
                      <Play size={11} strokeWidth={2} className="ml-px" />
                    )}
                  </span>
                  <span
                    className="min-w-0 flex-1 truncate text-[13px] leading-tight"
                    style={active ? { color: accent } : { color: "rgba(255,255,255,0.78)" }}
                  >
                    {t.title}
                  </span>
                  {active ? (
                    <span className="font-mono text-[8px] uppercase tracking-[0.22em] text-white/40">
                      {isPlaying ? "playing" : "paused"}
                    </span>
                  ) : null}
                </button>
              );
            })}
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

          {/* Stream the FULL song where it counts — the site only previews. */}
          <div className="mt-4 border-t border-white/10 pt-3">
            <p className="mb-2 text-center font-mono text-[8px] uppercase tracking-[0.24em] text-white/40">
              stream the full song
            </p>
            <div className="flex items-center gap-2">
              <a
                href={current!.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 py-2 text-[11px] font-medium transition-colors hover:bg-white/20"
              >
                <SpotifyIcon width="14" height="14" /> Spotify
              </a>
              <a
                href={current!.apple}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 py-2 text-[11px] font-medium transition-colors hover:bg-white/20"
              >
                <AppleIcon width="13" height="13" /> Apple Music
              </a>
            </div>
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
