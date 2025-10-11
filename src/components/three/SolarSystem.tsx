import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface Planet {
  radius: number;
  orbitRadius: number;
  color: string;
  speed: number;
  size: number;
}

const planets: Planet[] = [
  { radius: 0.15, orbitRadius: 2, color: '#8b4513', speed: 0.4, size: 0.15 },
  { radius: 0.25, orbitRadius: 3, color: '#ffa500', speed: 0.3, size: 0.25 },
  { radius: 0.28, orbitRadius: 4.5, color: '#4169e1', speed: 0.2, size: 0.28 },
  { radius: 0.22, orbitRadius: 6, color: '#dc143c', speed: 0.15, size: 0.22 },
  { radius: 0.5, orbitRadius: 8, color: '#daa520', speed: 0.1, size: 0.5 },
  { radius: 0.4, orbitRadius: 10, color: '#87ceeb', speed: 0.08, size: 0.4 },
  { radius: 0.35, orbitRadius: 12, color: '#4682b4', speed: 0.06, size: 0.35 },
  { radius: 0.3, orbitRadius: 14, color: '#1e90ff', speed: 0.04, size: 0.3 },
];

function Planet({ planet }: { planet: Planet }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += planet.speed * 0.01;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[planet.orbitRadius, 0, 0]} ref={meshRef}>
        <sphereGeometry args={[planet.size, 32, 32]} />
        <meshStandardMaterial color={planet.color} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[planet.orbitRadius - 0.02, planet.orbitRadius + 0.02, 64]} />
        <meshBasicMaterial color="#ffffff" opacity={0.1} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 2 + Math.sin(state.clock.elapsedTime) * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial
        color="#ffd700"
        emissive="#ff8c00"
        emissiveIntensity={0.8}
        roughness={0.3}
      />
      <pointLight ref={lightRef} color="#ffffff" intensity={2} distance={50} />
    </mesh>
  );
}

function Stars() {
  const starsRef = useRef<THREE.Points>(null);

  const positions = new Float32Array(2000 * 3);
  for (let i = 0; i < 2000; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);
    const r = 30 + Math.random() * 20;

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0001;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="#ffffff" transparent opacity={0.8} />
    </points>
  );
}

export function SolarSystem() {
  return (
    <group>
      <ambientLight intensity={0.2} />
      <Stars />
      <Sun />
      {planets.map((planet, index) => (
        <Planet key={index} planet={planet} />
      ))}
    </group>
  );
}
