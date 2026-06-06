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

/* The Tower of Roses — a fixed neon high-rise ahead-left, blooming with roses,
   glimpsed through the wet window. Shared with the camera so focus() can drift
   up it before the push (see DriveScene). */
export const TOWER_POS = new THREE.Vector3(-7, 0, -46);
export const TOWER_H = 40;

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

/* ---- the Tower of Roses (fixed neon landmark, blooming with roses) ---- */
function RosesTower({ paletteRef, landmarkActive }: { paletteRef: RefObject<Palette>; landmarkActive: boolean }) {
  const coarse = isCoarsePointer();
  const COUNT = coarse ? 40 : 80;
  const bloomsRef = useRef<THREE.InstancedMesh>(null);
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const glow = useRef(0.4);

  // roses clustered over the tower's faces, climbing toward the top
  const roses = useMemo(() => {
    const arr: { x: number; y: number; z: number; s: number; ph: number }[] = [];
    for (let i = 0; i < COUNT; i++) {
      const up = Math.pow(Math.random(), 0.7); // denser higher up (the bloom)
      const face = Math.floor(Math.random() * 3); // front + two sides toward us
      const off = (Math.random() - 0.5) * 6.6;
      const fx = face === 1 ? 3.7 : face === 2 ? -3.7 : off;
      const fz = face === 0 ? 3.7 : off;
      arr.push({
        x: TOWER_POS.x + fx,
        y: 4 + up * (TOWER_H - 4),
        z: TOWER_POS.z + fz,
        s: 0.55 + Math.random() * 0.9,
        ph: Math.random() * 6.28,
      });
    }
    return arr;
  }, [COUNT]);

  useEffect(() => {
    const mesh = bloomsRef.current;
    if (!mesh) return;
    roses.forEach((r, i) => {
      dummy.position.set(r.x, r.y, r.z);
      dummy.scale.setScalar(r.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [roses, dummy]);

  useFrame((_, dt) => {
    // roses glow in the live accent; bloom brighter when this is the tuned station
    const targetGlow = landmarkActive ? 2.6 : 0.95;
    glow.current += (targetGlow - glow.current) * Math.min(1, dt * 2.2);
    if (matRef.current) {
      matRef.current.color.copy(paletteRef.current.accent).multiplyScalar(glow.current);
    }
  });

  return (
    <group>
      <mesh position={[TOWER_POS.x, TOWER_H / 2, TOWER_POS.z]}>
        <boxGeometry args={[7.4, TOWER_H, 7.4]} />
        <meshBasicMaterial color="#0a0408" />
      </mesh>
      <instancedMesh ref={bloomsRef} args={[undefined, undefined, COUNT]} frustumCulled={false}>
        <icosahedronGeometry args={[0.5, 0]} />
        {/* fog off so the neon roses glow THROUGH the wet-night haze */}
        <meshBasicMaterial ref={matRef} toneMapped={false} fog={false} transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
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
  landmarkActive,
}: {
  paletteRef: RefObject<Palette>;
  energyRef: RefObject<number>;
  landmarkActive: boolean;
}) {
  return (
    <group>
      <SkyBackdrop paletteRef={paletteRef} />
      <Wash paletteRef={paletteRef} />
      <Road paletteRef={paletteRef} />
      <Buildings energyRef={energyRef} />
      <RosesTower paletteRef={paletteRef} landmarkActive={landmarkActive} />
      <Trails paletteRef={paletteRef} energyRef={energyRef} />
    </group>
  );
}
