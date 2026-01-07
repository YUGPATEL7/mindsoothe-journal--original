import { motion } from 'framer-motion';
import { Sparkles, Sun, Moon, Cloud, Star } from 'lucide-react';

interface WelcomeMessageProps {
  name: string;
}

const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

const greetings = {
  morning: {
    icon: Sun,
    messages: [
      "Rise and shine, {name}! ☀️ Ready to pour your thoughts into words?",
      "Good morning, {name}! 🌅 A fresh day, a fresh page awaits you.",
      "Hey {name}! 🌻 The morning breeze brings clarity—let's capture it.",
    ],
  },
  afternoon: {
    icon: Cloud,
    messages: [
      "Hey there, {name}! 🌤️ Taking a mindful break? Perfect timing.",
      "Good afternoon, {name}! ✨ Your thoughts deserve this moment.",
      "Welcome back, {name}! 🌿 Let's turn this afternoon into insight.",
    ],
  },
  evening: {
    icon: Moon,
    messages: [
      "Good evening, {name}! 🌙 Time to reflect on today's journey.",
      "Hey {name}! 🌅 The golden hour is perfect for journaling.",
      "Welcome, {name}! 🌺 Let's unwind with some thoughtful reflection.",
    ],
  },
  night: {
    icon: Star,
    messages: [
      "Hey night owl, {name}! 🦉 The quiet hours inspire the deepest thoughts.",
      "Still up, {name}? ✨ Perfect time for midnight musings.",
      "Hello {name}! 🌌 Let's capture those late-night reflections.",
    ],
  },
};

export const WelcomeMessage = ({ name }: WelcomeMessageProps) => {
  const timeOfDay = getTimeOfDay();
  const { icon: TimeIcon, messages } = greetings[timeOfDay];
  const displayName = name || 'Friend';
  const firstName = displayName.split(' ')[0];
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    .replace('{name}', firstName);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-primary/10 via-sage/10 to-twilight/10 border border-primary/20"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="p-2 rounded-xl bg-primary/20"
      >
        <TimeIcon className="w-5 h-5 text-primary" />
      </motion.div>
      
      <div className="flex-1">
        <motion.p 
          className="text-sm sm:text-base font-medium text-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {randomMessage}
        </motion.p>
      </div>
      
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-4 h-4 text-primary/60" />
      </motion.div>
    </motion.div>
  );
};
