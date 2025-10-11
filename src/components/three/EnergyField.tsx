import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function EnergyField() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    const time = state.clock.elapsedTime;
    meshRef.current.rotation.y = time * 0.2;
    meshRef.current.rotation.z = time * 0.1;

    const geometry = meshRef.current.geometry as THREE.TorusGeometry;
    const positions = geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const y = positions[i + 1];
      const distance = Math.sqrt(x * x + y * y);
      positions[i + 2] = Math.sin(distance * 2 - time * 2) * 0.1;
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <mesh ref={meshRef}>
      <torusGeometry args={[2.5, 0.4, 32, 100]} />
      <meshStandardMaterial
        color="#14b8a6"
        emissive="#0d9488"
        emissiveIntensity={0.4}
        transparent
        opacity={0.4}
        wireframe
      />
    </mesh>
  );
}
