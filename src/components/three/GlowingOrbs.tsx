import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GlowingOrbsProps {
  count?: number;
}

export function GlowingOrbs({ count = 5 }: GlowingOrbsProps) {
  const groupRef = useRef<THREE.Group>(null);

  const orbs = Array.from({ length: count }, (_, i) => ({
    position: [
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4
    ] as [number, number, number],
    scale: 0.2 + Math.random() * 0.3,
    color: new THREE.Color().setHSL(Math.random(), 0.7, 0.6),
    speed: 0.5 + Math.random() * 0.5,
  }));

  useFrame((state) => {
    if (!groupRef.current) return;

    groupRef.current.children.forEach((child, i) => {
      const time = state.clock.elapsedTime * orbs[i].speed;
      child.position.x += Math.sin(time * 0.5) * 0.002;
      child.position.y += Math.cos(time * 0.3) * 0.002;
      child.rotation.x = time * 0.2;
      child.rotation.y = time * 0.3;
    });
  });

  return (
    <group ref={groupRef}>
      {orbs.map((orb, i) => (
        <mesh key={i} position={orb.position} scale={orb.scale}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={orb.color}
            transparent
            opacity={0.7}
            emissive={orb.color}
            emissiveIntensity={0.5}
            roughness={0.1}
            metalness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}
