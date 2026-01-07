import { motion } from 'framer-motion';
import { Sparkles, Calendar, TrendingUp, Heart } from 'lucide-react';
import { useMood, Mood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';

interface WeeklyInsightsProps {
  weeklyLetter: string | null;
  moodStats: Record<Mood, number>;
  totalEntries: number;
}

const moodColors: Record<Mood, string> = {
  neutral: 'bg-slate-400',
  calm: 'bg-sky-400',
  anxious: 'bg-purple-400',
  happy: 'bg-amber-400',
  sad: 'bg-blue-400',
};

const moodLabels: Record<Mood, string> = {
  neutral: 'Neutral',
  calm: 'Calm',
  anxious: 'Anxious',
  happy: 'Happy',
  sad: 'Sad',
};

export const WeeklyInsights = ({ weeklyLetter, moodStats, totalEntries }: WeeklyInsightsProps) => {
  const { privacyMode } = useMood();

  const totalMoodEntries = Object.values(moodStats).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">This Week's Journey</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-muted/50">
            <p className="text-3xl font-bold text-foreground">{totalEntries}</p>
            <p className="text-sm text-muted-foreground">Journal Entries</p>
          </div>
          <div className="p-4 rounded-2xl bg-muted/50">
            <p className="text-3xl font-bold text-foreground">{totalMoodEntries}</p>
            <p className="text-sm text-muted-foreground">Reflections Made</p>
          </div>
        </div>

        {/* Mood Distribution */}
        {totalMoodEntries > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Mood Distribution</p>
            <div className="flex gap-1 h-4 rounded-full overflow-hidden">
              {(Object.keys(moodStats) as Mood[]).map((mood) => {
                const percentage = (moodStats[mood] / totalMoodEntries) * 100;
                if (percentage === 0) return null;
                return (
                  <motion.div
                    key={mood}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={cn(moodColors[mood])}
                    title={`${moodLabels[mood]}: ${Math.round(percentage)}%`}
                  />
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              {(Object.keys(moodStats) as Mood[]).map((mood) => {
                if (moodStats[mood] === 0) return null;
                return (
                  <div key={mood} className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", moodColors[mood])} />
                    <span className="text-xs text-muted-foreground">{moodLabels[mood]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Letter from Future Self */}
      {weeklyLetter ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">A Letter from Your Future Self</h3>
              <p className="text-sm text-muted-foreground">Based on your week's reflections</p>
            </div>
          </div>
          <div className={cn(
            "prose prose-slate max-w-none",
            privacyMode && "text-blur"
          )}>
            <p className="text-foreground/80 leading-relaxed italic whitespace-pre-line">
              {weeklyLetter}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-3xl p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <Calendar className="w-10 h-10 text-primary" />
          </motion.div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Your Weekly Wisdom Awaits</h3>
          <p className="text-muted-foreground">
            Continue journaling this week to receive a personalized letter from your future self.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};
