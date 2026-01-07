import { motion } from 'framer-motion';
import { useMood, Mood } from '@/contexts/MoodContext';

const moodColors: Record<Mood, { blob1: string; blob2: string; blob3: string }> = {
  neutral: {
    blob1: 'rgb(99, 102, 241)',
    blob2: 'rgb(14, 165, 233)',
    blob3: 'rgb(168, 85, 247)',
  },
  calm: {
    blob1: 'rgb(14, 165, 233)',
    blob2: 'rgb(20, 184, 166)',
    blob3: 'rgb(125, 211, 252)',
  },
  anxious: {
    blob1: 'rgb(168, 85, 247)',
    blob2: 'rgb(196, 181, 253)',
    blob3: 'rgb(139, 92, 246)',
  },
  happy: {
    blob1: 'rgb(245, 158, 11)',
    blob2: 'rgb(249, 115, 22)',
    blob3: 'rgb(234, 179, 8)',
  },
  sad: {
    blob1: 'rgb(59, 130, 246)',
    blob2: 'rgb(37, 99, 235)',
    blob3: 'rgb(96, 165, 250)',
  },
};

export const AnimatedBlobs = () => {
  const { currentMood } = useMood();
  const colors = moodColors[currentMood];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20 mix-blend-multiply"
        style={{ top: '-10%', left: '-10%' }}
        animate={{
          backgroundColor: colors.blob1,
          x: [0, 30, -20, 20, 0],
          y: [0, -30, 20, 40, 0],
          scale: [1, 1.1, 0.9, 1.05, 1],
        }}
        transition={{
          backgroundColor: { duration: 1, ease: 'easeInOut' },
          x: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 25, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 15, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-3xl opacity-20 mix-blend-multiply"
        style={{ top: '50%', right: '-5%' }}
        animate={{
          backgroundColor: colors.blob2,
          x: [0, -40, 30, -10, 0],
          y: [0, 40, -20, 30, 0],
          scale: [1, 0.95, 1.1, 0.98, 1],
        }}
        transition={{
          backgroundColor: { duration: 1, ease: 'easeInOut' },
          x: { duration: 22, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-3xl opacity-20 mix-blend-multiply"
        style={{ bottom: '-5%', left: '30%' }}
        animate={{
          backgroundColor: colors.blob3,
          x: [0, 50, -30, 20, 0],
          y: [0, -20, 40, -30, 0],
          scale: [1, 1.08, 0.92, 1.03, 1],
        }}
        transition={{
          backgroundColor: { duration: 1, ease: 'easeInOut' },
          x: { duration: 25, repeat: Infinity, ease: 'easeInOut' },
          y: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
          scale: { duration: 18, repeat: Infinity, ease: 'easeInOut' },
        }}
      />
    </div>
  );
};
