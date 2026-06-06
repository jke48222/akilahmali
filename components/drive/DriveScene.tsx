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

/* Passenger-seat pose, looking forward through the windshield down the wet
   road. The car never moves forward in world space — the CITY streams toward
   us — so home stays put and the camera only drifts/parallaxes around it. */
const HOME_POS = new THREE.Vector3(0, 1.18, 3.4);
const HOME_LOOK = new THREE.Vector3(0, 0.85, -14);

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

  useEffect(() => {
    camera.position.copy(HOME_POS);
    target.current.copy(HOME_LOOK);
    camera.lookAt(target.current);
    // Minimal api for M3 (no film yet) — the real GSAP through-windshield push
    // + reset land in M5. Calling focus simply reports arrival.
    apiRef.current = {
      focus: (_index, onArrive) => onArrive?.(),
      reset: (onHome) => {
        locked.current = false;
        onHome?.();
      },
    };
    return () => {
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

  return (
    <div className="fixed inset-0" style={{ zIndex: 0 }}>
      <Canvas
        gl={{ antialias: !coarse, powerPreference: "high-performance" }}
        dpr={coarse ? [1, 1.25] : [1, 1.5]}
        frameloop={rendering ? "always" : "demand"}
        camera={{ position: HOME_POS.toArray(), fov: 62 }}
      >
        {/* deep wet-night sky; re-skins per tuned station */}
        <color attach="background" args={[skyColor]} />
        <fog attach="fog" args={[skyColor, 7, 64]} />
        <ambientLight intensity={0.5} color={accent} />
        <Suspense fallback={null}>
          <CityLoop accent={accent} accent2={accent2} skyColor={skyColor} energyRef={energyRef} />
        </Suspense>
        <RainWindshield energyRef={energyRef} tint={accent} />
        <CameraController apiRef={apiRef} enabled={enabled} />
        <EnergyProbe analyserRef={analyserRef} energyRef={energyRef} />
      </Canvas>
    </div>
  );
}
