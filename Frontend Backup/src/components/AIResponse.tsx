import { motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Heart, Sparkles, Check, Plus, RefreshCw } from 'lucide-react';
import { useMood, Mood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AIResponseData {
  mood: Mood;
  reflection: string;
  suggestions: string[];
}

interface AIResponseProps {
  response: AIResponseData | null;
  onNewEntry: () => void;
}

const moodLabels: Record<Mood, { label: string; emoji: string; color: string }> = {
  neutral: { label: 'Neutral', emoji: '😌', color: 'bg-muted' },
  calm: { label: 'Calm', emoji: '🌊', color: 'bg-mood-calm' },
  anxious: { label: 'Anxious', emoji: '💜', color: 'bg-mood-anxious' },
  happy: { label: 'Happy', emoji: '☀️', color: 'bg-mood-happy' },
  sad: { label: 'Sad', emoji: '💙', color: 'bg-mood-sad' },
};

export const AIResponse = ({ response, onNewEntry }: AIResponseProps) => {
  const { privacyMode } = useMood();
  const [completedSuggestions, setCompletedSuggestions] = useState<number[]>([]);

  if (!response) return null;

  const moodInfo = moodLabels[response.mood] || moodLabels.neutral;

  const toggleSuggestion = (index: number) => {
    setCompletedSuggestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl mx-auto space-y-6"
      >
        {/* Mood Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring' }}
          className="flex justify-center"
        >
          <motion.div 
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-card"
            whileHover={{ scale: 1.02 }}
          >
            <motion.span 
              className="text-2xl"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {moodInfo.emoji}
            </motion.span>
            <span className="font-medium text-foreground">I sense you're feeling {moodInfo.label.toLowerCase()}</span>
            <div className={cn("w-3 h-3 rounded-full", moodInfo.color)} />
          </motion.div>
        </motion.div>

        {/* Reflection Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card rounded-3xl p-6 sm:p-8 group"
        >
          <div className="flex items-center gap-3 mb-4">
            <motion.div 
              className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
              whileHover={{ rotate: 10 }}
            >
              <Heart className="w-5 h-5 text-primary" />
            </motion.div>
            <h3 className="text-lg font-semibold text-foreground">A Gentle Reflection</h3>
          </div>
          <motion.p 
            className={cn(
              "text-foreground/80 leading-relaxed text-lg",
              privacyMode && "text-blur"
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {response.reflection}
          </motion.p>
        </motion.div>

        {/* Suggestions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div 
                className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"
                whileHover={{ rotate: -10 }}
              >
                <Lightbulb className="w-5 h-5 text-primary" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground">Gentle Suggestions</h3>
            </div>
            {completedSuggestions.length > 0 && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full"
              >
                {completedSuggestions.length}/{response.suggestions.length} done
              </motion.span>
            )}
          </div>
          <ul className="space-y-3">
            <AnimatePresence>
              {response.suggestions.map((suggestion, index) => {
                const isCompleted = completedSuggestions.includes(index);
                return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    onClick={() => toggleSuggestion(index)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300",
                      isCompleted 
                        ? "bg-primary/10 line-through opacity-60" 
                        : "hover:bg-muted/50"
                    )}
                  >
                    <motion.div
                      initial={false}
                      animate={{ scale: isCompleted ? [1, 1.3, 1] : 1 }}
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                        isCompleted ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        <Sparkles className="w-3 h-3 text-muted-foreground" />
                      )}
                    </motion.div>
                    <span className={cn(
                      "text-foreground/80 flex-1",
                      privacyMode && "text-blur"
                    )}>
                      {suggestion}
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                onClick={onNewEntry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-medium shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-4 h-4" />
                <span>Write another entry</span>
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start a new journal entry</p>
            </TooltipContent>
          </Tooltip>
        </motion.div>
      </motion.div>
    </TooltipProvider>
  );
};
