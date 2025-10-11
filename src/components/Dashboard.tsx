import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Heart, BookOpen, Brain, LogOut, Home, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ChatInterface } from './ChatInterface';
import { MoodTracker } from './MoodTracker';
import { Journal } from './Journal';
import { Meditation } from './Meditation';
import { AmbientBackground } from './three/AmbientBackground';
import { supabase } from '../lib/supabase';

type View = 'home' | 'chat' | 'mood' | 'journal' | 'meditation';

export function Dashboard() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [averageMood, setAverageMood] = useState(5);
  const { signOut, user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchAverageMood();
    }
  }, [user]);

  const fetchAverageMood = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('mood_entries')
      .select('mood_score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(7);

    if (data && data.length > 0) {
      const avg = data.reduce((acc, entry) => acc + entry.mood_score, 0) / data.length;
      setAverageMood(Math.round(avg));
    }
  };

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
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 relative overflow-hidden">
      {currentView === 'home' && <AmbientBackground variant="dashboard" moodScore={averageMood} />}
      <motion.aside
        className="w-20 bg-gray-900/50 backdrop-blur-xl border-r border-gray-700/50 flex flex-col items-center py-6 space-y-6"
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

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full overflow-auto p-8 relative z-10"
            >
              <HomeView onNavigate={setCurrentView} averageMood={averageMood} />
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

function HomeView({ onNavigate, averageMood }: { onNavigate: (view: View) => void; averageMood: number }) {
  const [stats, setStats] = useState({ journalCount: 0, meditationMinutes: 0, moodEntries: 0 });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    const [journalData, meditationData, moodData] = await Promise.all([
      supabase.from('journal_entries').select('id', { count: 'exact' }).eq('user_id', user.id),
      supabase.from('meditation_sessions').select('duration_minutes').eq('user_id', user.id),
      supabase.from('mood_entries').select('id', { count: 'exact' }).eq('user_id', user.id),
    ]);

    const totalMeditationMinutes = meditationData.data?.reduce((acc, session) => acc + session.duration_minutes, 0) || 0;

    setStats({
      journalCount: journalData.count || 0,
      meditationMinutes: totalMeditationMinutes,
      moodEntries: moodData.count || 0,
    });
  };

  const getMoodEmoji = (mood: number) => {
    if (mood >= 8) return '😊';
    if (mood >= 6) return '🙂';
    if (mood >= 4) return '😐';
    return '😔';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-5xl font-bold text-white mb-3 bg-gradient-to-r from-teal-400 to-green-400 bg-clip-text text-transparent">
          Welcome Back
        </h1>
        <p className="text-gray-300 text-xl">How are you feeling today? {getMoodEmoji(averageMood)}</p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="bg-gradient-to-br from-teal-500/20 to-green-500/20 backdrop-blur-xl border border-teal-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 text-teal-400" />
            <span className="text-4xl">{getMoodEmoji(averageMood)}</span>
          </div>
          <p className="text-gray-300 text-sm mb-1">Average Mood</p>
          <p className="text-3xl font-bold text-white">{averageMood}/10</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-8 h-8 text-blue-400" />
            <span className="text-4xl">📝</span>
          </div>
          <p className="text-gray-300 text-sm mb-1">Journal Entries</p>
          <p className="text-3xl font-bold text-white">{stats.journalCount}</p>
        </div>

        <div className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-2">
            <Sparkles className="w-8 h-8 text-pink-400" />
            <span className="text-4xl">🧘</span>
          </div>
          <p className="text-gray-300 text-sm mb-1">Meditation Time</p>
          <p className="text-3xl font-bold text-white">{stats.meditationMinutes}m</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.button
          onClick={() => onNavigate('chat')}
          className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-8 text-left overflow-hidden group"
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-green-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors">Talk to Your Companion</h3>
            <p className="text-gray-400 leading-relaxed">Share your thoughts and feelings in a judgment-free space.</p>
          </div>
        </motion.button>

        <motion.button
          onClick={() => onNavigate('mood')}
          className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-pink-500/30 rounded-3xl p-8 text-left overflow-hidden group"
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">Track Your Mood</h3>
            <p className="text-gray-400 leading-relaxed">Visualize your emotional journey with interactive insights.</p>
          </div>
        </motion.button>

        <motion.button
          onClick={() => onNavigate('meditation')}
          className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-green-500/30 rounded-3xl p-8 text-left overflow-hidden group"
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">Guided Meditation</h3>
            <p className="text-gray-400 leading-relaxed">Find peace with AI-powered meditation sessions.</p>
          </div>
        </motion.button>

        <motion.button
          onClick={() => onNavigate('journal')}
          className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-8 text-left overflow-hidden group"
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Daily Journal</h3>
            <p className="text-gray-400 leading-relaxed">Reflect and process your thoughts through writing.</p>
          </div>
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
