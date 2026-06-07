"use client";

/* =========================================================================
   A small auto-fitting GLB loader for The Drive's real models.

   Every source model arrives at a different native scale + origin, so this
   measures the loaded geometry's bounding box and rescales it so its largest
   dimension == `fit` world units, then recenters it (or grounds it on y=0).
   That makes placement independent of each export's quirks. Geometry is
   uncompressed (no Draco/meshopt — CSP-safe); textures were pre-shrunk to WebP.

   `onReady` reports the fitted scale/size so callers can tune placement.
   ========================================================================= */

import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export function DriveModel({
  url,
  fit,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  grounded = false,
  emissive,
  emissiveIntensity = 0,
}: {
  url: string;
  /** target size (largest bounding-box dimension) in world units */
  fit: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  /** sit the model on y=0 instead of centering vertically */
  grounded?: boolean;
  /** optional emissive tint applied to every material (neon glow) */
  emissive?: THREE.Color;
  emissiveIntensity?: number;
}) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  const { scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = fit / maxDim;
    const off = new THREE.Vector3(-center.x, grounded ? -box.min.y : -center.y, -center.z);
    return { scale: s, offset: off };
  }, [cloned, fit, grounded]);

  // optional emissive boost for neon models (tower)
  const matRef = useRef(false);
  useLayoutEffect(() => {
    if (matRef.current || !emissive) return;
    matRef.current = true;
    cloned.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && "emissive" in m) {
        m.emissive = emissive.clone();
        m.emissiveIntensity = emissiveIntensity;
      }
    });
  }, [cloned, emissive, emissiveIntensity]);

  return (
    <group position={position} rotation={rotation}>
      <group scale={scale}>
        <primitive object={cloned} position={offset.toArray()} />
      </group>
    </group>
  );
}
