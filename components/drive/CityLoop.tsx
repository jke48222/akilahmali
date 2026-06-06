"use client";

/* =========================================================================
   THE CITY LOOP — the environment for the endless night drive.

   Everything streams toward the camera and recycles to the far distance, so the
   car drives forever without arriving (the album's "Endless Cycle"):
     • a gradient neon sky (sodium-orange horizon → deep crimson)
     • instanced building silhouettes flanking the road, fading into fog
     • the signature long-exposure tail-light trails — instanced additive
       streaks on the wet asphalt, plus a dimmer mirrored set for the
       wet-road reflection
     • a glossy wet-road plane
   The colour comes from the LIVE palette (paletteRef), which DriveScene eases
   toward the tuned station — so re-skins crossfade smoothly. Trail speed +
   density swell with the audio (energyRef). Instance counts drop on coarse
   pointers. The Tower of Roses landmark + the dashboard rose arrive in M6.
   ========================================================================= */

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { isCoarsePointer } from "@/lib/device";
import { type Palette } from "@/components/drive/DriveScene";

const ROAD_DEPTH = 170; // how far the world recedes before recycling
const NEAR_Z = 6; // a touch behind the camera — where things recycle

/* ---- gradient neon sky backdrop (follows the live palette) ---- */
function SkyBackdrop({ paletteRef }: { paletteRef: RefObject<Palette> }) {
  const uniforms = useMemo(
    () => ({ uTop: { value: new THREE.Color("#0a0204") }, uGlow: { value: new THREE.Color("#ff3a46") } }),
    [],
  );
  useFrame(() => {
    (uniforms.uTop.value as THREE.Color).copy(paletteRef.current.sky);
    (uniforms.uGlow.value as THREE.Color).copy(paletteRef.current.accent);
  });
  return (
    <mesh position={[0, 16, -ROAD_DEPTH + 8]} renderOrder={-10}>
      <planeGeometry args={[420, 150]} />
      <shaderMaterial
        uniforms={uniforms}
        depthWrite={false}
        fog={false}
        vertexShader={/* glsl */ `
          varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
        `}
        fragmentShader={/* glsl */ `
          varying vec2 vUv;
          uniform vec3 uTop; uniform vec3 uGlow;
          void main(){
            float horizon = smoothstep(0.0, 0.42, vUv.y);
            float centre = smoothstep(0.62, 0.0, abs(vUv.x - 0.5));
            vec3 col = mix(uGlow * (0.55 + 0.45 * centre), uTop, horizon);
            col = mix(col, uTop, smoothstep(0.4, 1.0, vUv.y));
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  );
}

/* ---- instanced building silhouettes (both sides, recycling) ---- */
type Building = { x: number; z: number; w: number; d: number; h: number; speed: number };
function Buildings({ energyRef }: { energyRef: RefObject<number> }) {
  const coarse = isCoarsePointer();
  const COUNT = coarse ? 30 : 56;
  const ref = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const data = useMemo<Building[]>(() => {
    const arr: Building[] = [];
    for (let i = 0; i < COUNT; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      arr.push({
        x: side * (8 + Math.random() * 15),
        z: -Math.random() * ROAD_DEPTH,
        w: 2.5 + Math.random() * 4,
        d: 2.5 + Math.random() * 5,
        h: 5 + Math.random() * 22,
        speed: 0.92 + Math.random() * 0.16,
      });
    }
    return arr;
  }, [COUNT]);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    data.forEach((b, i) => {
      dummy.position.set(b.x, b.h / 2, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [data, dummy]);

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const v = 16 * (1 + (energyRef.current ?? 0) * 0.4);
    for (let i = 0; i < data.length; i++) {
      const b = data[i];
      b.z += v * b.speed * Math.min(dt, 0.05);
      if (b.z > NEAR_Z) {
        b.z -= ROAD_DEPTH;
        b.x = (i % 2 === 0 ? 1 : -1) * (8 + Math.random() * 15);
        b.h = 5 + Math.random() * 22;
      }
      dummy.position.set(b.x, b.h / 2, b.z);
      dummy.scale.set(b.w, b.h, b.d);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} frustumCulled={false}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#06030a" />
    </instancedMesh>
  );
}

/* ---- the signature tail-light trails (instanced additive streaks) ---- */
type Trail = { x: number; y: number; z: number; len: number; w: number; speed: number; warm: number };
function Trails({ paletteRef, energyRef }: { paletteRef: RefObject<Palette>; energyRef: RefObject<number> }) {
  const coarse = isCoarsePointer();
  const COUNT = coarse ? 34 : 76;
  const roadRef = useRef<THREE.InstancedMesh>(null);
  const reflRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const scratch = useMemo(() => new THREE.Color(), []);

  const data = useMemo<Trail[]>(() => {
    const lanes = [-3.4, -1.9, -0.6, 0.6, 1.9, 3.4];
    const arr: Trail[] = [];
    for (let i = 0; i < COUNT; i++) {
      arr.push({
        x: lanes[i % lanes.length] + (Math.random() - 0.5) * 0.5,
        y: 0.06 + Math.random() * 0.9,
        z: -Math.random() * ROAD_DEPTH,
        len: 8 + Math.random() * 20,
        w: 0.07 + Math.random() * 0.16,
        speed: 0.85 + Math.random() * 0.7,
        warm: Math.random(),
      });
    }
    return arr;
  }, [COUNT]);

  useFrame((_, dt) => {
    const road = roadRef.current;
    const refl = reflRef.current;
    if (!road || !refl) return;
    const { accent, accent2 } = paletteRef.current;
    const v = 34 * (1 + (energyRef.current ?? 0) * 0.7);
    const step = Math.min(dt, 0.05);
    for (let i = 0; i < data.length; i++) {
      const tr = data[i];
      tr.z += v * tr.speed * step;
      if (tr.z - tr.len / 2 > NEAR_Z) tr.z -= ROAD_DEPTH;
      // a flat streak lying on the road, long in Z
      dummy.position.set(tr.x, tr.y, tr.z);
      dummy.rotation.set(-Math.PI / 2, 0, 0);
      dummy.scale.set(tr.w, tr.len, 1);
      dummy.updateMatrix();
      road.setMatrixAt(i, dummy.matrix);
      // mirrored reflection just below the wet asphalt
      dummy.position.set(tr.x, -tr.y * 0.9, tr.z);
      dummy.scale.set(tr.w * 1.4, tr.len * 0.9, 1);
      dummy.updateMatrix();
      refl.setMatrixAt(i, dummy.matrix);
      // re-skin: each streak sits somewhere between accent ↔ accent2
      scratch.copy(accent).lerp(accent2, data[i].warm);
      road.setColorAt(i, scratch);
      refl.setColorAt(i, scratch);
    }
    road.instanceMatrix.needsUpdate = true;
    refl.instanceMatrix.needsUpdate = true;
    if (road.instanceColor) road.instanceColor.needsUpdate = true;
    if (refl.instanceColor) refl.instanceColor.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={roadRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
      <instancedMesh ref={reflRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}

/* ---- wet asphalt (emissive sheen follows the palette) ---- */
function Road({ paletteRef }: { paletteRef: RefObject<Palette> }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(() => {
    matRef.current?.emissive.copy(paletteRef.current.accent);
  });
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -ROAD_DEPTH / 2 + NEAR_Z]} receiveShadow>
      <planeGeometry args={[30, ROAD_DEPTH + 40]} />
      <meshStandardMaterial ref={matRef} color="#08040a" metalness={0.65} roughness={0.34} emissiveIntensity={0.04} />
    </mesh>
  );
}

/* ---- low crimson wash so the road + near buildings catch the station hue ---- */
function Wash({ paletteRef }: { paletteRef: RefObject<Palette> }) {
  const ref = useRef<THREE.PointLight>(null);
  useFrame(() => {
    ref.current?.color.copy(paletteRef.current.accent);
  });
  return <pointLight ref={ref} position={[0, 3, -2]} intensity={6} distance={26} decay={2} />;
}

export function CityLoop({
  paletteRef,
  energyRef,
}: {
  paletteRef: RefObject<Palette>;
  energyRef: RefObject<number>;
}) {
  return (
    <group>
      <SkyBackdrop paletteRef={paletteRef} />
      <Wash paletteRef={paletteRef} />
      <Road paletteRef={paletteRef} />
      <Buildings energyRef={energyRef} />
      <Trails paletteRef={paletteRef} energyRef={energyRef} />
    </group>
  );
}
