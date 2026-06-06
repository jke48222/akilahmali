"use client";

/* =========================================================================
   The persistent, audio-reactive circle. Fixed to the corner, it survives
   navigation (mounted in the root layout) and animates to whatever the global
   player is playing — a radial frequency visualizer skinned in the current
   track's accent colour, with a progress ring. Tap to expand into transport
   controls + a scrubber.

   Hidden when nothing is loaded, and on the immersive routes that run their own
   audio (the WRW control room / turntable) so the two never fight.
   ========================================================================= */

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { usePlayer } from "./PlayerProvider";

// Routes that own their own audio — keep the global circle out of the way.
const SILENCED_PREFIXES = ["/music/who-really-won"];

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export function PersistentPlayer() {
  const { current, isPlaying, progress, toggle, pause, next, prev, seek, getAnalyser } =
    usePlayer();
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>(0);
  const progressRef = useRef(0);
  progressRef.current = progress;

  const silenced = SILENCED_PREFIXES.some((p) => pathname?.startsWith(p));
  const hidden = !current || silenced;

  // Entering an immersive route that runs its own audio → pause the global
  // player so the two don't overlap.
  useEffect(() => {
    if (silenced) pause();
  }, [silenced, pause]);

  useEffect(() => {
    if (hidden) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const accent = current!.accent;
    const mode = current!.mode;
    const reduced = prefersReducedMotion();

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = canvas.clientWidth || 72;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const bins = new Uint8Array(128);
    const cx = size / 2;
    const cy = size / 2;
    const coreR = size * 0.2;
    const ringR = size * 0.44;

    const drawProgressRing = () => {
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.9;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, -Math.PI / 2, -Math.PI / 2 + progressRef.current * Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    };

    const frame = () => {
      rafRef.current = requestAnimationFrame(frame);
      const analyser = getAnalyser();
      ctx.clearRect(0, 0, size, size);

      let level = 0;
      if (analyser) {
        analyser.getByteFrequencyData(bins);
        let sum = 0;
        for (let i = 0; i < 28; i++) sum += bins[i];
        level = sum / (28 * 255);
      }

      if (mode === "bars") {
        const bars = 56;
        ctx.lineCap = "round";
        ctx.lineWidth = 2;
        for (let i = 0; i < bars; i++) {
          const v = analyser ? bins[Math.floor((i / bars) * 96)] / 255 : 0;
          const ang = (i / bars) * Math.PI * 2 - Math.PI / 2;
          const r1 = coreR + 2;
          const r2 = r1 + 3 + v * size * 0.22;
          ctx.strokeStyle = accent;
          ctx.globalAlpha = 0.3 + v * 0.7;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
          ctx.lineTo(cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      } else {
        // pulse: concentric halo rings that swell with the low end
        for (let k = 0; k < 3; k++) {
          const r = coreR + (size * 0.06) * (k + 1) + level * size * 0.16 * (k + 1);
          ctx.strokeStyle = accent;
          ctx.globalAlpha = Math.max(0, 0.32 - k * 0.1) + level * 0.3;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // glowing core
      ctx.fillStyle = accent;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 8 + level * 16;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * (0.78 + level * 0.28), 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      drawProgressRing();
    };

    if (reduced) {
      // static: core + progress ring, no animation loop
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();
      drawProgressRing();
      return;
    }

    frame();
    return () => cancelAnimationFrame(rafRef.current);
    // re-init when the track (accent/mode) changes or visibility flips
  }, [hidden, current, getAnalyser]);

  if (hidden) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[55] flex flex-col items-end gap-3">
      {expanded && (
        <div className="w-64 rounded-2xl border border-white/15 bg-black/80 p-4 text-white shadow-2xl backdrop-blur-md">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-display italic text-[18px] leading-tight">
                {current!.title}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
                {current!.artist}
              </p>
            </div>
            <button
              onClick={() => setExpanded(false)}
              aria-label="Collapse player"
              className="-mr-1 -mt-1 p-1 text-white/60 transition-colors hover:text-white"
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
            className="mt-3 w-full accent-current"
            style={{ color: current!.accent }}
          />

          <div className="mt-2 flex items-center justify-center gap-5">
            <button onClick={prev} aria-label="Previous track" className="text-white/70 transition-colors hover:text-white">
              <SkipBack size={18} strokeWidth={1.4} />
            </button>
            <button
              onClick={toggle}
              aria-label={isPlaying ? "Pause" : "Play"}
              className="grid h-10 w-10 place-items-center rounded-full text-black"
              style={{ backgroundColor: current!.accent }}
            >
              {isPlaying ? <Pause size={18} strokeWidth={1.6} /> : <Play size={18} strokeWidth={1.6} />}
            </button>
            <button onClick={next} aria-label="Next track" className="text-white/70 transition-colors hover:text-white">
              <SkipForward size={18} strokeWidth={1.4} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setExpanded((v) => !v)}
        aria-label={expanded ? "Collapse player" : `Now playing: ${current!.title}`}
        className="relative grid h-[72px] w-[72px] place-items-center rounded-full bg-black/70 shadow-2xl backdrop-blur-md transition-transform hover:scale-105"
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        {/* center hit affordance — toggles play on direct tap of the core */}
        <span
          onClick={(e) => {
            e.stopPropagation();
            toggle();
          }}
          className="relative grid h-7 w-7 place-items-center rounded-full text-black"
          aria-hidden="true"
        >
          {isPlaying ? <Pause size={14} strokeWidth={1.8} /> : <Play size={14} strokeWidth={1.8} />}
        </span>
      </button>
    </div>
  );
}
