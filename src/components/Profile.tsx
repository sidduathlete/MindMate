import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, BookOpen, Edit, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function Profile({ user, journalCount, setUser, onNavigate }: { user: any; journalCount: number; setUser: (user: any) => void; onNavigate: (view: string) => void; }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.user_metadata?.username || '');
  const [error, setError] = useState('');

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    setError('');

    // Update the public users table first
    const { error: publicError } = await supabase
      .from('users')
      .update({ username: newUsername })
      .eq('id', user.id);

    if (publicError) {
      setError(publicError.message);
      return;
    }

    // Then, update the auth user metadata
    const { data, error: authError } = await supabase.auth.updateUser({
      data: { username: newUsername },
    });

    if (authError) {
      setError(authError.message);
    } else if (data.user) {
      // Update the state in the app instantly
      setUser(data.user);
      setIsEditing(false);
    }
  };

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center text-white">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 relative">
      <button onClick={() => onNavigate('home')} className="absolute top-6 left-6 z-20 text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </button>
      <motion.div
        className="max-w-2xl mx-auto pt-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Your Profile</h2>
        
        <div className="bg-gray-800/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center border-2 border-blue-500 mb-4">
              <User className="w-12 h-12 text-blue-300" />
            </div>
            
            {!isEditing ? (
              <div className="flex items-center space-x-2">
                <h3 className="text-2xl font-bold text-white">
                  {user.user_metadata?.username || 'No username'}
                </h3>
                <button onClick={() => { setIsEditing(true); setNewUsername(user.user_metadata?.username || ''); }} className="text-gray-400 hover:text-white">
                  <Edit className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="w-full max-w-sm">
                <input 
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-2 text-white text-center text-xl focus:outline-none focus:border-blue-500"
                />
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                <div className="flex space-x-2 mt-4">
                  <button onClick={handleSaveUsername} className="flex-1 bg-green-600 text-white rounded-lg py-2 hover:bg-green-700 transition-colors">Save</button>
                  <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-600 text-white rounded-lg py-2 hover:bg-gray-700 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            <p className="text-md text-gray-400 mt-2 mb-6">{user.email}</p>

            <div className="w-full border-t border-gray-700 my-6"></div>

            <div className="flex items-center justify-center space-x-4 bg-gray-900/50 p-4 rounded-xl">
              <BookOpen className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-3xl font-bold text-white">{journalCount}</p>
                <p className="text-sm text-gray-400">Journal Entries</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
