import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BreathingCirclesProps {
  isActive: boolean;
  breathingPhase: 'inhale' | 'hold' | 'exhale' | 'pause';
}

export function BreathingCircles({ isActive, breathingPhase }: BreathingCirclesProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [targetScale, setTargetScale] = useState(0.5);
  const [currentScale, setCurrentScale] = useState(0.5);

  useEffect(() => {
    if (!isActive) {
      setTargetScale(0.5);
      return;
    }

    switch (breathingPhase) {
      case 'inhale':
        setTargetScale(2.0);
        break;
      case 'hold':
        setTargetScale(2.0);
        break;
      case 'exhale':
        setTargetScale(0.5);
        break;
      case 'pause':
        setTargetScale(0.5);
        break;
    }
  }, [breathingPhase, isActive]);

  useFrame(() => {
    if (!groupRef.current) return;

    const lerpSpeed = breathingPhase === 'hold' || breathingPhase === 'pause' ? 0.01 : 0.02;
    setCurrentScale(prev => prev + (targetScale - prev) * lerpSpeed);

    groupRef.current.scale.set(currentScale, currentScale, 1);
    groupRef.current.rotation.z += 0.002;
  });

  const circles = Array.from({ length: 8 }, (_, i) => {
    const radius = 0.3 + i * 0.15;
    const opacity = 1 - i * 0.1;
    return { radius, opacity };
  });

  const getPhaseColor = () => {
    switch (breathingPhase) {
      case 'inhale':
        return '#4ade80';
      case 'hold':
        return '#3b82f6';
      case 'exhale':
        return '#14b8a6';
      case 'pause':
        return '#6366f1';
      default:
        return '#4ade80';
    }
  };

  return (
    <group ref={groupRef}>
      {circles.map((circle, i) => (
        <mesh key={i} position={[0, 0, -i * 0.1]}>
          <ringGeometry args={[circle.radius, circle.radius + 0.02, 64]} />
          <meshBasicMaterial
            color={getPhaseColor()}
            transparent
            opacity={circle.opacity * 0.6}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
      <mesh>
        <circleGeometry args={[0.25, 64]} />
        <meshBasicMaterial
          color={getPhaseColor()}
          transparent
          opacity={0.8}
        />
      </mesh>
    </group>
  );
}
