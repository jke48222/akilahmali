"use client";

/* =========================================================================
   THE CONTROL ROOM — the Cycles-baked Blender environment (wrw.glb). The GLB's
   own baked monitors are hidden; in their place we clone a CCTV monitor model
   per feed and paint each feed's photo/video straight onto that model's screen
   mesh (replacing its glass texture), so the image lives on the actual CRT.
   ========================================================================= */

import { Clone, useGLTF, useTexture, useVideoTexture } from "@react-three/drei";
import { type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { FEEDS, SCREEN_SIZE, type Feed } from "@/lib/wrw/grid";
import { isCoarsePointer } from "@/lib/device";

const MODEL = "/wrw-assets/models/wrw.glb";
useGLTF.preload(MODEL);

/* The CCTV monitor model. One is cloned per feed. It loads upright with its
   screen facing +x, screen centred at (0.069, 0.234, 0) in its own
   (post-node-transform) space and ~0.284 tall × 0.334 wide — measured offline
   from the glTF. We rotate it -90° about Y so the screen faces the feed group's
   +z (into the room), scale it so the screen height tracks the feed size, then
   translate so the screen face lands on the feed plane. */
const CCTV = "/wrw-assets/models/tv_cctv_monitor.glb";
useGLTF.preload(CCTV);

const CCTV_SCREEN_CENTER = [0.069, 0.234, 0] as const; // in loaded model space
const CCTV_SCREEN_H = 0.284; // loaded screen height (world Y)
const CCTV_SCREEN_W = 0.334; // loaded screen width (world Z → screen-local X)
const CCTV_ZOFF = 0; // screen face sits on the feed plane (feed.pos)

// one uniform scale for every monitor: shrink the model so its screen matches
// SCREEN_SIZE. Same size everywhere → an even bank that never intersects.
const CCTV_SCALE = SCREEN_SIZE[1] / CCTV_SCREEN_H;
// the screen centre, after the -90°-about-Y rotation + scale, lands at
// (0, CCTV_SCREEN_CENTER[1]·s, CCTV_SCREEN_CENTER[0]·s); offset it back to (0,0,ZOFF)
const CCTV_POS: [number, number, number] = [
  0,
  -CCTV_SCREEN_CENTER[1] * CCTV_SCALE,
  CCTV_ZOFF - CCTV_SCREEN_CENTER[0] * CCTV_SCALE,
];

const NO_RAYCAST = () => null;

/* crop the feed texture to COVER the CCTV screen (5:4-ish) without squashing */
function coverScreen(tex: THREE.Texture) {
  const img = tex.image as { width?: number; height?: number; videoWidth?: number; videoHeight?: number } | undefined;
  const iw = img?.width ?? img?.videoWidth ?? 0;
  const ih = img?.height ?? img?.videoHeight ?? 0;
  cover(tex, CCTV_SCREEN_W, CCTV_SCREEN_H, iw, ih);
}

/* Clone the CCTV model and, on mount: (1) paint this feed's texture onto the
   screen mesh as an unlit (full-bright, "powered-on") material — the image now
   lives on the CRT, no overlay plane, no frame; (2) darken the plastic casing to
   the reference charcoal; (3) make only the screen a click target. */
function CctvMonitor({ screenTex }: { screenTex: THREE.Texture }) {
  const { scene } = useGLTF(CCTV);

  const setup = (g: THREE.Group | null) => {
    g?.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      if (/Screen/i.test(mesh.name)) {
        // the screen mesh UVs run U:1..2 — normalise to 0..1 once (shared geom)
        const geo = mesh.geometry as THREE.BufferGeometry;
        if (!geo.userData.uvNormalized) {
          const uv = geo.attributes.uv as THREE.BufferAttribute;
          for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) - 1);
          uv.needsUpdate = true;
          geo.userData.uvNormalized = true;
        }
        screenTex.colorSpace = THREE.SRGBColorSpace;
        screenTex.wrapS = screenTex.wrapT = THREE.ClampToEdgeWrapping;
        // anisotropy is cheap on desktop but adds up on mobile; screens are
        // viewed near head-on so a lower value is imperceptible there
        screenTex.anisotropy = isCoarsePointer() ? 2 : 8;
        coverScreen(screenTex);
        // unlit so the picture stays bright like a powered screen (per-clone material)
        mesh.material = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });
      } else {
        // plastic casing — pure decoration, and dark charcoal like the reference
        mesh.raycast = NO_RAYCAST;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat?.isMeshStandardMaterial && !mat.userData.cctvTuned) {
          mat.metalness = Math.min(mat.metalness, 0.2);
          mat.roughness = Math.max(mat.roughness, 0.7);
          mat.color.multiplyScalar(0.5); // push the grey plastic toward charcoal
          mat.emissiveIntensity = 0;
          mat.needsUpdate = true;
          mat.userData.cctvTuned = true;
        }
      }
    });
  };

  return <Clone object={scene} ref={setup} position={CCTV_POS} rotation={[0, -Math.PI / 2, 0]} scale={CCTV_SCALE} />;
}

/* feed loaders — each resolves its texture, then hands it to CctvMonitor */
function CctvImage({ feed }: { feed: Feed }) {
  const tex = useTexture(feed.src, (t) => {
    (t as THREE.Texture).colorSpace = THREE.SRGBColorSpace;
  });
  return <CctvMonitor screenTex={tex as THREE.Texture} />;
}

function CctvVideo() {
  const tex = useVideoTexture("/video/who-really-won.mp4", { muted: true, loop: true, start: true, playsInline: true });
  useEffect(() => {
    const v = tex.image as HTMLVideoElement;
    const apply = () => coverScreen(tex);
    if (v.videoWidth) apply();
    else v.addEventListener("loadedmetadata", apply, { once: true });
  }, [tex]);
  return <CctvMonitor screenTex={tex} />;
}

/* a soft radial glow texture (white→transparent) for the monitor back light.
   Built once on the client and reused; tinted per-feed via material.color. */
let _glowTex: THREE.Texture | null = null;
function glowTexture() {
  if (_glowTex) return _glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.45, "rgba(255,255,255,0.45)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  _glowTex = new THREE.CanvasTexture(c);
  _glowTex.colorSpace = THREE.SRGBColorSpace;
  return _glowTex;
}

/* crop a texture to COVER a plane of `w×h` — no squashing, just crop */
function cover(tex: THREE.Texture, w: number, h: number, iw: number, ih: number) {
  if (!iw || !ih) return;
  const ia = iw / ih;
  const pa = w / h;
  if (ia > pa) {
    tex.repeat.set(pa / ia, 1);
    tex.offset.set((1 - pa / ia) / 2, 0);
  } else {
    tex.repeat.set(1, ia / pa);
    tex.offset.set(0, (1 - ia / pa) / 2);
  }
  tex.needsUpdate = true;
}

function Monitor({
  feed,
  index,
  onSelect,
  enabled,
}: {
  feed: Feed;
  index: number;
  onSelect: (i: number) => void;
  enabled: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [w, h] = SCREEN_SIZE;
  const glow = useMemo(() => glowTexture(), []);
  return (
    <group
      position={feed.pos}
      rotation={[0, feed.rotY, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        if (!enabled) return;
        e.stopPropagation();
        onSelect(index);
      }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        if (!enabled) return;
        e.stopPropagation();
        setHovered(true);
        document.body.classList.add("wrw-target");
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.classList.remove("wrw-target");
      }}
    >
      {/* back light: a soft accent glow that haloes the monitor and bleeds onto
         the wall (its centre is occluded by the casing, so it reads as a halo).
         Brightens on hover — the only hover feedback now there's no frame. */}
      <mesh position={[0, 0, -0.06]} raycast={() => null}>
        <planeGeometry args={[w * 3, h * 3]} />
        <meshBasicMaterial
          map={glow}
          color={feed.accent}
          transparent
          opacity={hovered && enabled ? 0.7 : 0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* the CCTV monitor — the feed's photo/video is painted onto its screen */}
      <Suspense fallback={null}>
        {feed.kind === "video" ? <CctvVideo /> : <CctvImage feed={feed} />}
      </Suspense>
    </group>
  );
}

export function RoomModel({
  onSelect,
  enabled,
  onButton,
}: {
  onSelect: (i: number) => void;
  enabled: boolean;
  onButton?: () => void;
}) {
  const { scene } = useGLTF(MODEL);

  // hide the GLB's own baked monitors (bodies + screen glass) — the CCTV models
  // now stand in their place. Match the monitor casings (T1/T2/T3), their screen
  // panes (Pantalla) and the big control screen (Screen_A_Glass).
  useEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && /Monitor(T1|T2|T3)|Pantalla|Screen_A_Glass/i.test(m.name)) {
        m.visible = false;
      }
    });
  }, [scene]);

  const isButton = (e: ThreeEvent<MouseEvent>) => /Boton_Azul/i.test(e.object.name);

  return (
    <group>
      {/* The desk's blue button: the hit area is the button mesh ITSELF (exact),
         it stays static, and a click opens the vinyl loop page. */}
      <primitive
        object={scene}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          if (!enabled || !isButton(e)) return;
          e.stopPropagation();
          document.body.classList.remove("wrw-target");
          onButton?.();
        }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          if (!enabled || !isButton(e)) return;
          document.body.classList.add("wrw-target");
        }}
        onPointerOut={() => document.body.classList.remove("wrw-target")}
      />
      {FEEDS.map((feed, i) => (
        <Monitor key={feed.n} feed={feed} index={i} onSelect={onSelect} enabled={enabled} />
      ))}
    </group>
  );
}
