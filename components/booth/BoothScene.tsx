"use client";

/* =========================================================================
   THE PAYPHONE — WebGL layer. A post-apocalyptic crimson set built around the
   real phone-booth GLB. Mounts UNDER the ringing cover from the start (so it's
   warmed up), revealed when the visitor picks up.

   The booth glass uses the model's transmission material; lighting is a crimson
   key with a cold rim so the black/crimson palette reads. The camera idles with
   a slow handheld drift + pointer parallax; the imperative pickup/connect
   moves (camera leans into the keypad, pulls back on hang-up) come via apiRef.

   Mirrors components/drive/DriveScene.tsx conventions (dpr/AA caps, frameloop
   demand↔always, the DOM grade overlay).
   ========================================================================= */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { isCoarsePointer } from "@/lib/device";
import { DriveModel } from "@/components/drive/DriveModel";

export type BoothApi = {
  /** push the camera INSIDE the booth, framing the phone + keypad */
  enter: (onArrive?: () => void) => void;
  /** pull back to the establishing pose */
  reset: (onHome?: () => void) => void;
};

// the booth TOWER floats high in a wide debris cloud (bbox ~8u, tower centred
// ~y2.25), so we aim tight at the tower itself, not the bbox.
// establishing shot during the call — the booth fills the frame
const HOME_POS = new THREE.Vector3(0, 2.25, 1.55);
const HOME_LOOK = new THREE.Vector3(0, 2.18, 0);
// after the call — push INSIDE the booth, close on the phone (back wall)
const INSIDE_POS = new THREE.Vector3(0, 2.3, 0.20);
const INSIDE_LOOK = new THREE.Vector3(0, 2.0, -1.6);

function CameraController({ apiRef, enabled }: { apiRef: RefObject<BoothApi | null>; enabled: boolean }) {
  const { camera } = useThree();
  const target = useRef(HOME_LOOK.clone());
  const locked = useRef(false);
  const tween = useRef<gsap.core.Tween | null>(null);

  function tweenTo(pos: THREE.Vector3, look: THREE.Vector3, dur: number, onDone?: () => void) {
    locked.current = true;
    tween.current?.kill();
    const p = {
      px: camera.position.x, py: camera.position.y, pz: camera.position.z,
      tx: target.current.x, ty: target.current.y, tz: target.current.z,
    };
    tween.current = gsap.to(p, {
      px: pos.x, py: pos.y, pz: pos.z, tx: look.x, ty: look.y, tz: look.z,
      duration: dur, ease: "power3.inOut",
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
    apiRef.current = {
      enter: (onArrive) => tweenTo(INSIDE_POS, INSIDE_LOOK, 2.0, onArrive),
      reset: (onHome) => tweenTo(HOME_POS, HOME_LOOK, 1.2, () => { locked.current = false; onHome?.(); }),
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
    const sx = Math.sin(t * 0.5) * 0.025;
    const sy = Math.sin(t * 0.37 + 1.1) * 0.018;
    const px = enabled ? pointer.x * 0.32 : 0;
    const py = enabled ? pointer.y * 0.14 : 0;
    camera.position.x += (HOME_POS.x + sx + px - camera.position.x) * 0.05;
    camera.position.y += (HOME_POS.y + sy + py - camera.position.y) * 0.05;
    camera.position.z += (HOME_POS.z - camera.position.z) * 0.05;
    target.current.lerp(HOME_LOOK, 0.06);
    camera.lookAt(target.current);
  });

  return null;
}

/* flickering crimson key light — the booth's dying lamp */
function BoothLights() {
  const key = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (!key.current) return;
    const t = clock.elapsedTime;
    // irregular flicker (sum of sines + a rare dropout)
    const flick = 0.78 + 0.22 * Math.sin(t * 13) * Math.sin(t * 7.3) + (Math.sin(t * 1.7) > 0.985 ? -0.4 : 0);
    key.current.intensity = Math.max(0.2, 6 * flick);
  });
  return (
    <>
      <ambientLight intensity={0.18} color="#ff5a6e" />
      <pointLight ref={key} position={[0, 2.4, 0.6]} intensity={6} distance={9} decay={2} color="#ff2b3e" />
      {/* cold rim from behind so the booth reads against the black */}
      <directionalLight position={[-3, 3, -4]} intensity={0.5} color="#5a78ff" />
    </>
  );
}

export function BoothScene({
  apiRef,
  enabled,
  rendering,
}: {
  apiRef: RefObject<BoothApi | null>;
  enabled: boolean;
  rendering: boolean;
}) {
  const coarse = isCoarsePointer();

  return (
    <div className="fixed inset-0" style={{ zIndex: 0 }}>
      <Canvas
        gl={{ antialias: !coarse, powerPreference: "high-performance" }}
        dpr={coarse ? [1, 1.25] : [1, 1.5]}
        frameloop={rendering ? "always" : "demand"}
        camera={{ position: HOME_POS.toArray(), fov: 55 }}
      >
        <color attach="background" args={["#080103"]} />
        <fog attach="fog" args={["#080103", 4, 22]} />
        <BoothLights />
        <Suspense fallback={null}>
          <DriveModel url="/booth-assets/models/phone_booth.glb" fit={3.4} fitAxis="y" grounded position={[0, 0, 0]} rotation={[0, 0, 0]} />
        </Suspense>
        <CameraController apiRef={apiRef} enabled={enabled} />
      </Canvas>

      {/* cinematic grade — vignette + chromatic edge fringe + grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(115% 100% at 50% 48%, transparent 44%, rgba(4,0,2,0.72) 100%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60 mix-blend-screen" style={{ background: "radial-gradient(135% 120% at 50% 50%, transparent 72%, rgba(70,110,255,0.10) 86%, rgba(255,40,70,0.16) 100%)" }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.13] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23g)' opacity='0.7'/></svg>\")",
        }}
      />
    </div>
  );
}
