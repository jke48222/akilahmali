"use client";

/* =========================================================================
   THE DRIVE — WebGL layer. The R3F <Canvas> for the endless night drive.

   Holds the looping city (CityLoop), the rain-on-glass foreground
   (RainWindshield), the lighting, and the imperative GSAP CameraController.
   Mounts UNDERNEATH the cover from the start so the world is warmed up and
   revealed the instant the wiper sweeps away (the "load behind the cover"
   trick). The audio AnalyserNode (built on the START gesture in TheDrive) is
   sampled here into a shared energyRef that the rain + trails react to.

   Mirrors components/wrw/grid/GridScene.tsx — tuning (dpr/AA caps, frameloop
   demand↔always, powerPreference) is mobile-correct. The through-windshield
   focus()/reset() push lands in M5; M3 ships the idle drift.
   ========================================================================= */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef, type RefObject } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { isCoarsePointer } from "@/lib/device";
import { CityLoop } from "@/components/drive/CityLoop";
import { RainWindshield } from "@/components/drive/RainWindshield";

export type DriveApi = {
  /** push the camera through the windshield into station[index], then mount its film */
  focus: (index: number, onArrive?: () => void) => void;
  /** reverse the camera back to the home (passenger-seat) pose */
  reset: (onHome?: () => void) => void;
};

/* The live, smoothly-eased world palette. PaletteTween lerps these toward the
   tuned station's target each frame so re-skins crossfade instead of snapping;
   the city + rain read these Colors directly. */
export type Palette = { accent: THREE.Color; accent2: THREE.Color; sky: THREE.Color };

/* ---- ease the world palette toward the tuned station + drive sky/fog/fill ---- */
function PaletteTween({
  paletteRef,
  accent,
  accent2,
  skyColor,
  ambientRef,
}: {
  paletteRef: RefObject<Palette>;
  accent: string;
  accent2: string;
  skyColor: string;
  ambientRef: RefObject<THREE.AmbientLight | null>;
}) {
  const { scene } = useThree();
  const tA = useMemo(() => new THREE.Color(), []);
  const tB = useMemo(() => new THREE.Color(), []);
  const tS = useMemo(() => new THREE.Color(), []);
  useFrame(() => {
    const p = paletteRef.current;
    tA.set(accent);
    tB.set(accent2);
    tS.set(skyColor);
    p.accent.lerp(tA, 0.06);
    p.accent2.lerp(tB, 0.06);
    p.sky.lerp(tS, 0.06);
    if (scene.background instanceof THREE.Color) scene.background.lerp(tS, 0.06);
    if (scene.fog) (scene.fog as THREE.Fog).color.lerp(tS, 0.06);
    ambientRef.current?.color.lerp(p.accent, 0.1);
  });
  return null;
}

/* Passenger-seat pose, looking forward through the windshield down the wet
   road. The car never moves forward in world space — the CITY streams toward
   us — so home stays put and the camera only drifts/parallaxes around it. */
const HOME_POS = new THREE.Vector3(0, 1.18, 3.4);
const HOME_LOOK = new THREE.Vector3(0, 0.85, -14);

/* The through-windshield push: lunge forward off the seat, accelerating into
   the city, while StationFilm crossfades in over the still-moving camera. */
const PUSH_POS = new THREE.Vector3(0, 1.0, -9);
const PUSH_LOOK = new THREE.Vector3(0, 0.8, -48);

/* ---- sample the analyser into a shared 0..1 energy each frame ---- */
function EnergyProbe({
  analyserRef,
  energyRef,
}: {
  analyserRef: RefObject<AnalyserNode | null>;
  energyRef: RefObject<number>;
}) {
  const bins = useMemo(() => new Uint8Array(128), []);
  useFrame(() => {
    const an = analyserRef.current;
    if (!an) {
      energyRef.current *= 0.94; // decay to calm when nothing is playing
      return;
    }
    an.getByteFrequencyData(bins);
    let sum = 0;
    const N = Math.min(24, bins.length); // low end carries the drive's pulse
    for (let i = 0; i < N; i++) sum += bins[i];
    const e = sum / (N * 255);
    energyRef.current += (e - energyRef.current) * 0.2;
  });
  return null;
}

function CameraController({
  apiRef,
  enabled,
}: {
  apiRef: RefObject<DriveApi | null>;
  enabled: boolean;
}) {
  const { camera } = useThree();
  const target = useRef(HOME_LOOK.clone());
  const locked = useRef(false);
  const tween = useRef<gsap.core.Tween | null>(null);

  function tweenTo(pos: THREE.Vector3, look: THREE.Vector3, dur: number, ease: string, onDone?: () => void) {
    locked.current = true;
    tween.current?.kill();
    const p = {
      px: camera.position.x, py: camera.position.y, pz: camera.position.z,
      tx: target.current.x, ty: target.current.y, tz: target.current.z,
    };
    tween.current = gsap.to(p, {
      px: pos.x, py: pos.y, pz: pos.z, tx: look.x, ty: look.y, tz: look.z,
      duration: dur,
      ease,
      onUpdate: () => {
        camera.position.set(p.px, p.py, p.pz);
        target.current.set(p.tx, p.ty, p.tz);
        camera.lookAt(target.current);
      },
      onComplete: onDone,
    });
  }

  useEffect(() => {
    camera.position.copy(HOME_POS);
    target.current.copy(HOME_LOOK);
    camera.lookAt(target.current);
    const once = (cb?: () => void) => {
      let done = false;
      return () => {
        if (done) return;
        done = true;
        cb?.();
      };
    };
    apiRef.current = {
      focus: (_index, onArrive) => {
        const fire = once(onArrive);
        // accelerate forward through the windshield, keep pushing a beat PAST
        // the hand-off so the film crossfades in over a still-moving camera
        tweenTo(PUSH_POS, PUSH_LOOK, 1.6, "power3.in");
        setTimeout(fire, 1050);
        setTimeout(fire, 1900); // fallback (rAF can be paused in a hidden tab)
      },
      reset: (onHome) => {
        const fire = once(() => {
          locked.current = false;
          onHome?.();
        });
        tweenTo(HOME_POS, HOME_LOOK, 1.15, "power2.out", fire);
        setTimeout(fire, 1500);
      },
    };
    return () => {
      tween.current?.kill();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ pointer, clock }) => {
    if (locked.current) return;
    const t = clock.elapsedTime;
    // gentle endless-drive sway + pointer parallax, lerped toward the home pose
    const sx = Math.sin(t * 0.27) * 0.06;
    const sy = Math.sin(t * 0.21 + 1.3) * 0.035;
    const px = enabled ? pointer.x * 0.55 : 0;
    const py = enabled ? pointer.y * 0.22 : 0;
    camera.position.x += (HOME_POS.x + sx + px - camera.position.x) * 0.045;
    camera.position.y += (HOME_POS.y + sy + py - camera.position.y) * 0.045;
    camera.position.z += (HOME_POS.z - camera.position.z) * 0.045;
    target.current.x += (HOME_LOOK.x + px * 1.4 - target.current.x) * 0.05;
    target.current.y += (HOME_LOOK.y + py - target.current.y) * 0.05;
    camera.lookAt(target.current);
  });

  return null;
}

export function DriveScene({
  apiRef,
  enabled,
  rendering,
  analyserRef,
  accent,
  accent2,
  skyColor,
}: {
  apiRef: RefObject<DriveApi | null>;
  /** interactivity live — true on the live drive, false under cover / in a film */
  enabled: boolean;
  /** run the render loop — true whenever the world is visible (reveal + live),
      false while the cover or a film fully occludes it */
  rendering: boolean;
  analyserRef: RefObject<AnalyserNode | null>;
  accent: string;
  accent2: string;
  skyColor: string;
}) {
  const coarse = isCoarsePointer();
  const energyRef = useRef(0);
  const ambientRef = useRef<THREE.AmbientLight | null>(null);
  // live palette, eased toward the tuned station by PaletteTween
  const paletteRef = useRef<Palette>({
    accent: new THREE.Color(accent),
    accent2: new THREE.Color(accent2),
    sky: new THREE.Color(skyColor),
  });

  return (
    <div className="fixed inset-0" style={{ zIndex: 0 }}>
      <Canvas
        gl={{ antialias: !coarse, powerPreference: "high-performance" }}
        dpr={coarse ? [1, 1.25] : [1, 1.5]}
        frameloop={rendering ? "always" : "demand"}
        camera={{ position: HOME_POS.toArray(), fov: 62 }}
      >
        {/* deep wet-night sky/fog — PaletteTween crossfades these per station.
            Fixed initial args so the prop-driven re-skin doesn't fight the lerp. */}
        <color attach="background" args={["#0a0204"]} />
        <fog attach="fog" args={["#0a0204", 7, 64]} />
        <ambientLight ref={ambientRef} intensity={0.5} />
        <Suspense fallback={null}>
          <CityLoop paletteRef={paletteRef} energyRef={energyRef} />
        </Suspense>
        <RainWindshield energyRef={energyRef} paletteRef={paletteRef} />
        <CameraController apiRef={apiRef} enabled={enabled} />
        <EnergyProbe analyserRef={analyserRef} energyRef={energyRef} />
        <PaletteTween
          paletteRef={paletteRef}
          accent={accent}
          accent2={accent2}
          skyColor={skyColor}
          ambientRef={ambientRef}
        />
      </Canvas>
    </div>
  );
}
