import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, BookOpen, Brain, LogOut, Home } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChatInterface } from './ChatInterface';
import { MoodTracker } from './MoodTracker';
import { Journal } from './Journal';
import { Meditation } from './Meditation';
import { ParticleSystem } from './three/ParticleSystem';
import { FloatingOrbs } from './three/FloatingOrbs';
import { BrainIcon } from './BrainIcon';

type View = 'home' | 'chat' | 'mood' | 'journal' | 'meditation';

export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('home');
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { id: 'home' as View, icon: Home, label: 'Home', color: 'teal' },
    { id: 'chat' as View, icon: MessageCircle, label: 'Chat', color: 'blue' },
    { id: 'mood' as View, icon: Heart, label: 'Mood', color: 'pink' },
    { id: 'journal' as View, icon: BookOpen, label: 'Journal', color: 'purple' },
    { id: 'meditation' as View, icon: Brain, label: 'Meditate', color: 'green' },
  ];

  return (
    <div className="relative flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 overflow-hidden">
      {currentView === 'home' && (
        <div className="absolute inset-0 z-0">
          <Canvas>
            <PerspectiveCamera makeDefault position={[0, 0, 6]} />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color="#14b8a6" />
            <ParticleSystem count={1200} color="#14b8a6" size={0.02} speed={0.3} />
            <FloatingOrbs />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.2} />
          </Canvas>
        </div>
      )}
      <motion.aside
        className="relative z-10 w-20 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col items-center py-6 space-y-6"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <button onClick={() => setCurrentView('home')} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors">
          <BrainIcon />
        </button>

        <div className="flex-1 flex flex-col space-y-4">
          {navItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                currentView === item.id
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/50'
                  : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <item.icon className="w-6 h-6" />
            </motion.button>
          ))}
        </div>

        <button
          onClick={handleSignOut}
          className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all duration-300 flex items-center justify-center"
        >
          <LogOut className="w-6 h-6" />
        </button>
      </motion.aside>

      <main className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-auto p-8"
            >
              <HomeView onNavigate={setCurrentView} />
            </motion.div>
          )}
          {currentView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <ChatInterface />
            </motion.div>
          )}
          {currentView === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <MoodTracker />
            </motion.div>
          )}
          {currentView === 'journal' && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Journal />
            </motion.div>
          )}
          {currentView === 'meditation' && (
            <motion.div
              key="meditation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Meditation />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function HomeView({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <div className="max-w-6xl mx-auto">
      <motion.h1
        className="text-4xl font-bold text-white mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Welcome to Your Safe Space
      </motion.h1>
      <p className="text-gray-400 mb-12">How are you feeling today?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.button
          onClick={() => onNavigate('chat')}
          className="bg-gray-800/70 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-8 text-left hover:border-teal-400/60 hover:shadow-xl hover:shadow-teal-500/20 transition-all duration-300 group"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-teal-400/10 rounded-full blur-xl group-hover:bg-teal-400/20 transition-all"></div>
            <MessageCircle className="relative w-14 h-14 text-teal-400 mb-4 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Talk to Your Companion</h3>
          <p className="text-gray-300">Share your thoughts and feelings in a judgment-free space.</p>
        </motion.button>

        <motion.button
          onClick={() => onNavigate('mood')}
          className="bg-gray-800/70 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-8 text-left hover:border-cyan-400/60 hover:shadow-xl hover:shadow-cyan-500/20 transition-all duration-300 group"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-400/10 rounded-full blur-xl group-hover:bg-cyan-400/20 transition-all"></div>
            <Heart className="relative w-14 h-14 text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Track Your Mood</h3>
          <p className="text-gray-300">Visualize your emotional journey with interactive insights.</p>
        </motion.button>

        <motion.button
          onClick={() => onNavigate('meditation')}
          className="bg-gray-800/70 backdrop-blur-xl border border-teal-600/30 rounded-2xl p-8 text-left hover:border-teal-500/60 hover:shadow-xl hover:shadow-teal-600/20 transition-all duration-300 group"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-teal-400/10 rounded-full blur-xl group-hover:bg-teal-400/20 transition-all"></div>
            <Brain className="relative w-14 h-14 text-teal-500 mb-4 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Guided Meditation</h3>
          <p className="text-gray-300">Find peace with AI-powered meditation sessions.</p>
        </motion.button>

        <motion.button
          onClick={() => onNavigate('journal')}
          className="bg-gray-800/70 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-8 text-left hover:border-emerald-400/60 hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 group"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-400/10 rounded-full blur-xl group-hover:bg-emerald-400/20 transition-all"></div>
            <BookOpen className="relative w-14 h-14 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Daily Journal</h3>
          <p className="text-gray-300">Reflect and process your thoughts through writing.</p>
        </motion.button>
      </div>

      <motion.div
        className="mt-12 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-2xl p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-bold text-red-400 mb-2">Crisis Support Available</h3>
        <p className="text-gray-300 mb-3">
          If you're in crisis or having thoughts of self-harm, please reach out for immediate help:
        </p>
        <div className="space-y-2 text-sm">
          <p className="text-gray-300">
            <span className="font-bold">National Suicide Prevention Lifeline:</span> 988
          </p>
          <p className="text-gray-300">
            <span className="font-bold">Crisis Text Line:</span> Text HOME to 741741
          </p>
          <p className="text-gray-300">
            <span className="font-bold">SAMHSA Helpline:</span> 1-800-662-4357
          </p>
        </div>
      </motion.div>
    </div>
  );
}
