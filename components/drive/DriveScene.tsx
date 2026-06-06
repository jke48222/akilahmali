"use client";

/* =========================================================================
   THE DRIVE — WebGL layer. The R3F <Canvas> for the endless night drive.

   M1 scaffold: an empty, crimson-graded canvas that mounts UNDERNEATH the
   rain-on-glass cover from the start, so the world is warmed up and ready the
   instant the cover wipes away (the same "load behind the cover" trick as
   GridScene). The city loop, rain windshield, dashboard rose and the imperative
   GSAP CameraController land in later milestones; the tuning here (dpr/AA caps,
   frameloop demand↔always, powerPreference) is already mobile-correct.

   Mirrors components/wrw/grid/GridScene.tsx.
   ========================================================================= */

import { Canvas } from "@react-three/fiber";
import { Suspense, type RefObject } from "react";
import * as THREE from "three";
import { isCoarsePointer } from "@/lib/device";

export type DriveApi = {
  /** push the camera through the windshield into station[index], then mount its film */
  focus: (index: number, onArrive?: () => void) => void;
  /** reverse the camera back to the home (passenger-seat) pose */
  reset: (onHome?: () => void) => void;
};

/* Passenger-seat camera pose, looking forward through the windshield down the
   wet road. Tuned further once CityLoop exists. */
const HOME_POS = new THREE.Vector3(0, 1.15, 3.4);

export function DriveScene({
  apiRef,
  enabled,
  rendering,
}: {
  apiRef: RefObject<DriveApi | null>;
  /** interactivity live — true on the live drive, false under cover / in a film */
  enabled: boolean;
  /** run the render loop — true whenever the world is visible (reveal + live),
      false while the cover or a film fully occludes it */
  rendering: boolean;
}) {
  // On phones/tablets, antialiasing + a high device-pixel-ratio are the biggest
  // GPU costs; the crimson-graded night scene reads fine without MSAA, so drop
  // it and cap the pixel ratio lower for a smoother frame rate on mobile.
  const coarse = isCoarsePointer();
  void apiRef;
  void enabled;

  return (
    <div className="fixed inset-0" style={{ zIndex: 0 }}>
      <Canvas
        gl={{ antialias: !coarse, powerPreference: "high-performance" }}
        dpr={coarse ? [1, 1.25] : [1, 1.5]}
        // only run the loop when the world is actually visible — while the cover
        // is up or a film is open the canvas is fully occluded, so "demand" stops
        // it burning frames behind them, switching to "always" for the live drive.
        frameloop={rendering ? "always" : "demand"}
        camera={{ position: HOME_POS.toArray(), fov: 62 }}
      >
        {/* deep wet-asphalt crimson night; re-skinned per station in M4 */}
        <color attach="background" args={["#0a0204"]} />
        <fog attach="fog" args={["#0a0204", 6, 38]} />
        <ambientLight intensity={0.4} color="#ff5a6e" />
        <Suspense fallback={null}>
          {/* CityLoop / RainWindshield / dashboard rose mount here in M3 */}
        </Suspense>
      </Canvas>
    </div>
  );
}
