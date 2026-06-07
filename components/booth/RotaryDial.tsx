"use client";

/* =========================================================================
   THE ROTARY DIAL — a real, crimson-lit metal dial (DOM/SVG over the booth).

   Rendered to match the set: dark red metal with a hot crimson key highlight
   (upper-left) and a cold blue rim (lower-right), deep recessed finger holes,
   embossed numbers INSIDE the holes, a domed chrome-red hub and finger-stop.
   Just the readout, the dial, and ⌫ / CALL / ✕. Two ways to dial:
     • CLICK a number — the easy way; the wheel spins to the stop and back.
     • DRAG a number to the finger-stop and release — like a real dial.

   Performance: the rotating wheel has NO svg mask/filter (those re-rasterise
   every frame). Holes are solid wells, all depth is gradients, and the wheel
   only mutates its `transform` → it stays on the compositor (≈120fps).

   Keyboard (accessibility): 0-9 dial · Enter = call · Backspace = clear · Esc.
   ========================================================================= */

import { useCallback, useEffect, useRef } from "react";

const CENTER = 100;
const STEP = 30; // degrees between holes
const START = -135; // angle of the first hole ("0"), clockwise from 12 o'clock
const STOP_ANGLE = START + STEP * 10; // 165° — finger-stop just past the last hole

const FINGER_R = 72; // radius of the finger holes (numbers live here too)
const HOLE_R = 10.5; // small wells → clear air between holes (centres ~37px apart)
const HUB_R = 16;

// a short uniform finger arc dials ANY digit; the wheel still travels fully
const FINGER_ARC = 78;
const REGISTER_AT = 0.6; // fraction of FINGER_ARC that commits a drag
const TAP_EPS = 6; // < this much drag (deg) on release counts as a click

const HOLES = Array.from({ length: 10 }, (_, i) => {
  const angle = START + STEP * i;
  const label = i === 0 ? "0" : String(10 - i);
  const travel = STOP_ANGLE - angle; // clockwise degrees from rest to the stop
  return { i, angle, label, travel };
});

const rad = (deg: number) => (deg * Math.PI) / 180;
const posX = (r: number, deg: number) => CENTER + r * Math.sin(rad(deg));
const posY = (r: number, deg: number) => CENTER - r * Math.cos(rad(deg));

function normalize(d: number) {
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export function RotaryDial({
  dialed,
  status,
  onDigit,
  onCall,
  onClear,
  onHangup,
}: {
  dialed: string;
  status: string;
  onDigit: (d: string) => void;
  onCall: () => void;
  onClear: () => void;
  onHangup: () => void;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const wheelRef = useRef<SVGGElement | null>(null);
  const rotRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const dragRef = useRef<{ holeIdx: number; grabAngle: number; travel: number } | null>(null);
  const progressRef = useRef(0); // 0..1 of FINGER_ARC dragged
  const maxFingerRef = useRef(0); // peak finger travel (deg) this grab

  // Latest callbacks kept in a ref so the pointer/keyboard handlers below stay
  // STABLE across re-renders. (If they changed identity every render, dialing a
  // digit → parent re-render → the unmount-cleanup effect would fire mid-spin
  // and cancel the spring-back rAF, leaving the wheel stuck off-zero.)
  const cbRef = useRef({ onDigit, onCall, onClear, onHangup });
  cbRef.current = { onDigit, onCall, onClear, onHangup };

  const setRotation = useCallback((deg: number) => {
    rotRef.current = deg;
    wheelRef.current?.setAttribute("transform", `rotate(${deg} ${CENTER} ${CENTER})`);
  }, []);

  const cancelAnim = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
  }, []);

  const tween = useCallback(
    (from: number, to: number, dur: number, done?: () => void) => {
      cancelAnim();
      const start = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - start) / dur);
        setRotation(from + (to - from) * easeOut(t));
        if (t < 1) animRef.current = requestAnimationFrame(step);
        else {
          animRef.current = null;
          done?.();
        }
      };
      animRef.current = requestAnimationFrame(step);
    },
    [cancelAnim, setRotation],
  );

  // dial centre, cached at grab time so onMove never calls getBoundingClientRect
  // (which forces a layout reflow on every pointermove → janky drag).
  const centerRef = useRef({ cx: 0, cy: 0 });
  const cacheCenter = useCallback(() => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) centerRef.current = { cx: rect.left + rect.width / 2, cy: rect.top + rect.height / 2 };
  }, []);
  const pointerAngle = useCallback((clientX: number, clientY: number) => {
    const { cx, cy } = centerRef.current;
    return (Math.atan2(clientX - cx, -(clientY - cy)) * 180) / Math.PI; // clockwise from top
  }, []);

  // CLICK path — register immediately (instant feedback, never gets stuck),
  // then play a purely-cosmetic spin to the stop and back.
  const clickDial = useCallback(
    (holeIdx: number) => {
      const hole = HOLES[holeIdx];
      cbRef.current.onDigit(hole.label);
      // snappy cosmetic spin (digit already registered) — to the stop and back
      const fwd = Math.min(300, 110 + hole.travel * 0.42);
      tween(0, hole.travel, fwd, () => tween(hole.travel, 0, 200));
    },
    [tween],
  );

  const onMove = useCallback(
    (e: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const raw = normalize(pointerAngle(e.clientX, e.clientY) - drag.grabAngle);
      const finger = Math.max(0, Math.min(FINGER_ARC, raw));
      if (raw > maxFingerRef.current) maxFingerRef.current = raw;
      progressRef.current = finger / FINGER_ARC;
      setRotation(progressRef.current * drag.travel);
    },
    [pointerAngle, setRotation],
  );

  const onUp = useCallback(() => {
    const drag = dragRef.current;
    dragRef.current = null;
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (!drag) return;
    const committed = progressRef.current >= REGISTER_AT;
    const tapped = maxFingerRef.current < TAP_EPS;
    progressRef.current = 0;
    maxFingerRef.current = 0;
    if (committed) {
      cbRef.current.onDigit(HOLES[drag.holeIdx].label);
      tween(rotRef.current, 0, 230);
    } else if (tapped) {
      setRotation(0);
      clickDial(drag.holeIdx); // a tap → the easy click-to-dial
    } else {
      tween(rotRef.current, 0, 200); // partial drag, released early → cancel
    }
  }, [onMove, tween, setRotation, clickDial]);

  const onHoleDown = useCallback(
    (holeIdx: number) => (e: React.PointerEvent) => {
      if (dragRef.current) return;
      e.preventDefault();
      cancelAnim();
      cacheCenter();
      progressRef.current = 0;
      maxFingerRef.current = 0;
      dragRef.current = {
        holeIdx,
        grabAngle: pointerAngle(e.clientX, e.clientY),
        travel: HOLES[holeIdx].travel,
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
    },
    [pointerAngle, cancelAnim, cacheCenter, onMove, onUp],
  );

  // keyboard fallback
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        cbRef.current.onDigit(e.key);
      } else if (e.key === "Enter") cbRef.current.onCall();
      else if (e.key === "Backspace") {
        e.preventDefault();
        cbRef.current.onClear();
      } else if (e.key === "Escape") cbRef.current.onHangup();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Listener handles in refs so the unmount cleanup below can stay []-deps
  // (mount/unmount ONLY). If it depended on onMove/onUp it would re-run on
  // every render and cancel the spring-back animation mid-flight.
  const moveRef = useRef(onMove);
  const upRef = useRef(onUp);
  moveRef.current = onMove;
  upRef.current = onUp;
  useEffect(
    () => () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener("pointermove", moveRef.current);
      window.removeEventListener("pointerup", upRef.current);
    },
    [],
  );

  const stopX = posX(FINGER_R, STOP_ANGLE);
  const stopY = posY(FINGER_R, STOP_ANGLE);

  const redBtn = {
    background: "linear-gradient(180deg, #5e1018 0%, #2a070b 100%)",
    boxShadow: "inset 0 1px 0 rgba(255,150,160,0.3), inset 0 -2px 5px rgba(0,0,0,0.7), 0 4px 10px -4px rgba(0,0,0,0.85)",
  } as const;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-end px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div
        className="pointer-events-auto w-full max-w-[15rem] rounded-2xl p-3.5"
        style={{
          background: "linear-gradient(165deg, #320a0d 0%, #1a0406 55%, #0b0203 100%)",
          border: "1px solid rgba(255,90,100,0.22)",
          boxShadow:
            "0 26px 64px -22px rgba(0,0,0,0.92), 0 0 48px -16px rgba(255,43,62,0.55), inset 0 1px 0 rgba(255,150,160,0.22), inset 0 -3px 8px rgba(0,0,0,0.55)",
        }}
      >
        {/* number readout — recessed crimson glass */}
        <div
          className="relative mb-3 overflow-hidden rounded-lg px-3 py-2"
          style={{
            background: "linear-gradient(180deg, #1a0407 0%, #090203 100%)",
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(255,90,100,0.16)",
          }}
        >
          <p className="text-[8px] uppercase tracking-[0.34em] text-[#ff9aa8]/70">{status}</p>
          <p
            className="booth-lcd min-h-[1.4em] truncate text-[2rem] leading-tight tracking-[0.14em] text-[#ff5d6b]"
            style={{ textShadow: "0 0 14px rgba(255,43,62,0.9)" }}
          >
            {dialed || "—"}
          </p>
        </div>

        {/* the dial */}
        <svg
          ref={svgRef}
          viewBox="0 0 200 200"
          className="mx-auto block w-full max-w-[13rem] touch-none select-none"
          role="group"
          aria-label="Rotary dial — click a number or drag it to the stop"
        >
          <defs>
            {/* hot crimson key light from upper-left across curved metal */}
            <linearGradient id="rdBezel" x1="0.15" y1="0.05" x2="0.85" y2="0.95">
              <stop offset="0%" stopColor="#ff8a93" />
              <stop offset="26%" stopColor="#e23446" />
              <stop offset="58%" stopColor="#8a121d" />
              <stop offset="100%" stopColor="#2a0608" />
            </linearGradient>
            <radialGradient id="rdFace" cx="42%" cy="34%" r="72%">
              <stop offset="0%" stopColor="#520e14" />
              <stop offset="52%" stopColor="#24070a" />
              <stop offset="100%" stopColor="#0a0203" />
            </radialGradient>
            <radialGradient id="rdWell" cx="50%" cy="32%" r="66%">
              <stop offset="0%" stopColor="#2e080b" />
              <stop offset="70%" stopColor="#120304" />
              <stop offset="100%" stopColor="#040101" />
            </radialGradient>
            {/* directional inner shadow (light from top) — objectBoundingBox */}
            <linearGradient id="rdInner" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#000" stopOpacity="0.75" />
              <stop offset="55%" stopColor="#000" stopOpacity="0" />
              <stop offset="100%" stopColor="#ff6b75" stopOpacity="0.18" />
            </linearGradient>
            <linearGradient id="rdRim" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffb3ba" />
              <stop offset="100%" stopColor="#4a0a0f" />
            </linearGradient>
            <radialGradient id="rdHub" cx="40%" cy="32%" r="72%">
              <stop offset="0%" stopColor="#ffb3ba" />
              <stop offset="40%" stopColor="#e23446" />
              <stop offset="100%" stopColor="#2a0608" />
            </radialGradient>
            <radialGradient id="rdStop" cx="38%" cy="32%" r="75%">
              <stop offset="0%" stopColor="#ffd0d5" />
              <stop offset="45%" stopColor="#ff3a46" />
              <stop offset="100%" stopColor="#7a0f18" />
            </radialGradient>
            <radialGradient id="rdGlow" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#ff2b3e" stopOpacity="0" />
              <stop offset="100%" stopColor="#ff2b3e" stopOpacity="0.22" />
            </radialGradient>
            <radialGradient id="rdSpec" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* red bloom behind the dial */}
          <circle cx={CENTER} cy={CENTER} r="99" fill="url(#rdGlow)" />

          {/* metal bezel + machined steps */}
          <circle cx={CENTER} cy={CENTER} r="96" fill="url(#rdBezel)" />
          <circle cx={CENTER} cy={CENTER} r="95" fill="none" stroke="#000" strokeOpacity="0.45" strokeWidth="1" />
          <circle cx={CENTER} cy={CENTER} r="90" fill="none" stroke="#ff9aa3" strokeOpacity="0.25" strokeWidth="1" />
          <circle cx={CENTER} cy={CENTER} r="88" fill="none" stroke="#000" strokeOpacity="0.4" strokeWidth="1.5" />

          {/* cold blue rim light, lower-right (echoes the scene's rim) */}
          <path
            d="M 168 150 A 78 78 0 0 1 120 176"
            fill="none"
            stroke="#5a78ff"
            strokeOpacity="0.5"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* hot key highlight, upper-left */}
          <path
            d="M 40 64 A 78 78 0 0 1 92 26"
            fill="none"
            stroke="#ffd0d5"
            strokeOpacity="0.55"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* recessed face */}
          <circle cx={CENTER} cy={CENTER} r="87" fill="url(#rdFace)" />
          <circle cx={CENTER} cy={CENTER} r="87" fill="none" stroke="#000" strokeOpacity="0.6" strokeWidth="1.5" />
          {/* broad specular bloom on the upper face */}
          <ellipse cx="78" cy="58" rx="46" ry="30" fill="url(#rdSpec)" opacity="0.5" />

          {/* ROTATING WHEEL — solid wells + embossed numbers, no mask/filter */}
          <g ref={wheelRef} style={{ willChange: "transform" }}>
            {HOLES.map((h) => {
              const hx = posX(FINGER_R, h.angle);
              const hy = posY(FINGER_R, h.angle);
              return (
                <g key={h.i}>
                  {/* beveled metal rim */}
                  <circle cx={hx} cy={hy} r={HOLE_R + 1.5} fill="none" stroke="url(#rdRim)" strokeWidth="1.6" />
                  {/* recessed well */}
                  <circle cx={hx} cy={hy} r={HOLE_R} fill="url(#rdWell)" />
                  {/* directional inner shadow */}
                  <circle cx={hx} cy={hy} r={HOLE_R} fill="url(#rdInner)" />
                  {/* number INSIDE the hole (dark base + lit face) */}
                  <text
                    x={hx}
                    y={hy + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13"
                    fill="#000"
                    fillOpacity="0.6"
                    style={{ pointerEvents: "none", fontFamily: "var(--font-lcd)" }}
                  >
                    {h.label}
                  </text>
                  <text
                    x={hx}
                    y={hy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13"
                    fill="#ffe3e7"
                    style={{ pointerEvents: "none", fontFamily: "var(--font-lcd)" }}
                  >
                    {h.label}
                  </text>
                  {/* click / drag target (generous, even though the well is small) */}
                  <circle cx={hx} cy={hy} r={HOLE_R + 5} fill="transparent" className="booth-dial-hole" onPointerDown={onHoleDown(h.i)} />
                </g>
              );
            })}
          </g>

          {/* fixed domed hub */}
          <circle cx={CENTER} cy={CENTER} r={HUB_R} fill="url(#rdHub)" stroke="#1b0406" strokeWidth="1" />
          <ellipse cx={CENTER - 5} cy={CENTER - 6} rx="7" ry="5" fill="#fff" fillOpacity="0.4" />
          <circle cx={CENTER} cy={CENTER} r="4.5" fill="#ff2b3e" />
          <circle cx={CENTER} cy={CENTER} r="4.5" fill="none" stroke="#000" strokeOpacity="0.4" strokeWidth="0.6" />

          {/* fixed crimson finger-stop */}
          <circle cx={stopX} cy={stopY} r="8" fill="url(#rdStop)" stroke="#1b0406" strokeWidth="1" />
          <circle cx={stopX - 2.5} cy={stopY - 3} r="2" fill="#fff" fillOpacity="0.7" />
        </svg>

        {/* actions */}
        <div className="mt-3 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear last digit"
            className="grid h-10 w-10 place-items-center rounded-full text-sm text-[#ffd0d5] transition-all hover:text-white active:scale-95"
            style={redBtn}
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={onCall}
            className="flex-1 rounded-full py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1a0306] transition-all hover:brightness-110 active:scale-[0.98]"
            style={{
              background: "linear-gradient(180deg, #ff8a93 0%, #ff2b3e 55%, #c01f2f 100%)",
              boxShadow: "0 8px 22px -8px rgba(255,43,62,0.95), inset 0 1px 0 rgba(255,225,230,0.8), inset 0 -2px 5px rgba(120,10,20,0.65)",
            }}
          >
            ☎ call
          </button>
          <button
            type="button"
            onClick={onHangup}
            aria-label="Hang up"
            className="grid h-10 w-10 place-items-center rounded-full text-sm text-[#ffd0d5] transition-all hover:text-white active:scale-95"
            style={redBtn}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
