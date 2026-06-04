"use client";

/* =========================================================================
   THE SECURITY GRID — WebGL layer. Renders the Cycles-baked Blender control
   room (RoomModel / wrw.glb) with 7 clickable monitor feeds. Clicking a
   monitor zooms the camera ALL THE WAY into that screen, then the page opens
   the blast on the matching feed (same photo → seamless).

   Lighting is baked into the model's emissive maps, so the scene uses only a
   little ambient fill. The page drives the camera through `apiRef`:
     api.focus(index, onArrive) → zoom into feed[index], then mount blast
     api.reset(onHome)          → pull back to the wide shot
   ========================================================================= */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef, type RefObject } from "react";
import gsap from "gsap";
import * as THREE from "three";
import { FEEDS, type Feed } from "@/lib/wrw/grid";
import { RoomModel } from "@/components/wrw/grid/RoomModel";

export type GridApi = {
  focus: (index: number, onArrive?: () => void) => void;
  reset: (onHome?: () => void) => void;
};

/* camera poses tuned to the baked GLB (our monitor bank on the +x wall) */
const HOME_POS = new THREE.Vector3(1.4, 1.52, -4.02);
const HOME_TARGET = new THREE.Vector3(3.5, 1.32, -4.05);

/* Camera pose that makes the feed's screen exactly COVER the viewport — so the
   on-monitor photo reaches the same size/edges as the full-screen blast and the
   hand-off is seamless. Cover = the closer of the fit-by-height / fit-by-width
   distances; a hair under 1 so there's never a sliver of room at the edges. */
function focusFor(feed: Feed, fov: number, aspect: number) {
  const t = Math.tan((fov * Math.PI) / 180 / 2);
  const distH = feed.size[1] / (2 * t);
  const distW = feed.size[0] / (2 * t * aspect);
  const dist = Math.min(distH, distW) * 0.96;
  const nrm = new THREE.Vector3(Math.sin(feed.rotY), 0, Math.cos(feed.rotY)).normalize(); // plane normal (-x-ish)
  const pos = new THREE.Vector3(...feed.pos).add(nrm.multiplyScalar(dist));
  return { pos, look: new THREE.Vector3(...feed.pos) };
}

function homeFor(aspect: number) {
  let fov = 48;
  let back = 0;
  if (aspect < 0.6) {
    fov = 72;
    back = 1.9;
  } else if (aspect < 0.85) {
    fov = 62;
    back = 1.1;
  } else if (aspect < 1.2) {
    fov = 54;
    back = 0.5;
  }
  const dir = HOME_POS.clone().sub(HOME_TARGET).normalize();
  return { pos: HOME_POS.clone().add(dir.multiplyScalar(back)), fov };
}

function CameraController({ apiRef }: { apiRef: RefObject<GridApi | null> }) {
  const { camera, size } = useThree();
  const target = useRef(HOME_TARGET.clone());
  const home = useRef(homeFor(size.width / size.height));
  const locked = useRef(false);
  const tween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const pc = camera as THREE.PerspectiveCamera;
    home.current = homeFor(size.width / size.height);
    pc.fov = home.current.fov;
    pc.updateProjectionMatrix();
    if (!locked.current) {
      pc.position.copy(home.current.pos);
      target.current.copy(HOME_TARGET);
      pc.lookAt(target.current);
    }
  }, [camera, size.width, size.height]);

  function tweenTo(pos: THREE.Vector3, look: THREE.Vector3, dur: number, onDone?: () => void) {
    locked.current = true;
    tween.current?.kill();
    const p = {
      px: camera.position.x, py: camera.position.y, pz: camera.position.z,
      tx: target.current.x, ty: target.current.y, tz: target.current.z,
    };
    tween.current = gsap.to(p, {
      px: pos.x, py: pos.y, pz: pos.z, tx: look.x, ty: look.y, tz: look.z,
      duration: dur,
      ease: "power3.inOut",
      onUpdate: () => {
        camera.position.set(p.px, p.py, p.pz);
        target.current.set(p.tx, p.ty, p.tz);
        camera.lookAt(target.current);
      },
      onComplete: onDone,
    });
  }

  useEffect(() => {
    const once = (cb?: () => void) => {
      let done = false;
      return () => {
        if (done) return;
        done = true;
        cb?.();
      };
    };
    apiRef.current = {
      focus: (index, onArrive) => {
        const fire = once(onArrive);
        const { pos, look } = focusFor(FEEDS[index], (camera as THREE.PerspectiveCamera).fov, size.width / size.height);
        tweenTo(pos, look, 1.6); // keep zooming a beat past the hand-off
        // mount the blast BEFORE the zoom fully lands so it crossfades in over the
        // still-moving camera (seamless), not a hard cut once the zoom stops
        setTimeout(fire, 1050);
        setTimeout(fire, 1900); // fallback (rAF can be paused in a hidden tab)
      },
      reset: (onHome) => {
        const fire = once(() => {
          locked.current = false;
          onHome?.();
        });
        tweenTo(home.current.pos, HOME_TARGET, 1.2, fire);
        setTimeout(fire, 1500);
      },
    };
    return () => {
      tween.current?.kill();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(({ pointer }) => {
    if (locked.current) return;
    const hp = home.current.pos;
    camera.position.x += (hp.x + pointer.x * 0.35 - camera.position.x) * 0.04;
    camera.position.y += (hp.y + pointer.y * 0.22 - camera.position.y) * 0.04;
    camera.position.z += (hp.z - camera.position.z) * 0.04;
    target.current.lerp(HOME_TARGET, 0.06);
    camera.lookAt(target.current);
  });

  return null;
}

export function GridScene({
  apiRef,
  enabled,
  rendering,
  onSelect,
  onButton,
}: {
  apiRef: RefObject<GridApi | null>;
  enabled: boolean;
  /** run the render loop — true whenever the room is visible (reveal + live),
      false while the paper cover or a blast fully occludes it */
  rendering: boolean;
  onSelect: (index: number) => void;
  onButton?: () => void;
}) {
  // pick → zoom all the way into that monitor → open its blast
  const pick = (i: number) => apiRef.current?.focus(i, () => onSelect(i));

  return (
    <div className="fixed inset-0" style={{ zIndex: 0 }}>
      <Canvas
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        // only run the render loop when the room is actually visible — while the
        // paper cover is up or a blast is open, the canvas is fully occluded, so
        // "demand" stops it burning frames behind them (huge win for the intro
        // handwriting + blast transitions). It still renders on demand to show
        // the loaded room, and switches to "always" for the live parallax/zoom.
        frameloop={rendering ? "always" : "demand"}
        camera={{ position: HOME_POS.toArray(), fov: 48 }}
      >
        <color attach="background" args={["#05070b"]} />
        <ambientLight intensity={0.45} />
        <Suspense fallback={null}>
          <RoomModel onSelect={pick} enabled={enabled} onButton={onButton} />
        </Suspense>
        <CameraController apiRef={apiRef} />
      </Canvas>
    </div>
  );
}
