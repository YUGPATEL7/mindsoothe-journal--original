import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, ToggleLeft, ToggleRight, Lock, Calendar, Keyboard, Info } from 'lucide-react';
import { useMood } from '@/contexts/MoodContext';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface JournalEntryProps {
  onSubmit: (content: string, lockDate: Date | null) => void;
  isProcessing: boolean;
}

const placeholders = [
  "What's on your heart today?",
  "How are you really feeling?",
  "Take a moment to express yourself...",
  "Write freely, this space is yours...",
  "What brought you joy today?",
  "What's been on your mind lately?",
];

export const JournalEntry = ({ onSubmit, isProcessing }: JournalEntryProps) => {
  const [content, setContent] = useState('');
  const [showLockOption, setShowLockOption] = useState(false);
  const [lockDate, setLockDate] = useState<string>('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const { kindFriendMode, setKindFriendMode } = useMood();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rotate placeholders
  useEffect(() => {
    if (!isFocused && !content) {
      const interval = setInterval(() => {
        setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isFocused, content]);

  const handleSubmit = () => {
    if (!content.trim() || isProcessing) return;
    const parsedLockDate = lockDate ? new Date(lockDate) : null;
    onSubmit(content, parsedLockDate);
    setContent('');
    setLockDate('');
    setShowLockOption(false);
  };

  // Keyboard shortcut: Cmd/Ctrl + Enter to submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <TooltipProvider delayDuration={300}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className={cn(
          "glass-card rounded-3xl p-6 sm:p-8 transition-all duration-300",
          isFocused && "ring-2 ring-primary/20 shadow-xl"
        )}>
          {/* Kind Friend Toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: kindFriendMode ? [0, -10, 10, 0] : 0 }}
                transition={{ duration: 0.5 }}
              >
                <Sparkles className={cn("w-5 h-5 transition-colors", kindFriendMode ? "text-primary" : "text-muted-foreground")} />
              </motion.div>
              <span className="text-sm font-medium text-foreground">Kind Friend Mode</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[200px]">
                  <p>Get a compassionate third-person perspective on your thoughts</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <motion.button
              onClick={() => setKindFriendMode(!kindFriendMode)}
              whileTap={{ scale: 0.9 }}
              className="flex items-center gap-2"
            >
              <motion.div
                initial={false}
                animate={{ scale: kindFriendMode ? [1, 1.2, 1] : 1 }}
                transition={{ duration: 0.3 }}
              >
                {kindFriendMode ? (
                  <ToggleRight className="w-8 h-8 text-primary" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-muted-foreground" />
                )}
              </motion.div>
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {kindFriendMode && (
              <motion.p
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                className="text-sm text-muted-foreground mb-4 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10"
              >
                ✨ Your entry will be reframed from the perspective of a compassionate friend, helping you see your situation with fresh eyes.
              </motion.p>
            )}
          </AnimatePresence>

          {/* Text Area */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              placeholder={placeholders[placeholderIndex]}
              className="w-full h-48 sm:h-64 p-4 bg-transparent text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none text-lg leading-relaxed transition-all"
              disabled={isProcessing}
            />
            
            {/* Stats footer */}
            <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between text-xs text-muted-foreground/50">
              <div className="flex gap-3">
                <span>{charCount} chars</span>
                <span>{wordCount} words</span>
              </div>
              <div className="flex items-center gap-1 opacity-50">
                <Keyboard className="w-3 h-3" />
                <span className="hidden sm:inline">⌘+Enter to submit</span>
              </div>
            </div>
          </div>

          {/* Time Capsule Option */}
          <div className="border-t border-border/50 pt-4 mt-2">
            <motion.button
              onClick={() => setShowLockOption(!showLockOption)}
              whileHover={{ x: 4 }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              <motion.div animate={{ rotate: showLockOption ? 45 : 0 }}>
                <Lock className="w-4 h-4 group-hover:text-primary transition-colors" />
              </motion.div>
              <span>Create a time capsule?</span>
            </motion.button>

            <AnimatePresence>
              {showLockOption && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  className="mt-3 flex items-center gap-3 flex-wrap"
                >
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={lockDate}
                    onChange={(e) => setLockDate(e.target.value)}
                    min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                    className="px-3 py-2 rounded-lg bg-muted/50 text-sm text-foreground border border-border/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  <span className="text-xs text-muted-foreground">
                    Lock until this date
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-6">
            <motion.button
              onClick={handleSubmit}
              disabled={!content.trim() || isProcessing}
              whileHover={{ scale: content.trim() && !isProcessing ? 1.02 : 1 }}
              whileTap={{ scale: content.trim() && !isProcessing ? 0.98 : 1 }}
              className={cn(
                'flex items-center gap-3 px-6 py-3 rounded-2xl font-medium transition-all duration-300',
                content.trim() && !isProcessing
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              )}
            >
              <span>{isProcessing ? 'Reflecting...' : 'Share with me'}</span>
              <motion.div
                animate={{ x: content.trim() && !isProcessing ? [0, 4, 0] : 0 }}
                transition={{ duration: 1.5, repeat: content.trim() && !isProcessing ? Infinity : 0 }}
              >
                <Send className="w-4 h-4" />
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </TooltipProvider>
  );
};
