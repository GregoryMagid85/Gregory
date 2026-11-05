// 3-D clay-core forming, driven purely by p (0..1) and t (seconds) so every frame is deterministic.
//   0.00-0.20  clay core on its rod appears
//   0.20-0.62  a molten glass thread winds up around the core (hot orange, cooling to blue)
//   0.45-0.72  the glass body closes over the core; coloured trails are dragged into zigzags
//   0.75-1.00  the core is scraped out and the rod withdrawn: a hollow core-formed vessel remains
import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a));
const smooth = (x: number) => x * x * (3 - 2 * x);

// vessel profile (radius, height) from the base up to the rim: a small amphoriskos
const PROFILE: [number, number][] = [[0.0, 0.0], [0.2, 0.04], [0.36, 0.16], [0.46, 0.36], [0.47, 0.5], [0.42, 0.66], [0.3, 0.8], [0.17, 0.9], [0.15, 1.0], [0.19, 1.06]];
const radiusAt = (y: number) => {
  for (let i = 1; i < PROFILE.length; i++) if (y <= PROFILE[i][1]) { const [r0, y0] = PROFILE[i - 1], [r1, y1] = PROFILE[i]; return r0 + ((y - y0) * (r1 - r0)) / (y1 - y0); }
  return PROFILE[PROFILE.length - 1][0];
};
const lathe = (scale: number) => new THREE.LatheGeometry(PROFILE.map(([r, y]) => new THREE.Vector2(r * scale, y - 0.5)), 72);

const Scene: React.FC<{ p: number; t: number }> = ({ p, t }) => {
  const coreGeo = useMemo(() => lathe(0.94), []);
  const glassGeo = useMemo(() => lathe(1.03), []);
  // the molten thread: a helix that follows the core's surface from base to neck
  const thread = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const turns = 11, n = 900;
    for (let i = 0; i <= n; i++) {
      const k = i / n, y = 0.03 + k * 1.0, a = k * turns * Math.PI * 2, r = radiusAt(y) * 0.99 + 0.012;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y - 0.5, Math.sin(a) * r));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 1400, 0.022, 8, false);
  }, []);
  // decorative trails dragged into zigzags (feathering), as on the real vessels
  const trails = useMemo(() => [0.22, 0.34, 0.46, 0.58, 0.7].map((y0, j) => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 240; i++) {
      const k = i / 240, a = k * Math.PI * 2, y = y0 + 0.045 * Math.sign(Math.sin(a * 9)) * Math.pow(Math.abs(Math.sin(a * 9)), 0.4), r = radiusAt(y) * 1.035 + 0.004;
      pts.push(new THREE.Vector3(Math.cos(a) * r, y - 0.5, Math.sin(a) * r));
    }
    return { geo: new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 480, 0.012, 6, true), color: j % 2 ? "#F4F1E8" : "#F1C232" };
  }), []);

  const pc = smooth(seg(p, 0, 0.2)), pw = seg(p, 0.2, 0.62), pg = smooth(seg(p, 0.45, 0.72)), pz = smooth(seg(p, 0.6, 0.78)), ps = smooth(seg(p, 0.75, 1));
  const count = thread.index ? thread.index.count : 0;
  thread.setDrawRange(0, Math.floor(count * pw / 6) * 6);
  const hot = 1 - smooth(seg(p, 0.45, 0.8));
  const threadColor = new THREE.Color("#2456A8").lerp(new THREE.Color("#FF9A2E"), hot);
  const bob = 1 + 0.08 * Math.sin(Math.PI * pc) * (1 - pc);

  return (
    <>
      <ambientLight intensity={0.55} color="#FFE2BF" />
      <directionalLight position={[2.5, 2, 3]} intensity={2.2} color="#FFD3A0" />
      <directionalLight position={[-3, 1, -2]} intensity={1.2} color="#8FB8FF" />
      <pointLight position={[0, -1.2, 1.5]} intensity={2.5 * hot} color="#FF8A1E" distance={5} />
      <group rotation={[0.18, t * 0.55, 0]} position={[0, -0.05, 0]}>
        {/* metal rod, withdrawn upwards as the core is scraped out */}
        <mesh position={[0, 0.95 + ps * 1.6 + (1 - pc) * 1.2, 0]} visible={pc > 0.02}>
          <cylinderGeometry args={[0.035, 0.035, 1.8, 16]} />
          <meshStandardMaterial color="#6B6B6B" metalness={0.8} roughness={0.35} />
        </mesh>
        {/* clay core */}
        <mesh geometry={coreGeo} scale={[pc * bob * (1 - 0.35 * ps), pc * (1 - 0.35 * ps), pc * bob * (1 - 0.35 * ps)]} position={[0, -ps * 0.9, 0]} visible={pc > 0.01 && ps < 0.98}>
          <meshStandardMaterial color="#B89B74" roughness={1} transparent opacity={1 - ps} />
        </mesh>
        {/* molten thread */}
        <mesh geometry={thread} visible={pw > 0}>
          <meshStandardMaterial color={threadColor} emissive="#FF7A10" emissiveIntensity={1.3 * hot} roughness={0.25} transparent opacity={1 - 0.6 * pg} />
        </mesh>
        {/* glass body */}
        <mesh geometry={glassGeo} visible={pg > 0.01}>
          <meshStandardMaterial color="#2456A8" emissive="#0B2350" emissiveIntensity={0.25} roughness={0.12} metalness={0.05} transparent opacity={0.88 * pg} side={THREE.DoubleSide} />
        </mesh>
        {trails.map((tr, i) => (
          <mesh key={i} geometry={tr.geo} visible={pz > 0.01} scale={[1, 0.6 + 0.4 * pz, 1]}>
            <meshStandardMaterial color={tr.color} roughness={0.3} transparent opacity={pz} />
          </mesh>
        ))}
      </group>
    </>
  );
};

export const CoreForming3D: React.FC<{ p: number; t: number; width: number; height: number }> = ({ p, t, width, height }) => (
  <ThreeCanvas width={width} height={height} camera={{ position: [0, 0.15, 2.6], fov: 34 }} gl={{ antialias: true, alpha: true }} style={{ background: "transparent" }}>
    <Scene p={p} t={t} />
  </ThreeCanvas>
);
