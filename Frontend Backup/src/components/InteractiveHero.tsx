import { useState, useCallback, useEffect } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { ArrowDown, Sparkles, Heart, Shield, TrendingUp } from 'lucide-react';

interface InteractiveHeroProps {
  onStartJournal: () => void;
}

// Sentiment detection based on keywords
const detectSentiment = (text: string): { mood: string; color: string; emoji: string } => {
  const lowerText = text.toLowerCase();
  
  if (/happy|joy|excited|grateful|love|amazing|wonderful|great|blessed/.test(lowerText)) {
    return { mood: 'happy', color: 'hsl(40, 70%, 96%)', emoji: '☀️' };
  }
  if (/calm|peaceful|serene|relaxed|content|tranquil/.test(lowerText)) {
    return { mood: 'calm', color: 'hsl(145, 50%, 96%)', emoji: '🌿' };
  }
  if (/anxious|worried|stressed|nervous|overwhelmed|fear/.test(lowerText)) {
    return { mood: 'anxious', color: 'hsl(270, 50%, 97%)', emoji: '💜' };
  }
  if (/sad|lonely|depressed|down|hurt|cry|tired/.test(lowerText)) {
    return { mood: 'sad', color: 'hsl(200, 60%, 96%)', emoji: '💙' };
  }
  return { mood: 'neutral', color: 'hsl(145, 20%, 97%)', emoji: '' };
};

const stats = [
  { icon: Heart, value: '10K+', label: 'Users Journaling' },
  { icon: Shield, value: '100%', label: 'Private & Secure' },
  { icon: TrendingUp, value: '85%', label: 'Feel Better' },
];

export const InteractiveHero = ({ onStartJournal }: InteractiveHeroProps) => {
  const [inputText, setInputText] = useState('');
  const [sentiment, setSentiment] = useState({ mood: 'neutral', color: 'hsl(145, 20%, 97%)', emoji: '' });
  const [typingHint, setTypingHint] = useState('');
  
  // Typing hints
  const hints = ['happy', 'calm', 'anxious', 'grateful', 'stressed'];
  useEffect(() => {
    if (!inputText) {
      const interval = setInterval(() => {
        setTypingHint(hints[Math.floor(Math.random() * hints.length)]);
      }, 3000);
      return () => clearInterval(interval);
    } else {
      setTypingHint('');
    }
  }, [inputText]);
  
  // Magnetic button effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distX = (e.clientX - centerX) * 0.15;
    const distY = (e.clientY - centerY) * 0.15;
    mouseX.set(distX);
    mouseY.set(distY);
  }, [mouseX, mouseY]);

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);
    setSentiment(detectSentiment(text));
  };

  const handleSubmit = () => {
    onStartJournal();
  };

  return (
    <motion.section
      className="min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 relative hero-morph overflow-hidden"
      style={{ backgroundColor: sentiment.color }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Floating elements */}
      <motion.div
        className="absolute top-20 left-[10%] w-20 h-20 rounded-full bg-sage-accent/10 blur-2xl"
        animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-40 right-[15%] w-32 h-32 rounded-full bg-twilight-accent/10 blur-2xl"
        animate={{ y: [0, 20, 0], scale: [1, 0.9, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-32 left-[20%] w-24 h-24 rounded-full bg-sand-accent/10 blur-2xl"
        animate={{ x: [0, 30, 0], y: [0, -15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center max-w-3xl mx-auto z-10"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-white/60 mb-8"
        >
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-sage-accent" />
          </motion.div>
          <span className="text-sm font-medium text-foreground/80">Your AI Wellness Companion</span>
        </motion.div>

        <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          Nurture Your Mind,{' '}
          <span className="gradient-text">One Thought at a Time</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
          Transform your daily reflections into lasting emotional wellness with AI-powered insights, 
          mood tracking, and personalized growth tools.
        </p>

        {/* Interactive Input */}
        <div className="relative max-w-lg mx-auto mb-8">
          <motion.input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={`I feel${typingHint ? ` ${typingHint}` : '...'}`}
            className="w-full px-6 py-5 text-lg rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 focus:outline-none focus:ring-2 focus:ring-sage-accent/30 text-foreground placeholder:text-muted-foreground/60 transition-all duration-300"
            whileFocus={{ scale: 1.02 }}
          />
          <AnimatePresence>
            {sentiment.mood !== 'neutral' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10"
              >
                <span className="text-lg">{sentiment.emoji}</span>
                <span className="text-sm text-primary capitalize font-medium">{sentiment.mood}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Magnetic CTA Button */}
        <motion.button
          onClick={handleSubmit}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ x: springX, y: springY }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="magnetic-button inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow duration-300"
        >
          <span>Begin Your Journey</span>
          <motion.div
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ArrowDown className="w-5 h-5" />
          </motion.div>
        </motion.button>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-6 sm:gap-10 mt-12"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.1 }}
              className="flex items-center gap-2 text-muted-foreground"
            >
              <stat.icon className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{stat.value}</span>
              <span className="text-sm">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-foreground/20 flex items-start justify-center p-2 cursor-pointer hover:border-foreground/40 transition-colors"
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.9, behavior: 'smooth' })}
        >
          <motion.div
            animate={{ opacity: [0.2, 1, 0.2], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 rounded-full bg-foreground/40"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
};
