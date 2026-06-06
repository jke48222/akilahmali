"use client";

/* =========================================================================
   THE WINDSHIELD — a full-frame rain shader rendered as the foreground layer,
   glued to the camera so it always fills the view (the glass we look through).

   Procedural: vertical rain streaks running down the glass, beaded droplets
   that refract the crimson city behind them, a wet smear, and 35mm grain. The
   overall intensity reacts to the audio analyser (energyRef, 0..1) — heavier
   rain on the louder beats — exactly as PersistentPlayer drives the orb.

   Drawn last (renderOrder high, depthTest off) so it overlays the whole scene.
   Cheaper on coarse pointers: fewer droplet layers + no refraction.
   ========================================================================= */

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { isCoarsePointer } from "@/lib/device";

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uIntensity;   // audio energy 0..1
  uniform float uAspect;
  uniform vec3  uTint;        // station accent (crimson family)
  uniform int   uQuality;     // 1 = full, 0 = light (mobile)

  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }

  // one layer of streaks falling down the glass
  float streaks(vec2 uv, float t, float cols){
    uv.x *= cols;
    float col = floor(uv.x);
    float speed = 0.6 + hash(vec2(col, 1.0)) * 1.8;
    float w = fract(uv.x);
    float y = fract(uv.y - t * speed + hash(vec2(col, 7.0)));
    // a tapering trickle, brightest at the head
    float trickle = smoothstep(0.0, 0.06, y) * smoothstep(0.5, 0.0, y);
    float lane = smoothstep(0.5, 0.0, abs(w - 0.5)); // soft column profile
    return trickle * lane;
  }

  // round beaded droplets clinging to the glass
  float droplets(vec2 uv, float t, float scale){
    vec2 g = uv * scale;
    vec2 id = floor(g);
    vec2 f = fract(g) - 0.5;
    float drift = (noise(id + floor(t * 0.2)) - 0.5) * 0.3;
    f.y += sin(t * 0.6 + id.x) * 0.04 + drift;
    float r = hash(id) * 0.28 + 0.06;
    float d = length(f) - r;
    return smoothstep(0.02, -0.02, d) * step(0.35, hash(id + 3.0));
  }

  void main(){
    vec2 uv = vUv;
    vec2 auv = vec2(uv.x * uAspect, uv.y);
    float t = uTime;
    float inten = 0.45 + uIntensity * 0.85;

    float rain = streaks(auv, t * 0.5, 26.0) * 0.7;
    rain += streaks(auv * 1.7 + 3.1, t * 0.7, 40.0) * 0.4;

    float drops = droplets(auv, t, 9.0);
    if (uQuality == 1) drops += droplets(auv * 1.9 + 11.0, t, 18.0) * 0.6;

    // grain
    float grain = (hash(uv * 920.0 + fract(t) * 50.0) - 0.5) * 0.10;

    // refraction tint: droplets pick up more of the crimson glow
    vec3 wet = uTint * (rain * 0.9 + drops * 1.4) * inten;
    float alpha = clamp(rain * 0.55 + drops * 0.7, 0.0, 0.9) * inten;

    // a faint overall wet veil + grain, vignetted toward the edges
    vec2 c = uv - 0.5;
    float vig = smoothstep(0.95, 0.35, length(c));
    vec3 veil = uTint * 0.05 * (0.6 + 0.4 * vig);
    vec3 col = wet + veil + grain;
    alpha = clamp(alpha + 0.06 * vig + abs(grain) * 0.4, 0.0, 0.92);

    gl_FragColor = vec4(col, alpha);
  }
`;

export function RainWindshield({
  energyRef,
  tint,
}: {
  /** live audio energy 0..1, written each frame by DriveScene */
  energyRef: RefObject<number>;
  /** the tuned station accent (crimson family) */
  tint: string;
}) {
  const { camera, size } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const coarse = isCoarsePointer();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: 0 },
      uAspect: { value: 1 },
      uTint: { value: new THREE.Color(tint) },
      uQuality: { value: coarse ? 0 : 1 },
    }),
    // tint updates handled imperatively below to avoid rebuilding the material
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [coarse],
  );

  useFrame((_, dt) => {
    const m = meshRef.current;
    if (!m) return;
    // glue the glass to the camera: copy pose, push forward, fill the frustum
    m.position.copy(camera.position);
    m.quaternion.copy(camera.quaternion);
    m.translateZ(-0.6);
    const cam = camera as THREE.PerspectiveCamera;
    const h = 2 * 0.6 * Math.tan((cam.fov * Math.PI) / 180 / 2);
    m.scale.set(h * (size.width / size.height) * 1.06, h * 1.06, 1);

    uniforms.uTime.value += dt;
    uniforms.uAspect.value = size.width / size.height;
    // ease intensity toward the live energy so it pulses, not jitters
    uniforms.uIntensity.value += (energyRef.current - uniforms.uIntensity.value) * 0.12;
    (uniforms.uTint.value as THREE.Color).set(tint);
  });

  return (
    <mesh ref={meshRef} renderOrder={999} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}
