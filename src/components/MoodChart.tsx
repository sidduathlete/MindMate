import { motion } from 'framer-motion';
import { MoodEntry } from '../lib/supabase';

interface MoodChartProps {
  entries: MoodEntry[];
}

export function MoodChart({ entries }: MoodChartProps) {
  if (entries.length === 0) return null;

  const maxScore = 10;
  const chartData = entries.slice(0, 14).reverse();

  const getColor = (score: number) => {
    if (score >= 8) return '#4ade80';
    if (score >= 6) return '#14b8a6';
    if (score >= 4) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-6">Mood Trends (Last 14 Days)</h3>

      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between space-x-2">
          {chartData.map((entry, index) => {
            const height = (entry.mood_score / maxScore) * 100;
            const color = getColor(entry.mood_score);

            return (
              <motion.div
                key={entry.id}
                className="flex-1 relative group cursor-pointer"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <div
                  className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
                  style={{
                    backgroundColor: color,
                    height: '100%',
                    minHeight: '8px'
                  }}
                />

                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none z-10">
                  <div className="font-bold">{entry.mood_label}</div>
                  <div>{entry.mood_score}/10</div>
                  <div className="text-gray-400">
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500">
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-sm">Highest</p>
          <p className="text-2xl font-bold text-teal-400">
            {Math.max(...chartData.map(e => e.mood_score))}/10
          </p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3">
          <p className="text-gray-400 text-sm">Lowest</p>
          <p className="text-2xl font-bold text-orange-400">
            {Math.min(...chartData.map(e => e.mood_score))}/10
          </p>
        </div>
      </div>
    </div>
  );
}
