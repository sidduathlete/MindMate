import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BreathingFlowerProps {
  isActive: boolean;
  color: string;
  progress: number;
}

export function BreathingFlower({ isActive, color, progress }: BreathingFlowerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const petalRefs = useRef<THREE.Mesh[]>([]);

  const petalCount = 8;
  const breathCycle = 8;

  useFrame((state) => {
    if (!groupRef.current || !isActive) return;

    const time = state.clock.elapsedTime;
    const breathPhase = (Math.sin(time * (Math.PI / breathCycle)) + 1) / 2;

    groupRef.current.rotation.z = time * 0.1;

    petalRefs.current.forEach((petal, index) => {
      if (!petal) return;

      const delay = index * 0.125;
      const scale = 0.5 + breathPhase * 0.5;
      const distance = 1.5 + breathPhase * 0.8;

      const angle = (index / petalCount) * Math.PI * 2;
      petal.position.x = Math.cos(angle + time * 0.1) * distance;
      petal.position.y = Math.sin(angle + time * 0.1) * distance;
      petal.scale.setScalar(scale + Math.sin(time * 2 + delay * Math.PI * 2) * 0.1);

      const opacity = 0.4 + breathPhase * 0.4;
      if (petal.material instanceof THREE.MeshStandardMaterial) {
        petal.material.opacity = opacity;
      }
    });
  });

  return (
    <group ref={groupRef}>
      <mesh scale={1 + progress / 100}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>

      {Array.from({ length: petalCount }).map((_, i) => {
        const angle = (i / petalCount) * Math.PI * 2;
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) petalRefs.current[i] = el;
            }}
            position={[Math.cos(angle) * 2, Math.sin(angle) * 2, 0]}
          >
            <sphereGeometry args={[0.4, 32, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.4}
              transparent
              opacity={0.6}
            />
          </mesh>
        );
      })}

      {Array.from({ length: petalCount * 2 }).map((_, i) => {
        const angle = (i / (petalCount * 2)) * Math.PI * 2;
        const radius = 3.5;
        return (
          <mesh
            key={`outer-${i}`}
            position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
          >
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.3}
              transparent
              opacity={0.3}
            />
          </mesh>
        );
      })}
    </group>
  );
}
