import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { generateMeditationScript } from '../lib/gemini';
import { WaveBackground } from './three/WaveBackground';
import { ParticleSystem } from './three/ParticleSystem';
import { BreathingFlower } from './three/BreathingFlower';

const MEDITATION_TYPES = [
  {
    id: 'breathing',
    name: 'Breathing Exercise',
    description: 'Focus on your breath to calm your mind',
    duration: 5,
    color: '#14b8a6',
  },
  {
    id: 'body-scan',
    name: 'Body Scan',
    description: 'Release tension from head to toe',
    duration: 10,
    color: '#10b981',
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Be present in the current moment',
    duration: 7,
    color: '#4ade80',
  },
  {
    id: 'visualization',
    name: 'Visualization',
    description: 'Imagine a peaceful, calming place',
    duration: 8,
    color: '#22d3ee',
  },
];

export function Meditation() {
  const [selectedType, setSelectedType] = useState(MEDITATION_TYPES[0]);
  const [isActive, setIsActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [script, setScript] = useState('');
  const [loading, setLoading] = useState(false);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [showMoodCheck, setShowMoodCheck] = useState<'before' | 'after' | null>(null);
  const [isInhale, setIsInhale] = useState(true);
  const [breathCycle, setBreathCycle] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const breathIntervalRef = useRef<number | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      breathIntervalRef.current = window.setInterval(() => {
        setBreathCycle((prev) => prev + 1);
        setIsInhale((prev) => !prev);
      }, 4000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current);
      }
    };
  }, [isActive, timeRemaining]);

  const handleStart = async () => {
    if (!script) {
      setLoading(true);
      const generatedScript = await generateMeditationScript(
        selectedType.name,
        selectedType.duration
      );
      setScript(generatedScript);
      setLoading(false);
    }

    setShowMoodCheck('before');
  };

  const handleMoodBeforeSubmit = (mood: number) => {
    setMoodBefore(mood);
    setShowMoodCheck(null);
    setTimeRemaining(selectedType.duration * 60);
    setIsActive(true);
  };

  const handleComplete = () => {
    setIsActive(false);
    setShowMoodCheck('after');
  };

  const handleMoodAfterSubmit = async (mood: number) => {
    setMoodAfter(mood);
    setShowMoodCheck(null);

    if (user && moodBefore !== null) {
      await supabase.from('meditation_sessions').insert({
        user_id: user.id,
        duration_minutes: selectedType.duration,
        meditation_type: selectedType.name,
        completed: true,
        mood_before: moodBefore,
        mood_after: mood,
      });
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setTimeRemaining(selectedType.duration * 60);
    setScript('');
    setMoodBefore(null);
    setMoodAfter(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((selectedType.duration * 60 - timeRemaining) / (selectedType.duration * 60)) * 100;

  return (
    <div className="h-full relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.4} />
          <pointLight position={[10, 10, 10]} intensity={0.6} />
          <pointLight position={[-10, -10, -10]} intensity={0.3} color="#60a5fa" />
          {isActive && <BreathingFlower isInhale={isInhale} duration={4} />}
          <WaveBackground color={selectedType.color} opacity={0.3} />
          <ParticleSystem count={1000} color={selectedType.color} size={0.02} speed={0.2} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={!isActive} autoRotateSpeed={0.2} />
        </Canvas>
      </div>

      <div className="relative z-10 h-full flex flex-col">
        {!isActive && !showMoodCheck ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="max-w-4xl w-full">
              <motion.h2
                className="text-4xl font-bold text-white text-center mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Guided Meditation
              </motion.h2>
              <p className="text-gray-300 text-center mb-12">
                Find peace and calm your mind with AI-guided meditation
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {MEDITATION_TYPES.map((type) => (
                  <motion.button
                    key={type.id}
                    onClick={() => {
                      setSelectedType(type);
                      setScript('');
                      setTimeRemaining(type.duration * 60);
                    }}
                    className={`bg-gray-800/80 backdrop-blur-xl border-2 rounded-2xl p-6 text-left transition-all duration-300 ${
                      selectedType.id === type.id
                        ? 'border-teal-500 bg-teal-500/20'
                        : 'border-gray-700/50 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-2">{type.name}</h3>
                    <p className="text-gray-400 mb-3">{type.description}</p>
                    <p className="text-teal-400 font-semibold">{type.duration} minutes</p>
                  </motion.button>
                ))}
              </div>

              <div className="text-center">
                <motion.button
                  onClick={handleStart}
                  disabled={loading}
                  className="bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-full px-12 py-4 font-bold text-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 inline-flex items-center space-x-3"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-6 h-6" />
                  <span>{loading ? 'Preparing...' : 'Begin Session'}</span>
                </motion.button>
              </div>
            </div>
          </div>
        ) : showMoodCheck ? (
          <MoodCheck
            type={showMoodCheck}
            onSubmit={showMoodCheck === 'before' ? handleMoodBeforeSubmit : handleMoodAfterSubmit}
            onCancel={handleReset}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <motion.div
              className="text-center max-w-2xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-3xl font-bold text-white mb-4">{selectedType.name}</h3>

              <div className="text-2xl font-semibold text-teal-400 mb-4">
                {isInhale ? 'Breathe In...' : 'Breathe Out...'}
              </div>

              <div className="relative w-64 h-64 mx-auto mb-8">
                <svg className="transform -rotate-90 w-64 h-64">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    stroke={selectedType.color}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 120}`}
                    strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-6xl font-bold text-white">{formatTime(timeRemaining)}</div>
                </div>
              </div>

              <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 mb-8 max-h-48 overflow-y-auto">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{script}</p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <motion.button
                  onClick={() => setIsActive(!isActive)}
                  className="bg-teal-500 text-white rounded-full p-6 hover:bg-teal-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </motion.button>
                <motion.button
                  onClick={handleReset}
                  className="bg-gray-700 text-white rounded-full p-6 hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RotateCcw className="w-8 h-8" />
                </motion.button>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-2 text-gray-400">
                <Volume2 className="w-5 h-5" />
                <p className="text-sm">Find a quiet space and use headphones for the best experience</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function MoodCheck({
  type,
  onSubmit,
  onCancel,
}: {
  type: 'before' | 'after';
  onSubmit: (mood: number) => void;
  onCancel: () => void;
}) {
  const [selectedMood, setSelectedMood] = useState(5);

  return (
    <motion.div
      className="flex-1 flex items-center justify-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 max-w-md w-full">
        <h3 className="text-2xl font-bold text-white text-center mb-4">
          {type === 'before' ? 'How do you feel right now?' : 'How do you feel after the session?'}
        </h3>
        <p className="text-gray-400 text-center mb-8">
          Rate your mood on a scale of 1-10
        </p>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-2xl">😔</span>
            <span className="text-2xl">😐</span>
            <span className="text-2xl">😊</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={selectedMood}
            onChange={(e) => setSelectedMood(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-center mt-4">
            <span className="text-4xl font-bold text-white">{selectedMood}/10</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => onSubmit(selectedMood)}
            className="flex-1 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl py-3 font-bold hover:shadow-lg transition-all duration-300"
          >
            Continue
          </button>
          <button
            onClick={onCancel}
            className="px-6 bg-gray-700 text-white rounded-xl py-3 font-bold hover:bg-gray-600 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}
