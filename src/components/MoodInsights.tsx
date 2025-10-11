import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, Sparkles } from 'lucide-react';
import { MoodEntry } from '../lib/supabase';

interface MoodInsightsProps {
  entries: MoodEntry[];
}

export function MoodInsights({ entries }: MoodInsightsProps) {
  if (entries.length < 3) {
    return (
      <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Insights</h3>
        <p className="text-gray-400">Keep logging your mood to unlock personalized insights!</p>
      </div>
    );
  }

  const recentEntries = entries.slice(0, 7);
  const averageMood = recentEntries.reduce((sum, e) => sum + e.mood_score, 0) / recentEntries.length;
  const averageEnergy = recentEntries.reduce((sum, e) => sum + e.energy_level, 0) / recentEntries.length;
  const averageStress = recentEntries.reduce((sum, e) => sum + e.stress_level, 0) / recentEntries.length;

  const trend = recentEntries.length >= 2
    ? recentEntries[0].mood_score - recentEntries[1].mood_score
    : 0;

  const allTriggers = recentEntries.flatMap(e => e.triggers);
  const triggerCounts: Record<string, number> = {};
  allTriggers.forEach(trigger => {
    triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
  });

  const topTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const insights = [];

  if (trend > 2) {
    insights.push({
      icon: TrendingUp,
      color: 'text-teal-400',
      bg: 'bg-teal-500/20',
      border: 'border-teal-500/30',
      title: 'Mood Improving',
      text: `Your mood has increased by ${trend} points recently. Keep up the positive momentum!`
    });
  } else if (trend < -2) {
    insights.push({
      icon: TrendingDown,
      color: 'text-orange-400',
      bg: 'bg-orange-500/20',
      border: 'border-orange-500/30',
      title: 'Mood Declining',
      text: `Your mood has decreased by ${Math.abs(trend)} points. Consider reaching out for support or trying relaxation techniques.`
    });
  }

  if (averageEnergy < 4 && averageStress > 6) {
    insights.push({
      icon: AlertCircle,
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      title: 'High Stress, Low Energy',
      text: 'You might be experiencing burnout. Prioritize rest, self-care, and consider talking to someone.'
    });
  }

  if (averageMood >= 7 && averageEnergy >= 7) {
    insights.push({
      icon: Sparkles,
      color: 'text-teal-400',
      bg: 'bg-teal-500/20',
      border: 'border-teal-500/30',
      title: 'Thriving!',
      text: 'Your mood and energy levels are great! This is a perfect time to work on your goals.'
    });
  }

  if (topTriggers.length > 0) {
    insights.push({
      icon: AlertCircle,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/20',
      border: 'border-cyan-500/30',
      title: 'Common Triggers',
      text: `Your most frequent triggers are: ${topTriggers.map(([trigger, count]) => `${trigger} (${count}x)`).join(', ')}. Consider strategies to manage these.`
    });
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Personalized Insights</h3>

      {insights.length === 0 ? (
        <p className="text-gray-400">Continue tracking to receive insights about your mental wellness patterns.</p>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <motion.div
              key={index}
              className={`${insight.bg} border ${insight.border} rounded-xl p-4`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start space-x-3">
                <insight.icon className={`w-6 h-6 ${insight.color} flex-shrink-0 mt-0.5`} />
                <div>
                  <h4 className={`font-bold ${insight.color} mb-1`}>{insight.title}</h4>
                  <p className="text-gray-300 text-sm">{insight.text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs mb-1">Avg Mood</p>
          <p className="text-xl font-bold text-white">{averageMood.toFixed(1)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs mb-1">Avg Energy</p>
          <p className="text-xl font-bold text-white">{averageEnergy.toFixed(1)}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs mb-1">Avg Stress</p>
          <p className="text-xl font-bold text-white">{averageStress.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}
