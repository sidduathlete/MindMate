import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FloatingSpheresProps {
  count?: number;
  moodScore?: number;
}

export function FloatingSpheres({ count = 8, moodScore = 5 }: FloatingSpheresProps) {
  const groupRef = useRef<THREE.Group>(null);

  const spheres = Array.from({ length: count }, (_, i) => ({
    position: [
      Math.cos((i / count) * Math.PI * 2) * 3,
      Math.sin((i / count) * Math.PI * 2) * 2,
      -2
    ] as [number, number, number],
    scale: 0.3 + Math.random() * 0.2,
    offset: Math.random() * Math.PI * 2,
  }));

  const color = new THREE.Color();
  const moodRatio = moodScore / 10;
  color.setHSL(moodRatio * 0.3, 0.7, 0.5);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;
    groupRef.current.rotation.y = time * 0.1;

    groupRef.current.children.forEach((child, i) => {
      const offset = spheres[i].offset;
      child.position.y = Math.sin(time + offset) * 0.5;
      child.rotation.x = time * 0.3;
      child.rotation.y = time * 0.2;
    });
  });

  return (
    <group ref={groupRef}>
      {spheres.map((sphere, i) => (
        <mesh key={i} position={sphere.position} scale={sphere.scale}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial
            color={color}
            transparent
            opacity={0.6}
            emissive={color}
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}
