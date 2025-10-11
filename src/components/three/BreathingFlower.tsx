import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BreathingFlowerProps {
  isInhaling: boolean;
  breathProgress: number;
}

export function BreathingFlower({ isInhaling, breathProgress }: BreathingFlowerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const circleRefs = useRef<THREE.Mesh[]>([]);
  const numCircles = 12;

  useEffect(() => {
    circleRefs.current = circleRefs.current.slice(0, numCircles);
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    circleRefs.current.forEach((circle, i) => {
      if (!circle) return;

      const angle = (i / numCircles) * Math.PI * 2;
      const baseRadius = 0.5;
      const expandedRadius = 3;

      const currentRadius = baseRadius + (expandedRadius - baseRadius) * breathProgress;

      circle.position.x = Math.cos(angle) * currentRadius;
      circle.position.y = Math.sin(angle) * currentRadius;

      const baseScale = 0.3;
      const expandedScale = 1.2;
      const currentScale = baseScale + (expandedScale - baseScale) * breathProgress;
      circle.scale.setScalar(currentScale);

      const baseOpacity = 0.4;
      const expandedOpacity = 0.8;
      const currentOpacity = baseOpacity + (expandedOpacity - baseOpacity) * breathProgress;
      (circle.material as THREE.MeshStandardMaterial).opacity = currentOpacity;

      circle.rotation.z += 0.005;
    });

    groupRef.current.rotation.z += isInhaling ? 0.01 : -0.01;
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: numCircles }).map((_, i) => {
        const hue = (i / numCircles) * 360;
        const color = new THREE.Color(`hsl(${hue}, 70%, 60%)`);

        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) circleRefs.current[i] = el;
            }}
            position={[0, 0, 0]}
          >
            <ringGeometry args={[0.8, 1.0, 32]} />
            <meshStandardMaterial
              color={color}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
              emissive={color}
              emissiveIntensity={0.3}
            />
          </mesh>
        );
      })}

      <mesh position={[0, 0, -0.1]}>
        <circleGeometry args={[0.5 + breathProgress * 0.5, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.2 + breathProgress * 0.3}
          emissive="#14b8a6"
          emissiveIntensity={0.5 + breathProgress * 0.5}
        />
      </mesh>

      <pointLight
        position={[0, 0, 2]}
        intensity={1 + breathProgress * 2}
        color="#14b8a6"
        distance={10}
      />
    </group>
  );
}
