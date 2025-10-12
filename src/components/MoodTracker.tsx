import { useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { motion } from 'framer-motion';
import { TrendingUp, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, MoodEntry } from '../lib/supabase';
import { Card3D } from './Card3D';
import { FloatingSpheres } from './three/FloatingSpheres';
import { generateAffirmation } from '../lib/gemini';
import { MoodChart } from './MoodChart';
import { MoodInsights } from './MoodInsights';

const MOOD_OPTIONS = [
  { label: 'Happy', score: 10, emoji: '😊', color: '#4ade80' },
  { label: 'Content', score: 8, emoji: '😌', color: '#10b981' },
  { label: 'Calm', score: 7, emoji: '😐', color: '#14b8a6' },
  { label: 'Okay', score: 5, emoji: '🙂', color: '#06b6d4' },
  { label: 'Anxious', score: 4, emoji: '😰', color: '#f59e0b' },
  { label: 'Sad', score: 3, emoji: '😢', color: '#f97316' },
  { label: 'Stressed', score: 2, emoji: '😫', color: '#ef4444' },
  { label: 'Very Low', score: 1, emoji: '😔', color: '#dc2626' },
];

export function MoodTracker() {
  const [selectedMood, setSelectedMood] = useState<typeof MOOD_OPTIONS[0] | null>(null);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [triggers, setTriggers] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [affirmation, setAffirmation] = useState('');
  const [showForm, setShowForm] = useState(false);
  const { user } = useAuth();

  const loadMoodHistory = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(30);

    if (!error && data) {
      setMoodHistory(data);
    }
  }, [user]);

  useEffect(() => {
    loadMoodHistory();
  }, [loadMoodHistory]);

  const handleSubmit = async () => {
    if (!selectedMood || !user) return;

    const triggerArray = triggers
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const { error } = await supabase.from('mood_entries').insert({
      user_id: user.id,
      mood_score: selectedMood.score,
      mood_label: selectedMood.label,
      energy_level: energyLevel,
      stress_level: stressLevel,
      notes,
      triggers: triggerArray,
    });

    if (!error) {
      const affirmationText = await generateAffirmation(selectedMood.label);
      setAffirmation(affirmationText);
      setShowForm(false);
      setNotes('');
      setTriggers('');
      loadMoodHistory();
    }
  };

  const averageMood =
    moodHistory.length > 0
      ? Math.round(
          moodHistory.slice(0, 7).reduce((sum, entry) => sum + entry.mood_score, 0) /
            Math.min(moodHistory.length, 7)
        )
      : 5;

  return (
    <div className="h-full overflow-auto relative">
      <div className="absolute inset-0 z-0 opacity-20">
        <Canvas>
          <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <FloatingSpheres count={10} moodScore={averageMood} />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
        </Canvas>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-2">Mood Tracker</h2>
          <p className="text-gray-400 mb-8">Track your emotional wellness journey</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card3D glowColor="rgba(74, 222, 128, 0.4)">
              <div className="bg-gray-800/80 backdrop-blur-xl border border-teal-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">7-Day Average</span>
                  <TrendingUp className="w-5 h-5 text-teal-400" />
                </div>
                <p className="text-4xl font-bold text-white">{averageMood}/10</p>
                <p className="text-sm text-gray-400 mt-2">
                  {averageMood >= 7 ? 'Doing great!' : averageMood >= 4 ? 'Hanging in there' : 'Need support'}
                </p>
              </div>
            </Card3D>

            <Card3D glowColor="rgba(20, 184, 166, 0.4)">
              <div className="bg-gray-800/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Total Entries</span>
                  <Calendar className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-4xl font-bold text-white">{moodHistory.length}</p>
                <p className="text-sm text-gray-400 mt-2">Keep tracking daily</p>
              </div>
            </Card3D>

            <Card3D glowColor="rgba(16, 185, 129, 0.4)">
              <div className="bg-gray-800/80 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400">Current Mood</span>
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-4xl font-bold text-white">
                  {moodHistory.length > 0 ? `${moodHistory[0].mood_score}/10` : '-'}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {moodHistory.length > 0 ? moodHistory[0].mood_label : 'Not set'}
                </p>
              </div>
            </Card3D>
          </div>

          {affirmation && (
            <motion.div
              className="bg-gradient-to-r from-teal-500/20 to-green-500/20 border border-teal-500/30 rounded-2xl p-6 mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <p className="text-lg text-white font-medium text-center">{affirmation}</p>
            </motion.div>
          )}

          {moodHistory.length >= 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <MoodChart entries={moodHistory} />
              <MoodInsights entries={moodHistory} />
            </div>
          )}

          {!showForm ? (
            <motion.button
              onClick={() => setShowForm(true)}
              className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-2xl py-4 font-bold text-lg hover:shadow-2xl transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Log Your Mood Today
            </motion.button>
          ) : (
            <motion.div
              className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-2xl font-bold text-white mb-6">How are you feeling?</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {MOOD_OPTIONS.map((mood) => (
                  <motion.button
                    key={mood.label}
                    onClick={() => setSelectedMood(mood)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selectedMood?.label === mood.label
                        ? 'border-teal-500 bg-teal-500/20'
                        : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-4xl mb-2">{mood.emoji}</div>
                    <p className="text-white font-medium">{mood.label}</p>
                  </motion.button>
                ))}
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-gray-300 mb-2">Energy Level: {energyLevel}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Stress Level: {stressLevel}/10</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors"
                    rows={3}
                    placeholder="What's on your mind?"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">Triggers (comma-separated)</label>
                  <input
                    type="text"
                    value={triggers}
                    onChange={(e) => setTriggers(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 transition-colors"
                    placeholder="work, social, sleep, etc."
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleSubmit}
                    disabled={!selectedMood}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-xl py-3 font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Mood Entry
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-6 bg-gray-700 text-white rounded-xl py-3 font-bold hover:bg-gray-600 transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          <div className="mt-12">
            <h3 className="text-2xl font-bold text-white mb-6">Recent Entries</h3>
            <div className="space-y-4">
              {moodHistory.slice(0, 5).map((entry) => (
                <Card3D key={entry.id}>
                  <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">
                          {MOOD_OPTIONS.find((m) => m.label === entry.mood_label)?.emoji || '😐'}
                        </div>
                        <div>
                          <p className="text-white font-bold">{entry.mood_label}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(entry.created_at).toLocaleDateString()} at{' '}
                            {new Date(entry.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-2xl">{entry.mood_score}/10</p>
                        <p className="text-gray-400 text-xs">Energy: {entry.energy_level}/10</p>
                        <p className="text-gray-400 text-xs">Stress: {entry.stress_level}/10</p>
                      </div>
                    </div>
                    {entry.notes && (
                      <p className="text-gray-300 mt-3 text-sm">{entry.notes}</p>
                    )}
                    {entry.triggers.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {entry.triggers.map((trigger, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-700/50 rounded-lg text-xs text-gray-300"
                          >
                            {trigger}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Card3D>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
