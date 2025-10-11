import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { ParticleSystem } from './three/ParticleSystem';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, BookOpen, Brain } from 'lucide-react';
import { Card3D } from './Card3D';

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
          <ParticleSystem count={1500} color="#4ade80" size={0.03} speed={0.3} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        <motion.header
          className="flex justify-between items-center mb-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-teal-400" />
            <span className="text-2xl font-bold text-white">MindfulCompanion</span>
          </div>
          <button
            onClick={onGetStarted}
            className="px-6 py-2 bg-white text-gray-900 rounded-full font-semibold hover:bg-teal-400 transition-all duration-300"
          >
            Try for Free
          </button>
        </motion.header>

        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Unleash the Power
            <br />
            <span className="bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
              of Mental Wellness
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Your empathetic AI companion for mental health support. Track moods, practice mindfulness, and grow stronger every day.
          </p>
          <button
            onClick={onGetStarted}
            className="px-8 py-4 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Signup for free
          </button>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Card3D glowColor="rgba(20, 184, 166, 0.5)">
            <div className="bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-teal-500/20 h-full">
              <MessageCircle className="w-12 h-12 text-teal-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">AI Therapy Chat</h3>
              <p className="text-gray-300">
                Talk to an empathetic AI companion trained in CBT techniques and active listening.
              </p>
            </div>
          </Card3D>

          <Card3D glowColor="rgba(74, 222, 128, 0.5)">
            <div className="bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-green-500/20 h-full">
              <Heart className="w-12 h-12 text-green-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Mood Tracking</h3>
              <p className="text-gray-300">
                Visualize your emotional journey with interactive 3D mood boards and insights.
              </p>
            </div>
          </Card3D>

          <Card3D glowColor="rgba(34, 197, 94, 0.5)">
            <div className="bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-emerald-500/20 h-full">
              <Brain className="w-12 h-12 text-emerald-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Guided Meditation</h3>
              <p className="text-gray-300">
                AI-generated meditation sessions with calming 3D visualizations and breathing exercises.
              </p>
            </div>
          </Card3D>

          <Card3D glowColor="rgba(16, 185, 129, 0.5)">
            <div className="bg-gray-800/80 backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/20 h-full">
              <BookOpen className="w-12 h-12 text-cyan-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Daily Journal</h3>
              <p className="text-gray-300">
                Reflect on your thoughts and feelings with guided journaling prompts.
              </p>
            </div>
          </Card3D>
        </motion.div>

        <motion.div
          className="mt-20 text-center"
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
