import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function FloatingOrbs() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = time * 0.1;
  });

  const orbs = [
    { position: [2, 1, 0], color: '#14b8a6', scale: 0.3 },
    { position: [-2, -1, 1], color: '#0d9488', scale: 0.4 },
    { position: [1, -2, -1], color: '#5eead4', scale: 0.25 },
    { position: [-1, 2, -2], color: '#2dd4bf', scale: 0.35 },
  ];

  return (
    <group ref={groupRef}>
      {orbs.map((orb, index) => (
        <Orb
          key={index}
          position={orb.position as [number, number, number]}
          color={orb.color}
          scale={orb.scale}
          delay={index * 0.5}
        />
      ))}
    </group>
  );
}

interface OrbProps {
  position: [number, number, number];
  color: string;
  scale: number;
  delay: number;
}

function Orb({ position, color, scale, delay }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime + delay;
    meshRef.current.position.y = position[1] + Math.sin(time) * 0.5;
    meshRef.current.scale.setScalar(scale + Math.sin(time * 2) * 0.05);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.5}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}
