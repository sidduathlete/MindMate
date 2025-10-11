import { Canvas } from '@react-three/fiber';
import { FloatingSpheres } from './FloatingSpheres';
import { WaveBackground } from './WaveBackground';
import { ParticleSystem } from './ParticleSystem';
import { FloatingTorus } from './FloatingTorus';
import { GlowingOrbs } from './GlowingOrbs';
import { SpiralRings } from './SpiralRings';

interface AmbientBackgroundProps {
  variant?: 'landing' | 'dashboard' | 'auth';
  moodScore?: number;
}

export function AmbientBackground({ variant = 'landing', moodScore = 5 }: AmbientBackgroundProps) {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#60a5fa" />

        {variant === 'landing' && (
          <>
            <FloatingTorus position={[-3, 2, -2]} color="#14b8a6" speed={0.8} />
            <FloatingTorus position={[3, -1, -3]} color="#8b5cf6" speed={0.6} />
            <GlowingOrbs count={6} />
            <SpiralRings />
            <ParticleSystem count={1500} color="#4ade80" size={0.015} speed={0.3} />
            <WaveBackground color="#14b8a6" opacity={0.2} />
          </>
        )}

        {variant === 'dashboard' && (
          <>
            <FloatingSpheres count={8} moodScore={moodScore} />
            <GlowingOrbs count={4} />
            <FloatingTorus position={[0, 0, -2]} color="#60a5fa" speed={0.5} />
            <ParticleSystem count={1000} color="#8b5cf6" size={0.02} speed={0.4} />
            <WaveBackground color="#60a5fa" opacity={0.25} />
          </>
        )}

        {variant === 'auth' && (
          <>
            <FloatingTorus position={[-2, 1, -2]} color="#14b8a6" speed={0.7} />
            <FloatingTorus position={[2, -1, -3]} color="#60a5fa" speed={0.5} />
            <GlowingOrbs count={5} />
            <SpiralRings />
            <ParticleSystem count={1200} color="#4ade80" size={0.018} speed={0.35} />
            <WaveBackground color="#14b8a6" opacity={0.2} />
          </>
        )}
      </Canvas>
    </div>
  );
}
