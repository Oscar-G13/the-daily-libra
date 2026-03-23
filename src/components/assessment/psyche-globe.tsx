"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Rotating wireframe icosahedron — the psyche map
function IcosahedronWireframe({ scale = 1 }: { scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.18;
      meshRef.current.rotation.x += delta * 0.06;
    }
    if (innerRef.current) {
      // Pulsing inner glow
      const pulse = 0.75 + Math.sin(time.current * 1.4) * 0.1;
      innerRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group scale={scale}>
      {/* Outer wireframe */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshBasicMaterial
          color="#c4a05a"
          wireframe
          transparent
          opacity={0.55}
        />
      </mesh>

      {/* Inner glow sphere */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[0.9, 16, 16]} />
        <meshBasicMaterial
          color="#b8860b"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Core point */}
      <mesh>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshBasicMaterial color="#e2c878" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}

// Particle field — drifting star-like points
function StarField({ count = 160 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.04;
      pointsRef.current.rotation.x += delta * 0.015;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#c4a05a"
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.6}
      />
    </Points>
  );
}

interface PsycheGlobeProps {
  className?: string;
  scale?: number;
  particleCount?: number;
}

export function PsycheGlobe({ className, scale = 1, particleCount = 160 }: PsycheGlobeProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.4} />
        <IcosahedronWireframe scale={scale} />
        <StarField count={particleCount} />
      </Canvas>
    </div>
  );
}
