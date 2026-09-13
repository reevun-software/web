"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  RoundedBox,
  OrbitControls,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import type { Mesh } from "three";

function Cube() {
  const mesh = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (mesh.current) mesh.current.rotation.y += delta * 0.15;
  });

  return (
    <RoundedBox ref={mesh} args={[2, 2, 2]} radius={0.15} smoothness={6} rotation={[0.5, 0.6, 0]}>
      <MeshTransmissionMaterial
        roughness={0.04}
        transmission={1}
        thickness={1.6}
        ior={1.4}
        chromaticAberration={0.03}
        clearcoat={1}
        clearcoatRoughness={0.05}
        color="#e8e8ef"
      />
    </RoundedBox>
  );
}

export function GlassCube() {
  return (
    <div className="h-[280px] w-full md:h-[420px]">
      <Canvas camera={{ position: [3.2, 1.8, 4.4], fov: 32 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 5, 3]} intensity={1.6} />
        <Suspense fallback={null}>
          <Cube />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
}
