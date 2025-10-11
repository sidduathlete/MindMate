import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BreathingFlowerProps {
  isInhale: boolean;
  duration: number;
}

export function BreathingFlower({ isInhale, duration }: BreathingFlowerProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [targetScale, setTargetScale] = useState(1);

  useEffect(() => {
    setTargetScale(isInhale ? 2 : 0.5);
  }, [isInhale]);

  const circles = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    return {
      index: i,
      angle,
      color: new THREE.Color().setHSL((i / 8) * 0.3 + 0.5, 0.8, 0.6),
    };
  });

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const time = state.clock.elapsedTime;

    groupRef.current.children.forEach((child, i) => {
      const currentScale = child.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 2);
      child.scale.set(newScale, newScale, newScale);

      const petalAngle = circles[i].angle + time * 0.2;
      const distance = newScale * 1.5;
      child.position.x = Math.cos(petalAngle) * distance;
      child.position.y = Math.sin(petalAngle) * distance;

      child.rotation.z = petalAngle;
    });

    groupRef.current.rotation.z = time * 0.1;
  });

  return (
    <group ref={groupRef}>
      {circles.map((circle) => (
        <mesh key={circle.index} position={[0, 0, 0]}>
          <circleGeometry args={[0.5, 32]} />
          <meshStandardMaterial
            color={circle.color}
            transparent
            opacity={0.7}
            emissive={circle.color}
            emissiveIntensity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <mesh>
        <circleGeometry args={[0.3, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.9}
          emissive="#ffffff"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  );
}
