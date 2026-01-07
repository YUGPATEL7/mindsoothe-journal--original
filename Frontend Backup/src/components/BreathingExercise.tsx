import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface BreathingExerciseProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale';

const phaseLabels: Record<BreathPhase, string> = {
  inhale: 'Breathe in...',
  hold: 'Hold...',
  exhale: 'Breathe out...',
};

const phaseDurations: Record<BreathPhase, number> = {
  inhale: 4000,
  hold: 2000,
  exhale: 4000,
};

export const BreathingExercise = ({ isOpen, onClose, isLoading = false }: BreathingExerciseProps) => {
  const [phase, setPhase] = useState<BreathPhase>('inhale');

  useEffect(() => {
    if (!isOpen) return;

    const cyclePhases = () => {
      const phases: BreathPhase[] = ['inhale', 'hold', 'exhale'];
      let currentIndex = 0;

      const runPhase = () => {
        setPhase(phases[currentIndex]);
        currentIndex = (currentIndex + 1) % phases.length;
      };

      runPhase();

      const intervals = [
        setTimeout(() => { setPhase('hold'); }, phaseDurations.inhale),
        setTimeout(() => { setPhase('exhale'); }, phaseDurations.inhale + phaseDurations.hold),
      ];

      const mainInterval = setInterval(() => {
        currentIndex = 0;
        runPhase();
        setTimeout(() => setPhase('hold'), phaseDurations.inhale);
        setTimeout(() => setPhase('exhale'), phaseDurations.inhale + phaseDurations.hold);
      }, phaseDurations.inhale + phaseDurations.hold + phaseDurations.exhale);

      return () => {
        intervals.forEach(clearTimeout);
        clearInterval(mainInterval);
      };
    };

    const cleanup = cyclePhases();
    return cleanup;
  }, [isOpen]);

  const getScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.5;
      case 'hold':
        return 1.5;
      case 'exhale':
        return 1;
      default:
        return 1;
    }
  };

  const getTransitionDuration = () => {
    return phaseDurations[phase] / 1000;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-xl"
        >
          {!isLoading && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onClick={onClose}
              className="absolute top-6 right-6 p-3 rounded-full glass-button"
            >
              <X className="w-6 h-6 text-foreground/70" />
            </motion.button>
          )}

          <div className="flex flex-col items-center gap-12">
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"
                animate={{ scale: getScale() * 1.2 }}
                transition={{ duration: getTransitionDuration(), ease: 'easeInOut' }}
                style={{ width: isLoading ? 120 : 200, height: isLoading ? 120 : 200 }}
              />
              
              {/* Main breathing circle */}
              <motion.div
                className="relative rounded-full bg-gradient-to-br from-primary/60 to-primary/30 backdrop-blur-sm border border-white/20"
                animate={{ scale: getScale() }}
                transition={{ duration: getTransitionDuration(), ease: 'easeInOut' }}
                style={{ width: isLoading ? 120 : 200, height: isLoading ? 120 : 200 }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent"
                  animate={{ opacity: phase === 'hold' ? 0.8 : 0.4 }}
                  transition={{ duration: 0.5 }}
                />
              </motion.div>
            </motion.div>

            <motion.p
              key={isLoading ? 'loading' : phase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-xl font-medium text-foreground/80 text-center"
            >
              {isLoading ? 'Breathe with me... I am reflecting on your words.' : phaseLabels[phase]}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
