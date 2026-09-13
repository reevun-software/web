"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import type { Group } from "three";

// Fixed (not random) set of omitted cells - keeps the render pure while
// still giving the cluster a ragged, "shattered" silhouette.
const OMIT = new Set(["0,0,0", "1,1,1", "-1,-1,-1", "1,-1,-1", "-1,1,1"]);

function Cubelets() {
  const group = useRef<Group>(null);

  const positions = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (OMIT.has(`${x},${y},${z}`)) continue;
          out.push([x * 1.06, y * 1.06, z * 1.06]);
        }
      }
    }
    return out;
  }, []);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.18;
  });

  return (
    <group ref={group} rotation={[0.45, 0.5, 0.1]}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#1a1a1d" roughness={0.35} metalness={0.25} />
        </mesh>
      ))}
    </group>
  );
}

export function ShatteredCube() {
  return (
    <div className="h-[260px] w-full md:h-[360px]">
      <Canvas camera={{ position: [3.4, 2.6, 5], fov: 32 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.35} />
        <directionalLight position={[4, 5, 3]} intensity={2.2} />
        <directionalLight position={[-4, 1, -2]} intensity={0.5} color="#5b7cff" />
        <directionalLight position={[0, -3, -4]} intensity={0.6} color="#ff9a5b" />
        <Suspense fallback={null}>
          <Cubelets />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={1.1}
        />
      </Canvas>
    </div>
  );
}
