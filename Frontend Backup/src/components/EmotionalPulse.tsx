import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Calendar, Zap, Heart } from 'lucide-react';
import { Mood } from '@/contexts/MoodContext';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';

interface Entry {
  mood: Mood;
  createdAt: Date;
}

interface EmotionalPulseProps {
  entries: Entry[];
}

const moodValues: Record<Mood, number> = {
  happy: 5,
  calm: 4,
  neutral: 3,
  anxious: 2,
  sad: 1,
};

const moodColors: Record<Mood, string> = {
  happy: 'bg-mood-happy',
  calm: 'bg-mood-calm',
  neutral: 'bg-muted-foreground',
  anxious: 'bg-mood-anxious',
  sad: 'bg-mood-sad',
};

const moodEmojis: Record<Mood, string> = {
  happy: '☀️',
  calm: '🌿',
  neutral: '⚖️',
  anxious: '🌀',
  sad: '🌧️',
};

export const EmotionalPulse = ({ entries }: EmotionalPulseProps) => {
  const { privacyMode } = useMood();
  
  // Generate heatmap data for last 30 days
  const generateHeatmapData = () => {
    const data: { date: Date; mood: Mood | null; intensity: number }[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayEntries = entries.filter(e => {
        const entryDate = new Date(e.createdAt);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === date.getTime();
      });
      
      if (dayEntries.length > 0) {
        // Get dominant mood
        const moodCounts: Record<Mood, number> = { neutral: 0, calm: 0, anxious: 0, happy: 0, sad: 0 };
        dayEntries.forEach(e => moodCounts[e.mood]++);
        const dominantMood = (Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0]) as Mood;
        
        data.push({
          date,
          mood: dominantMood,
          intensity: Math.min(dayEntries.length / 3, 1),
        });
      } else {
        data.push({ date, mood: null, intensity: 0 });
      }
    }
    return data;
  };

  // Calculate trends
  const calculateTrends = () => {
    if (entries.length < 2) return { trend: 'neutral', percentage: 0, insight: '' };
    
    const thisWeek = entries.filter(e => 
      new Date(e.createdAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    );
    const lastWeek = entries.filter(e => {
      const time = new Date(e.createdAt).getTime();
      return time > Date.now() - 14 * 24 * 60 * 60 * 1000 && 
             time <= Date.now() - 7 * 24 * 60 * 60 * 1000;
    });

    if (thisWeek.length === 0 || lastWeek.length === 0) {
      return { trend: 'neutral', percentage: 0, insight: 'Keep journaling to see trends!' };
    }

    const thisWeekAvg = thisWeek.reduce((sum, e) => sum + moodValues[e.mood], 0) / thisWeek.length;
    const lastWeekAvg = lastWeek.reduce((sum, e) => sum + moodValues[e.mood], 0) / lastWeek.length;
    
    const change = ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100;
    
    let insight = '';
    if (change > 10) insight = "You're on a positive upswing! Keep nurturing yourself.";
    else if (change > 0) insight = "Slight improvement this week. Small steps matter.";
    else if (change > -10) insight = "Holding steady. That's resilience.";
    else insight = "Challenging week. Remember: storms always pass.";

    return {
      trend: change > 5 ? 'up' : change < -5 ? 'down' : 'neutral',
      percentage: Math.abs(Math.round(change)),
      insight,
    };
  };

  // Find patterns
  const findPatterns = () => {
    const dayStats: Record<number, { total: number; positive: number }> = {};
    
    entries.forEach(e => {
      const day = new Date(e.createdAt).getDay();
      if (!dayStats[day]) dayStats[day] = { total: 0, positive: 0 };
      dayStats[day].total++;
      if (moodValues[e.mood] >= 4) dayStats[day].positive++;
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let bestDay = { day: '', ratio: 0 };
    let challengingDay = { day: '', ratio: 1 };

    Object.entries(dayStats).forEach(([day, stats]) => {
      if (stats.total < 2) return;
      const ratio = stats.positive / stats.total;
      if (ratio > bestDay.ratio) bestDay = { day: days[parseInt(day)], ratio };
      if (ratio < challengingDay.ratio) challengingDay = { day: days[parseInt(day)], ratio };
    });

    return { bestDay: bestDay.day, challengingDay: challengingDay.day };
  };

  const heatmapData = generateHeatmapData();
  const trends = calculateTrends();
  const patterns = findPatterns();

  const TrendIcon = trends.trend === 'up' ? TrendingUp : trends.trend === 'down' ? TrendingDown : Minus;

  return (
    <div className="space-y-6">
      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bento-card bg-gradient-to-br from-twilight/30 to-twilight-accent/10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-twilight-accent/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-twilight-accent" />
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold text-foreground">30-Day Pulse</h3>
            <p className="text-xs text-muted-foreground">Your emotional journey at a glance</p>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="grid grid-cols-10 gap-1">
          {heatmapData.map((day, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className={cn(
                "aspect-square rounded-sm heatmap-cell cursor-pointer relative group",
                day.mood ? moodColors[day.mood] : 'bg-muted/30',
                privacyMode && day.mood && "opacity-20"
              )}
              style={{ opacity: day.mood ? 0.4 + day.intensity * 0.6 : 0.2 }}
              title={`${day.date.toLocaleDateString()}: ${day.mood || 'No entry'}`}
            >
              {day.mood && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-card/90 rounded-sm text-[8px] transition-opacity">
                  {moodEmojis[day.mood]}
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 justify-center text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            {[0.2, 0.4, 0.6, 0.8, 1].map((opacity) => (
              <div
                key={opacity}
                className="w-3 h-3 rounded-sm bg-sage-accent"
                style={{ opacity }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Trend Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bento-card bg-gradient-to-br from-sand/50 to-sand-accent/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-sand-accent" />
            <span className="text-sm font-medium text-foreground">This Week</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendIcon 
              className={cn(
                "w-6 h-6",
                trends.trend === 'up' && "text-sage-accent",
                trends.trend === 'down' && "text-coral-accent",
                trends.trend === 'neutral' && "text-muted-foreground"
              )} 
            />
            <span className="text-2xl font-bold text-foreground">
              {trends.percentage > 0 ? `${trends.percentage}%` : '—'}
            </span>
          </div>
          <p className={cn(
            "text-xs text-muted-foreground mt-2",
            privacyMode && "text-blur"
          )}>
            {trends.insight}
          </p>
        </motion.div>

        {/* Patterns Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bento-card bg-gradient-to-br from-coral/30 to-coral-accent/10"
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-4 h-4 text-coral-accent" />
            <span className="text-sm font-medium text-foreground">Patterns</span>
          </div>
          {patterns.bestDay ? (
            <div className={cn(privacyMode && "text-blur")}>
              <p className="text-sm text-foreground">
                Best day: <span className="font-semibold">{patterns.bestDay}</span>
              </p>
              {patterns.challengingDay && patterns.challengingDay !== patterns.bestDay && (
                <p className="text-xs text-muted-foreground mt-1">
                  Challenging: {patterns.challengingDay}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              More entries needed to detect patterns
            </p>
          )}
        </motion.div>
      </div>

      {/* Spotify-Wrapped Style Insight */}
      {entries.length >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bento-card bg-gradient-to-br from-lavender/40 to-lavender-accent/10 text-center p-8"
        >
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-4xl mb-4"
          >
            ✨
          </motion.div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            Your Emotional Superpower
          </h3>
          <p className={cn(
            "text-muted-foreground",
            privacyMode && "text-blur"
          )}>
            {entries.filter(e => e.mood === 'calm' || e.mood === 'happy').length > entries.length / 2
              ? "You cultivate positivity like a garden — nurturing calm and joy even in busy times."
              : "You face challenges head-on with courage. That takes real strength."
            }
          </p>
        </motion.div>
      )}
    </div>
  );
};
