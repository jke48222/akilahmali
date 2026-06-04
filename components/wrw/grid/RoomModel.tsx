"use client";

/* =========================================================================
   THE CONTROL ROOM — the Cycles-baked Blender environment (wrw.glb). We keep
   the GLB's OWN monitors (their real "perfect" layout + bodies) and overlay a
   clickable, cover-cropped photo on each screen face (positions calibrated by
   raycasting the GLB). A black backing hides the blank glass behind, so it
   reads as the photo sitting on the monitor.
   ========================================================================= */

import { useGLTF, useTexture, useVideoTexture } from "@react-three/drei";
import { type ThreeEvent } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { FEEDS, type Feed } from "@/lib/wrw/grid";

const MODEL = "/wrw-assets/models/wrw.glb";
useGLTF.preload(MODEL);

/* a plane (centred at origin, facing +z) with softly rounded corners. UVs are
   remapped to 0..1 so the cover-cropped texture still maps correctly. */
function roundedPlane(w: number, h: number, r: number) {
  const x = -w / 2;
  const y = -h / 2;
  const rad = Math.max(0.0001, Math.min(r, w / 2, h / 2));
  const s = new THREE.Shape();
  s.moveTo(x + rad, y);
  s.lineTo(x + w - rad, y);
  s.quadraticCurveTo(x + w, y, x + w, y + rad);
  s.lineTo(x + w, y + h - rad);
  s.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  s.lineTo(x + rad, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - rad);
  s.lineTo(x, y + rad);
  s.quadraticCurveTo(x, y, x + rad, y);
  const geo = new THREE.ShapeGeometry(s, 16);
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - x) / w;
    uv[i * 2 + 1] = (pos.getY(i) - y) / h;
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
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

function FeedImage({ src, size }: { src: string; size: [number, number] }) {
  const tex = useTexture(src, (t) => {
    const tt = t as THREE.Texture;
    tt.colorSpace = THREE.SRGBColorSpace;
    tt.anisotropy = 8;
    const img = tt.image as { width?: number; height?: number } | undefined;
    cover(tt, size[0], size[1], img?.width ?? 0, img?.height ?? 0);
  });
  const geo = useMemo(() => roundedPlane(size[0], size[1], Math.min(size[0], size[1]) * 0.07), [size]);
  return (
    <mesh geometry={geo} position={[0, 0, 0.025]}>
      <meshBasicMaterial map={tex as THREE.Texture} toneMapped={false} />
    </mesh>
  );
}

function FeedVideo({ size }: { src: string; size: [number, number] }) {
  const tex = useVideoTexture("/video/who-really-won.mp4", { muted: true, loop: true, start: true, playsInline: true });
  useEffect(() => {
    const v = tex.image as HTMLVideoElement;
    const apply = () => cover(tex, size[0], size[1], v.videoWidth, v.videoHeight);
    if (v.videoWidth) apply();
    else v.addEventListener("loadedmetadata", apply, { once: true });
  }, [tex, size]);
  const geo = useMemo(() => roundedPlane(size[0], size[1], Math.min(size[0], size[1]) * 0.07), [size]);
  return (
    <mesh geometry={geo} position={[0, 0, 0.025]}>
      <meshBasicMaterial map={tex} toneMapped={false} />
    </mesh>
  );
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
  // highlight frame: a CONSTANT margin around the photo (same ratio for every
  // monitor), so the accent highlight reads identically across the grid
  const HL = 1.14;
  const [w, h] = feed.size;
  const minWH = Math.min(w, h);
  // softly rounded highlight frame; the back light is a radial glow sprite
  const hlGeo = useMemo(() => roundedPlane(w * HL, h * HL, minWH * HL * 0.07), [w, h, minWH]);
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
      {/* back light: a large, soft accent glow behind the monitor that bleeds
         out onto the wall (radial falloff + additive, so it reads as light) */}
      <mesh position={[0, 0, -0.06]} raycast={() => null}>
        <planeGeometry args={[w * 3, h * 3]} />
        <meshBasicMaterial
          map={glow}
          color={feed.accent}
          transparent
          opacity={hovered && enabled ? 0.85 : 0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      {/* highlight frame behind the photo — same size/crop relative to the photo
         for every feed, with softly rounded corners; dark by default, tints to
         this feed's accent on hover. (the GLB glass behind is already blackened) */}
      <mesh geometry={hlGeo} position={[0, 0, 0.012]}>
        <meshBasicMaterial color={hovered && enabled ? feed.accent : "#050506"} toneMapped={false} />
      </mesh>
      <Suspense fallback={null}>
        {feed.kind === "video" ? (
          <FeedVideo src={feed.src} size={feed.size} />
        ) : (
          <FeedImage src={feed.src} size={feed.size} />
        )}
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

  // make the GLB's blank screen meshes dark so nothing peeks past our photos
  useEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && /Pantalla|Screen_A_Glass|MonitorT3/i.test(m.name)) {
        m.material = new THREE.MeshBasicMaterial({ color: "#050506" });
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
