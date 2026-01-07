import { motion } from 'framer-motion';
import { Mood } from '@/contexts/MoodContext';

interface ZenGardenProps {
  entries: { mood: Mood; createdAt: Date }[];
}

interface FlowerProps {
  mood: Mood;
  delay: number;
  position: { x: number; height: number };
}

const FlowerSVG = ({ mood, delay, position }: FlowerProps) => {
  const flowerColors: Record<Mood, { petals: string; center: string }> = {
    calm: { petals: '#7DD3FC', center: '#0EA5E9' },     // Sky blue
    happy: { petals: '#FCD34D', center: '#F59E0B' },    // Sunflower
    anxious: { petals: '#C4B5FD', center: '#8B5CF6' },  // Lavender
    sad: { petals: '#93C5FD', center: '#3B82F6' },      // Soft blue
    neutral: { petals: '#86EFAC', center: '#22C55E' },  // Green
  };

  const colors = flowerColors[mood];
  const stemHeight = position.height;

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: delay * 0.15 }}
      style={{ transform: `translateX(${position.x}px)` }}
    >
      {/* Stem */}
      <motion.line
        x1="0"
        y1="100"
        x2="0"
        y2={100 - stemHeight}
        stroke="hsl(145, 60%, 35%)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: delay * 0.15, duration: 0.6, ease: "easeOut" }}
      />

      {/* Leaves */}
      <motion.ellipse
        cx="-8"
        cy={100 - stemHeight * 0.4}
        rx="12"
        ry="6"
        fill="hsl(145, 55%, 45%)"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: -30 }}
        transition={{ delay: delay * 0.15 + 0.3, duration: 0.4 }}
        style={{ transformOrigin: 'center' }}
      />
      <motion.ellipse
        cx="8"
        cy={100 - stemHeight * 0.6}
        rx="12"
        ry="6"
        fill="hsl(145, 55%, 45%)"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: 30 }}
        transition={{ delay: delay * 0.15 + 0.4, duration: 0.4 }}
        style={{ transformOrigin: 'center' }}
      />

      {/* Flower petals */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay * 0.15 + 0.5, type: "spring", stiffness: 200 }}
        style={{ transformOrigin: `0px ${100 - stemHeight}px` }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
          <motion.ellipse
            key={angle}
            cx="0"
            cy={100 - stemHeight - 12}
            rx="8"
            ry="12"
            fill={colors.petals}
            style={{ 
              transformOrigin: `0px ${100 - stemHeight}px`,
              transform: `rotate(${angle}deg)`,
            }}
          />
        ))}
        <circle
          cx="0"
          cy={100 - stemHeight}
          r="8"
          fill={colors.center}
        />
      </motion.g>
    </motion.g>
  );
};

export const ZenGarden = ({ entries }: ZenGardenProps) => {
  // Get last 10 entries for the garden
  const recentEntries = entries.slice(0, 10);

  // Generate random but deterministic positions based on entry index
  const getPosition = (index: number) => ({
    x: 40 + index * 35 + (index % 2 === 0 ? 10 : -10),
    height: 35 + Math.sin(index * 1.5) * 15 + 20,
  });

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bento-card bg-gradient-to-br from-sage/30 to-sage-accent/10 p-6 text-center"
      >
        <div className="text-4xl mb-4">🌱</div>
        <h3 className="font-display text-lg font-semibold text-foreground mb-2">
          Your Garden Awaits
        </h3>
        <p className="text-sm text-muted-foreground">
          Each journal entry plants a seed. Start writing to grow your garden.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bento-card bg-gradient-to-br from-sage/30 to-sage-accent/10 p-4 overflow-hidden"
    >
      <h3 className="font-display text-lg font-semibold text-foreground mb-2">
        Your Zen Garden
      </h3>
      <p className="text-xs text-muted-foreground mb-4">
        {entries.length} {entries.length === 1 ? 'flower' : 'flowers'} blooming
      </p>

      {/* Garden SVG */}
      <div className="relative h-40 w-full">
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-plant-stem/20 to-transparent rounded-b-2xl" />
        
        <svg
          viewBox="0 0 400 110"
          className="w-full h-full"
          preserveAspectRatio="xMidYMax meet"
        >
          {recentEntries.map((entry, index) => (
            <FlowerSVG
              key={index}
              mood={entry.mood}
              delay={index}
              position={getPosition(index)}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-4 justify-center">
        {(['calm', 'happy', 'anxious', 'sad', 'neutral'] as Mood[]).map((mood) => {
          const count = entries.filter(e => e.mood === mood).length;
          if (count === 0) return null;
          return (
            <div
              key={mood}
              className="flex items-center gap-1 text-xs text-muted-foreground"
            >
              <div className={`w-3 h-3 rounded-full bg-flower-${mood}`} />
              <span className="capitalize">{mood}: {count}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
