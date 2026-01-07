import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronRight, BookOpen, Sparkles, Clock } from 'lucide-react';
import { useMood, Mood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, differenceInDays, format } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface JournalHistoryEntry {
  id: string;
  content: string;
  mood: Mood;
  reflection: string;
  suggestions: string[];
  createdAt: Date;
  unlockAt: Date | null;
}

interface HistoryListProps {
  entries: JournalHistoryEntry[];
  onSelectEntry: (entry: JournalHistoryEntry) => void;
}

const moodEmojis: Record<Mood, string> = {
  neutral: '😌',
  calm: '🌊',
  anxious: '💜',
  happy: '☀️',
  sad: '💙',
};

const moodColors: Record<Mood, string> = {
  neutral: 'bg-muted',
  calm: 'border-l-mood-calm',
  anxious: 'border-l-mood-anxious',
  happy: 'border-l-mood-happy',
  sad: 'border-l-mood-sad',
};

export const HistoryList = ({ entries, onSelectEntry }: HistoryListProps) => {
  const { privacyMode } = useMood();

  const isLocked = (entry: JournalHistoryEntry) => {
    if (!entry.unlockAt) return false;
    return new Date(entry.unlockAt) > new Date();
  };

  const getDaysUntilUnlock = (unlockAt: Date) => {
    return differenceInDays(new Date(unlockAt), new Date());
  };

  if (entries.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="glass-card rounded-3xl p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center"
          >
            <BookOpen className="w-10 h-10 text-primary" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">Start Your First Chapter</h3>
            <p className="text-muted-foreground mb-6">
              Your journal awaits. Begin your wellness journey by writing your first entry.
            </p>
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="w-6 h-6 text-primary mx-auto" />
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto space-y-3"
      >
        <AnimatePresence>
          {entries.map((entry, index) => {
            const locked = isLocked(entry);
            const daysRemaining = entry.unlockAt ? getDaysUntilUnlock(entry.unlockAt) : 0;

            return (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => !locked && onSelectEntry(entry)}
                disabled={locked}
                whileHover={!locked ? { scale: 1.01, x: 4 } : {}}
                whileTap={!locked ? { scale: 0.99 } : {}}
                className={cn(
                  "w-full glass-card rounded-2xl p-5 text-left transition-all duration-300 border-l-4",
                  moodColors[entry.mood],
                  locked
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:shadow-xl"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <motion.span 
                        className="text-xl"
                        whileHover={{ scale: 1.2, rotate: 10 }}
                      >
                        {moodEmojis[entry.mood]}
                      </motion.span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="text-sm text-muted-foreground flex items-center gap-1 cursor-help">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{format(new Date(entry.createdAt), 'PPpp')}</p>
                        </TooltipContent>
                      </Tooltip>
                      {locked && (
                        <motion.span 
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Lock className="w-3 h-3" />
                          Revealing in {daysRemaining} days
                        </motion.span>
                      )}
                    </div>
                    <p className={cn(
                      "text-foreground line-clamp-2",
                      privacyMode && "text-blur",
                      locked && "blur-sm select-none"
                    )}>
                      {entry.content}
                    </p>
                  </div>
                  <motion.div 
                    className="flex-shrink-0"
                    animate={locked ? {} : { x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    {locked ? (
                      <Lock className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </motion.div>
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </TooltipProvider>
  );
};
