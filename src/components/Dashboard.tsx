import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, BookOpen, Brain, LogOut, Home, Sparkles, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChatInterface } from './ChatInterface';
import { MoodTracker } from './MoodTracker';
import { Journal } from './Journal';
import { Meditation } from './Meditation';
import { ParticleSystem } from './three/ParticleSystem';
import { WaveBackground } from './three/WaveBackground';

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
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={0.8} />
            <pointLight position={[-10, -10, -10]} intensity={0.4} color="#14b8a6" />
            <ParticleSystem count={1500} color="#4ade80" size={0.025} speed={0.25} />
            <WaveBackground color="#14b8a6" opacity={0.15} />
            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.3} />
          </Canvas>
        </div>
      )}
      <motion.aside
        className="relative z-10 w-20 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col items-center py-6 space-y-6"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-green-400 rounded-xl flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>

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
  const { user } = useAuth();
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
          {greeting}
        </h1>
        <p className="text-xl text-gray-300">How are you feeling today? Let's make it a meaningful day together.</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-gradient-to-br from-teal-500/20 to-green-500/20 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Sparkles className="w-6 h-6 text-teal-400" />
            <h3 className="text-lg font-bold text-white">Daily Insight</h3>
          </div>
          <p className="text-gray-300">Regular check-ins help build emotional awareness. Take a moment to reflect on your feelings.</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Your Progress</h3>
          </div>
          <p className="text-gray-300">You're building healthy mental habits. Every session counts toward your wellbeing.</p>
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <motion.button
          onClick={() => onNavigate('chat')}
          className="relative bg-gray-800/70 backdrop-blur-xl border-2 border-teal-500/30 rounded-2xl p-8 text-left hover:border-teal-500/60 hover:bg-gray-800/90 transition-all duration-300 group overflow-hidden"
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="bg-teal-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-500/30 transition-colors">
              <MessageCircle className="w-8 h-8 text-teal-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">Talk to Your Companion</h3>
            <p className="text-gray-400 leading-relaxed">Share your thoughts and feelings in a judgment-free space. Available 24/7.</p>
          </div>
        </motion.button>

        <motion.button
          onClick={() => onNavigate('mood')}
          className="relative bg-gray-800/70 backdrop-blur-xl border-2 border-pink-500/30 rounded-2xl p-8 text-left hover:border-pink-500/60 hover:bg-gray-800/90 transition-all duration-300 group overflow-hidden"
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="bg-pink-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-colors">
              <Heart className="w-8 h-8 text-pink-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">Track Your Mood</h3>
            <p className="text-gray-400 leading-relaxed">Visualize your emotional journey with interactive 3D insights.</p>
          </div>
        </motion.button>

        <motion.button
          onClick={() => onNavigate('meditation')}
          className="relative bg-gray-800/70 backdrop-blur-xl border-2 border-green-500/30 rounded-2xl p-8 text-left hover:border-green-500/60 hover:bg-gray-800/90 transition-all duration-300 group overflow-hidden"
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="bg-green-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
              <Brain className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Guided Meditation</h3>
            <p className="text-gray-400 leading-relaxed">Find peace with AI-powered meditation and breathing exercises.</p>
          </div>
        </motion.button>

        <motion.button
          onClick={() => onNavigate('journal')}
          className="relative bg-gray-800/70 backdrop-blur-xl border-2 border-blue-500/30 rounded-2xl p-8 text-left hover:border-blue-500/60 hover:bg-gray-800/90 transition-all duration-300 group overflow-hidden"
          whileHover={{ scale: 1.03, y: -4 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="bg-blue-500/20 w-16 h-16 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition-colors">
              <BookOpen className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Daily Journal</h3>
            <p className="text-gray-400 leading-relaxed">Reflect and process your thoughts through guided writing.</p>
          </div>
        </motion.button>
      </motion.div>

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
