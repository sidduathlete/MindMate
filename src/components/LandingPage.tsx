import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ParticleSystem } from './three/ParticleSystem';
import { WaveBackground } from './three/WaveBackground';
import { FloatingOrbs } from './three/FloatingOrbs';
import { EnergyField } from './three/EnergyField';
import { motion } from 'framer-motion';
import { MessageCircle, BookOpen, Brain } from 'lucide-react';
import { Card3D } from './Card3D';
import { BrainIcon } from './BrainIcon';

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} color="#14b8a6" />
          <ParticleSystem count={2000} color="#14b8a6" size={0.025} speed={0.4} />
          <WaveBackground color="#0d9488" opacity={0.2} />
          <FloatingOrbs />
          <EnergyField />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
        </Canvas>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 sm:px-6 sm:py-8">
        <motion.header
          className="flex justify-between items-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <a href="/" className="flex items-center space-x-2">
            <BrainIcon />
            <span className="text-lg sm:text-xl font-bold text-white">MindMate</span>
          </a>
          <button
            onClick={onGetStarted}
            className="hidden sm:block px-5 py-2 bg-white text-gray-900 rounded-full font-semibold hover:bg-teal-400 transition-all duration-300 text-sm"
          >
            Try for Free
          </button>
        </motion.header>

        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">
            Your Journey to
            <br />
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Mental Wellness
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 mb-6 max-w-full sm:max-w-md md:max-w-2xl mx-auto">
            Your empathetic AI companion for mental health support. Track moods, practice mindfulness, and grow stronger every day.
          </p>
          <button
            onClick={onGetStarted}
            className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-full font-bold text-base sm:text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Sign Up for free
          </button>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Card3D glowColor="rgba(20, 184, 166, 0.5)">
            <div className="bg-gray-800/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-teal-500/20 h-full hover:border-teal-400/40 transition-all duration-300">
              <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-teal-400 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">AI Therapy Chat</h3>
              <p className="text-sm sm:text-base text-gray-300">
                Talk to an empathetic AI companion trained in CBT techniques and active listening.
              </p>
            </div>
          </Card3D>

          <Card3D glowColor="rgba(20, 184, 166, 0.5)">
            <div className="bg-gray-800/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-cyan-500/20 h-full hover:border-cyan-400/40 transition-all duration-300">
              <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Mood Tracking</h3>
              <p className="text-sm sm:text-base text-gray-300">
                Visualize your emotional journey with interactive 3D mood boards and insights.
              </p>
            </div>
          </Card3D>

          <Card3D glowColor="rgba(20, 184, 166, 0.5)">
            <div className="bg-gray-800/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-teal-600/20 h-full hover:border-teal-500/40 transition-all duration-300">
              <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Guided Meditation</h3>
              <p className="text-sm sm:text-base text-gray-300">
                AI-generated meditation sessions with calming 3D visualizations and breathing exercises.
              </p>
            </div>
          </Card3D>

          <Card3D glowColor="rgba(20, 184, 166, 0.5)">
            <div className="bg-gray-800/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl border border-emerald-500/20 h-full hover:border-emerald-400/40 transition-all duration-300">
              <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-cyan-400 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Daily Journal</h3>
              <p className="text-sm sm:text-base text-gray-300">
                Reflect on your thoughts and feelings with guided journaling prompts.
              </p>
            </div>
          </Card3D>
        </motion.div>

        <motion.div
          className="mt-12 md:mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <p className="text-gray-400 text-sm">
            24/7 support. Completely confidential. Non-judgmental space.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Crisis support available. If you're in danger, please call 988 immediately.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
