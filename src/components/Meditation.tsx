import { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, Volume2, ArrowLeft } from 'lucide-react';
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

export function Meditation({ onNavigate }: { onNavigate: (view: string) => void; }) {
  const [selectedType, setSelectedType] = useState(MEDITATION_TYPES[0]);
  const [isActive, setIsActive] = useState(false);
  const [sessionInProgress, setSessionInProgress] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(MEDITATION_TYPES[0].duration * 60);
  const [script, setScript] = useState('');
  const [scriptPromise, setScriptPromise] = useState<Promise<string> | null>(null);
  const [loading, setLoading] = useState(false);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [_moodAfter, setMoodAfter] = useState<number | null>(null);
  const [showMoodCheck, setShowMoodCheck] = useState<'before' | 'after' | null>(null);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const intervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('/Audio Tracks/Deep_Meditation_-_David_Fesliyan.mp3');
    audioRef.current.loop = true;

    return () => {
      // Cleanup audio on component unmount
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (isActive) {
      audioRef.current?.play();
      intervalRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      audioRef.current?.pause();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const handleStart = () => {
    setShowDurationPicker(true);
  };

  const handleDurationSelect = (duration: number) => {
    setSelectedDuration(duration);
    setShowDurationPicker(false);

    let prompt = `Generate a ${duration}-minute guided meditation script for a '${selectedType.name}' session.`;
    switch (selectedType.id) {
      case 'breathing':
        prompt += ' The script should focus heavily on the sensation of the breath, like the rise and fall of the chest, and use counting techniques.';
        break;
      case 'body-scan':
        prompt += ' The script should guide the user to bring gentle, non-judgmental awareness to each part of the body, from the toes to the head, noticing any sensations and releasing tension.';
        break;
      case 'mindfulness':
        prompt += ' The script should encourage the user to be present in the moment, observing thoughts and feelings without judgment, and gently returning their focus to the breath.';
        break;
      case 'visualization':
        prompt += ' The script should create a vivid, peaceful, and calming scene for the user to imagine, engaging multiple senses (sight, sound, smell).';
        break;
    }
    setScriptPromise(generateMeditationScript(selectedType.name, duration));
    setShowMoodCheck('before');
  };

  const cleanScript = (rawText: string) => {
    // Remove conversational intro and markdown
    const lines = rawText.split('\n');
    const scriptStartIndex = lines.findIndex(line => line.startsWith('**Title') || line.startsWith('###'));
    
    if (scriptStartIndex === -1) return rawText; // Return raw if format is unexpected

    return lines.slice(scriptStartIndex)
      .map(line => line
        .replace(/\*\*Title:\*\*/g, '')
        .replace(/\(Approximate timing: [^)]+\)/g, '')
        .replace(/\(\.\.\.\)/g, '')
        .replace(/###/g, '')
        .trim()
      )
      .filter(line => line.length > 0)
      .join('\n\n');
  };

  const handleMoodBeforeSubmit = async (mood: number) => {
    setMoodBefore(mood);
    setShowMoodCheck(null);
    setLoading(true);

    if (scriptPromise) {
      const generatedScript = await scriptPromise;
      setScript(cleanScript(generatedScript));
      setScriptPromise(null);
      setLoading(false);
    }

    setSessionInProgress(true);
    setTimeRemaining(selectedDuration * 60);
    setIsActive(true);
  };

  const handleComplete = () => {
    setIsActive(false);
    setShowMoodCheck('after');
  };

  const handleMoodAfterSubmit = async (mood: number) => {
    setMoodAfter(mood);
    setShowMoodCheck(null);
    setSessionInProgress(false);

    if (user && moodBefore !== null) {
      await supabase.from('meditation_sessions').insert({
        user_id: user.id,
        duration_minutes: selectedDuration,
        meditation_type: selectedType.name,
        completed: true,
        mood_before: moodBefore,
        mood_after: mood,
      });
    }
    handleReset(true);
  };

  const handleReset = (isEnd = false) => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    // Stop and rewind audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setTimeRemaining(selectedDuration * 60);
    if (isEnd) {
      setScript('');
      setMoodBefore(null);
      setMoodAfter(null);
      setSessionInProgress(false);
      setShowMoodCheck(null);
      setShowDurationPicker(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((selectedDuration * 60 - timeRemaining) / (selectedDuration * 60)) * 100;

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (showDurationPicker) {
      return <DurationPicker onSelect={handleDurationSelect} onCancel={() => setShowDurationPicker(false)} />;
    }

    if (showMoodCheck) {
      return (
        <MoodCheck
          type={showMoodCheck}
          onSubmit={showMoodCheck === 'before' ? handleMoodBeforeSubmit : handleMoodAfterSubmit}
          onCancel={() => {
            setShowMoodCheck(null);
            setSessionInProgress(false);
            setScriptPromise(null);
            setLoading(false);
          }}
        />
      );
    }

    if (sessionInProgress) {
      return (
        <>
          <style>
            {`
              .custom-scrollbar::-webkit-scrollbar {
                width: 8px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #14b8a6;
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #0d9488;
              }
              .timer-circle {
                transform: rotate(-90deg);
              }
            `}
          </style>
          <button
            onClick={() => { handleReset(true); }}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back to Menu</span>
          </button>
          <div className="w-full h-full flex flex-col items-center p-4 sm:p-8 overflow-y-auto">
            <motion.div
              className="text-center max-w-2xl w-full pt-12 sm:pt-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">{selectedType.name}</h3>

              <div className="relative w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-6 sm:mb-8">
                <svg className="timer-circle w-full h-full">
                  <circle cx="50%" cy="50%" r="calc(50% - 8px)" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                  <circle
                    cx="50%"
                    cy="50%"
                    r="calc(50% - 8px)"
                    stroke={selectedType.color}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * (window.innerWidth < 640 ? 88 : 120)}`}
                    strokeDashoffset={`${2 * Math.PI * (window.innerWidth < 640 ? 88 : 120) * (1 - progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl sm:text-5xl font-bold text-white">{formatTime(timeRemaining)}</div>
                </div>
              </div>

              <div className="custom-scrollbar bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 max-h-32 sm:max-h-48 overflow-y-auto">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{script}</p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <motion.button
                  onClick={() => setIsActive(!isActive)}
                  className="bg-teal-500 text-white rounded-full p-4 sm:p-6 hover:bg-teal-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isActive ? <Pause className="w-6 h-6 sm:w-8 sm:h-8" /> : <Play className="w-6 h-6 sm:w-8 sm:h-8" />}
                </motion.button>
                <motion.button
                  onClick={() => handleReset()}
                  className="bg-gray-700 text-white rounded-full p-4 sm:p-6 hover:bg-gray-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8" />
                </motion.button>
              </div>

              <div className="mt-6 sm:mt-8 flex items-center justify-center space-x-3 bg-gray-800/50 border border-teal-500/20 rounded-full px-4 py-2">
                <Volume2 className="w-5 h-5 text-teal-400" />
                <p className="text-xs sm:text-sm text-teal-200 font-medium">Plug in headphones for best experience</p>
              </div>
            </motion.div>
          </div>
        </>
      );
    }

    return (
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 relative">
        <button
          onClick={() => onNavigate('home')}
          className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back to Home</span>
        </button>
        <div className="max-w-4xl w-full">
          <motion.h2
            className="text-2xl sm:text-4xl font-bold text-white text-center mb-2 sm:mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Guided Meditation
          </motion.h2>
          <p className="text-gray-300 text-center text-sm sm:text-base mb-6 sm:mb-8">Find peace and calm your mind with AI-guided meditation</p>

          <div className="hidden sm:flex items-center justify-center space-x-3 bg-gray-800/50 border border-teal-500/20 rounded-full px-4 py-2 mb-8 max-w-md mx-auto">
            <Volume2 className="w-5 h-5 text-teal-400" />
            <p className="text-sm text-teal-200 font-medium">Plug in headphones for best experience</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
            {MEDITATION_TYPES.map((type) => (
              <motion.button
                key={type.id}
                onClick={() => {
                  setSelectedType(type);
                  setScript('');
                }}
                className={`bg-gray-800/80 backdrop-blur-xl border-2 rounded-2xl p-4 sm:p-6 text-left transition-all duration-300 ${
                  selectedType.id === type.id
                    ? 'border-teal-500 bg-teal-500/20'
                    : 'border-gray-700/50 hover:border-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{type.name}</h3>
                <p className="text-gray-400 text-sm sm:text-base mb-3">{type.description}</p>
              </motion.button>
            ))}
          </div>

          <div className="text-center">
            <motion.button
              onClick={handleStart}
              disabled={loading}
              className="bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-full px-8 sm:px-12 py-3 sm:py-4 font-bold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 disabled:opacity-50 inline-flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-6 h-6" />
              <span>{loading ? 'Preparing...' : 'Begin Session'}</span>
            </motion.button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 8]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={0.8} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} color={selectedType.color} />
          {sessionInProgress && <BreathingFlower isActive={isActive} color={selectedType.color} progress={progress} />}
          <WaveBackground color={selectedType.color} opacity={0.2} />
          <ParticleSystem count={1500} color={selectedType.color} size={0.02} speed={0.2} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.1} />
        </Canvas>
      </div>
      <div className="relative z-10 h-full flex flex-col">
        {renderContent()}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-30">
      <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
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
      className="flex-1 flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8 max-w-md w-full">
        <h3 className="text-xl sm:text-2xl font-bold text-white text-center mb-4">
          {type === 'before' ? 'How do you feel right now?' : 'How do you feel after the session?'}
        </h3>
        <p className="text-gray-400 text-center text-sm sm:text-base mb-6 sm:mb-8">
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
            <span className="text-3xl sm:text-4xl font-bold text-white">{selectedMood}/10</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => onSubmit(selectedMood)}
            className="w-full sm:flex-1 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl py-3 font-bold hover:shadow-lg transition-all duration-300"
          >
            Continue
          </button>
          <button
            onClick={onCancel}
            className="w-full sm:w-auto px-6 bg-gray-700 text-white rounded-xl py-3 font-bold hover:bg-gray-600 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function DurationPicker({ onSelect, onCancel }: { onSelect: (duration: number) => void; onCancel: () => void; }) {
  const durations = [1, 5, 10];

  return (
    <motion.div
      className="flex-1 flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 sm:p-8 max-w-lg w-full">
        <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-6 sm:mb-8">
          Choose a duration
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          {durations.map(duration => (
            <motion.button
              key={duration}
              onClick={() => onSelect(duration)}
              className="bg-gray-900/50 border-2 border-gray-700 rounded-xl p-4 sm:p-6 text-white text-2xl sm:text-3xl font-bold hover:border-teal-500 hover:bg-teal-500/10 transition-all duration-300 flex flex-col items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {duration}
              <span className="text-base sm:text-lg font-medium mt-1">min</span>
            </motion.button>
          ))}
        </div>
        <button
          onClick={onCancel}
          className="w-full bg-gray-700 text-white rounded-xl py-3 font-bold hover:bg-gray-600 transition-all duration-300"
        >
          Cancel
        </button>
      </div>
    </motion.div>
  );
}
