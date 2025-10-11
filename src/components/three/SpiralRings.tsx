import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function SpiralRings() {
  const groupRef = useRef<THREE.Group>(null);

  const rings = Array.from({ length: 12 }, (_, i) => ({
    radius: 0.5 + i * 0.3,
    color: new THREE.Color().setHSL((i / 12) * 0.3 + 0.5, 0.8, 0.5),
    offset: (i / 12) * Math.PI * 2,
  }));

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      child.rotation.z = time * 0.5 + rings[i].offset;
      child.position.y = Math.sin(time + rings[i].offset) * 0.2;
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      {rings.map((ring, i) => (
        <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[ring.radius, ring.radius + 0.05, 64]} />
          <meshStandardMaterial
            color={ring.color}
            transparent
            opacity={0.4}
            emissive={ring.color}
            emissiveIntensity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
