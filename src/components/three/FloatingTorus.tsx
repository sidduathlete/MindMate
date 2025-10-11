import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingTorusProps {
  position?: [number, number, number];
  color?: string;
  speed?: number;
}

export function FloatingTorus({
  position = [0, 0, 0],
  color = '#60a5fa',
  speed = 1
}: FloatingTorusProps) {
  const torusRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!torusRef.current) return;

    const time = state.clock.elapsedTime * speed;
    torusRef.current.rotation.x = time * 0.3;
    torusRef.current.rotation.y = time * 0.5;
    torusRef.current.position.y = position[1] + Math.sin(time) * 0.5;
  });

  return (
    <mesh ref={torusRef} position={position}>
      <torusGeometry args={[1, 0.4, 16, 100]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.5}
        emissive={color}
        emissiveIntensity={0.2}
        roughness={0.2}
        metalness={0.8}
      />
    </mesh>
  );
}
