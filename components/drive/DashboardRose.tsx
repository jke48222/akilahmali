"use client";

/* =========================================================================
   THE DASHBOARD ROSE — the real rose.glb sitting on the passenger dashboard,
   glued to the camera so it rides in the seat with us. It slowly WILTS and
   RE-BLOOMS on a ~26s cycle (the head scales open + lifts, then droops + dips,
   then opens again) — a quiet reward for lingering, the endless cycle made
   tender. Plus the dark dashboard lip framing the bottom of the windshield.
   ========================================================================= */

import { useFrame, useThree } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { DriveModel } from "@/components/drive/DriveModel";

const CYCLE = 26; // seconds for one wilt → re-bloom

export function DashboardRose() {
  const { camera } = useThree();
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const g = root.current;
    if (!g) return;
    // ride in the passenger seat: copy the camera pose, sit low-right + forward
    g.position.copy(camera.position);
    g.quaternion.copy(camera.quaternion);
    g.translateX(0.62);
    g.translateY(-0.5);
    g.translateZ(-1.2);

    const phase = (clock.elapsedTime % CYCLE) / CYCLE;
    const bloom = 0.5 + 0.5 * Math.cos(phase * Math.PI * 2); // 1 open → 0 wilted → 1
    const h = head.current;
    if (h) {
      h.scale.setScalar(0.55 + bloom * 0.5);
      h.rotation.x = (1 - bloom) * 0.6; // droop when wilting
      h.position.y = -(1 - bloom) * 0.1;
    }
  });

  return (
    <group ref={root}>
      {/* dashboard lip — a dark mass framing the bottom of the windshield */}
      <mesh position={[-0.65, -0.28, 0.05]} rotation={[-Math.PI / 2.6, 0, 0]}>
        <planeGeometry args={[3.5, 1.2]} />
        <meshStandardMaterial color="#06030a" roughness={0.8} metalness={0.3} />
      </mesh>
      {/* the real rose, animated open/closed */}
      <group ref={head}>
        <DriveModel url="/drive-assets/models/rose.glb" fit={0.6} grounded />
      </group>
    </group>
  );
}
