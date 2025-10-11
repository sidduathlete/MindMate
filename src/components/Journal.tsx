import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, JournalEntry } from '../lib/supabase';
import { Card3D } from './Card3D';

export function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [moodAtTime, setMoodAtTime] = useState('');
  const [gratitude, setGratitude] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadEntries();
    }
  }, [user]);

  const loadEntries = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEntries(data);
    }
  };

  const handleSubmit = async () => {
    if (!user || !content.trim()) return;

    const gratitudeArray = gratitude
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);

    if (editingEntry) {
      const { error } = await supabase
        .from('journal_entries')
        .update({
          title,
          content,
          mood_at_time: moodAtTime,
          gratitude_items: gratitudeArray,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingEntry.id);

      if (!error) {
        resetForm();
        loadEntries();
      }
    } else {
      const { error } = await supabase.from('journal_entries').insert({
        user_id: user.id,
        title,
        content,
        mood_at_time: moodAtTime,
        gratitude_items: gratitudeArray,
      });

      if (!error) {
        resetForm();
        loadEntries();
      }
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setMoodAtTime(entry.mood_at_time);
    setGratitude(entry.gratitude_items.join(', '));
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    const { error } = await supabase.from('journal_entries').delete().eq('id', id);

    if (!error) {
      loadEntries();
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingEntry(null);
    setTitle('');
    setContent('');
    setMoodAtTime('');
    setGratitude('');
  };

  return (
    <div className="h-full overflow-auto p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-purple-900">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Daily Journal</h2>
            <p className="text-gray-400">Reflect on your thoughts and feelings</p>
          </div>
          {!showForm && (
            <motion.button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl px-6 py-3 font-bold flex items-center space-x-2 hover:shadow-lg transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus className="w-5 h-5" />
              <span>New Entry</span>
            </motion.button>
          )}
        </div>

        {showForm && (
          <motion.div
            className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h3 className="text-2xl font-bold text-white mb-6">
              {editingEntry ? 'Edit Entry' : 'New Journal Entry'}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 mb-2">Title (optional)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Give your entry a title..."
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">How are you feeling?</label>
                <input
                  type="text"
                  value={moodAtTime}
                  onChange={(e) => setMoodAtTime(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="Describe your current mood..."
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Your Thoughts</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  rows={8}
                  placeholder="Write freely... what's on your mind?"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Gratitude List (comma-separated)</label>
                <input
                  type="text"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition-colors"
                  placeholder="What are you grateful for today?"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleSubmit}
                  disabled={!content.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl py-3 font-bold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingEntry ? 'Update Entry' : 'Save Entry'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 bg-gray-700 text-white rounded-xl py-3 font-bold hover:bg-gray-600 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-6">
          {entries.length === 0 ? (
            <Card3D>
              <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-12 text-center">
                <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Start Your Journey</h3>
                <p className="text-gray-400">
                  Begin journaling to reflect on your thoughts and track your emotional growth.
                </p>
              </div>
            </Card3D>
          ) : (
            entries.map((entry) => (
              <Card3D key={entry.id} glowColor="rgba(168, 85, 247, 0.4)">
                <div className="bg-gray-800/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      {entry.title && (
                        <h3 className="text-xl font-bold text-white mb-2">{entry.title}</h3>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>
                          {new Date(entry.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                        {entry.mood_at_time && (
                          <span className="px-2 py-1 bg-purple-500/20 rounded-lg text-purple-300">
                            {entry.mood_at_time}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-300 whitespace-pre-wrap mb-4">{entry.content}</p>

                  {entry.gratitude_items.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-400 mb-2 font-semibold">Grateful for:</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.gratitude_items.map((item, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.updated_at !== entry.created_at && (
                    <p className="text-xs text-gray-500 mt-4">
                      Last edited: {new Date(entry.updated_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </Card3D>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
