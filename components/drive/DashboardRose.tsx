"use client";

/* =========================================================================
   THE DASHBOARD ROSE — a single rose on the passenger dashboard that slowly
   WILTS and RE-BLOOMS on each loop of the drive: a quiet reward for lingering
   (the album's endless cycle, made tender). Plus the dark dashboard lip that
   frames the bottom of the windshield.

   Glued to the camera (copies its pose each frame) so it rides in the seat with
   us. The bloom is a slow cosine cycle (~26s): petals open + glow in the live
   station accent, then droop + dim, then open again — forever.
   ========================================================================= */

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { type Palette } from "@/components/drive/DriveScene";

const CYCLE = 26; // seconds for one wilt → re-bloom

/* one open arrangement of petals, built once; bloom animates the whole head */
const RINGS = [
  { n: 3, r: 0.1, tilt: 0.3, y: 0.34 },
  { n: 6, r: 0.22, tilt: 0.72, y: 0.2 },
  { n: 8, r: 0.34, tilt: 1.12, y: 0.06 },
];

export function DashboardRose({ paletteRef }: { paletteRef: React.RefObject<Palette> }) {
  const { camera } = useThree();
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  // shared petal material so we can drive colour/glow on the whole bloom at once
  const petalMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ff4d6d", emissive: "#ff4d6d", roughness: 0.5, metalness: 0.1, side: THREE.DoubleSide }),
    [],
  );

  const petals = useMemo(() => {
    const out: { az: number; r: number; tilt: number; y: number; key: string }[] = [];
    RINGS.forEach((ring, ri) => {
      for (let i = 0; i < ring.n; i++) {
        out.push({ az: (i / ring.n) * Math.PI * 2 + ri * 0.4, r: ring.r, tilt: ring.tilt, y: ring.y, key: `${ri}-${i}` });
      }
    });
    return out;
  }, []);

  useFrame(({ clock }) => {
    const g = root.current;
    const h = head.current;
    if (!g) return;
    // ride in the passenger seat: copy the camera pose, sit low-right + forward
    g.position.copy(camera.position);
    g.quaternion.copy(camera.quaternion);
    g.translateX(0.66);
    g.translateY(-0.52);
    g.translateZ(-1.25);

    const phase = (clock.elapsedTime % CYCLE) / CYCLE;
    const bloom = 0.5 + 0.5 * Math.cos(phase * Math.PI * 2); // 1 open → 0 wilted → 1
    if (h) {
      const s = 0.55 + bloom * 0.55;
      h.scale.setScalar(s);
      h.rotation.x = (1 - bloom) * 0.7; // droop when wilting
      h.position.y = 0.62 - (1 - bloom) * 0.12;
    }
    petalMat.emissive.copy(paletteRef.current.accent);
    petalMat.emissiveIntensity = 0.22 + bloom * 1.1;
    petalMat.color.copy(paletteRef.current.accent).multiplyScalar(0.5);
  });

  return (
    <group ref={root} scale={0.5}>
      {/* dashboard lip — a dark mass framing the bottom of the windshield */}
      <mesh position={[-1.3, -0.55, 0.1]} rotation={[-Math.PI / 2.6, 0, 0]}>
        <planeGeometry args={[7, 2.4]} />
        <meshStandardMaterial color="#06030a" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* stem */}
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.03, 0.04, 1.2, 6]} />
        <meshStandardMaterial color="#16240f" roughness={0.9} />
      </mesh>
      {/* a leaf */}
      <mesh position={[0.16, 0.05, 0]} rotation={[0, 0, -0.8]}>
        <coneGeometry args={[0.12, 0.4, 5]} />
        <meshStandardMaterial color="#1c2e12" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* the bloom (head) */}
      <group ref={head} position={[0, 0.62, 0]}>
        {/* calyx / centre */}
        <mesh>
          <icosahedronGeometry args={[0.08, 0]} />
          <primitive object={petalMat} attach="material" />
        </mesh>
        {petals.map((p) => (
          <group key={p.key} rotation={[0, p.az, 0]}>
            <mesh position={[0, p.y, p.r]} rotation={[-p.tilt, 0, 0]} material={petalMat}>
              <coneGeometry args={[0.1, 0.44, 6]} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}
