import { motion } from 'framer-motion';
import { Brain, Palette, Lock, Wind, BarChart3, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Perspective Shift',
    description: 'CBT-powered reframing turns negative thoughts into balanced, compassionate insights.',
    color: 'from-sage-accent/20 to-sage/40',
    size: 'large',
    demo: (
      <div className="mt-4 space-y-2">
        <div className="text-xs text-muted-foreground line-through opacity-50">
          "I'm such a failure..."
        </div>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-foreground bg-white/50 rounded-lg p-2"
        >
          "You're facing challenges, and that's part of growth..."
        </motion.div>
      </div>
    ),
  },
  {
    icon: Palette,
    title: 'Mood-to-Art Canvas',
    description: 'Watch your emotions transform into beautiful animated backgrounds.',
    color: 'from-twilight-accent/20 to-twilight/40',
    size: 'small',
    demo: (
      <div className="flex gap-2 mt-4">
        {['bg-mood-calm', 'bg-mood-happy', 'bg-mood-anxious'].map((color, i) => (
          <motion.div
            key={color}
            className={`w-8 h-8 rounded-full ${color}`}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
          />
        ))}
      </div>
    ),
  },
  {
    icon: Lock,
    title: 'Time Capsules',
    description: 'Lock entries for your future self to discover.',
    color: 'from-coral-accent/20 to-coral/40',
    size: 'small',
    demo: (
      <motion.div
        className="mt-4 text-2xl"
        animate={{ rotate: [0, -10, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      >
        🔐
      </motion.div>
    ),
  },
  {
    icon: Wind,
    title: 'Breathing Anchor',
    description: 'Guided breathing exercises to center yourself before and after journaling.',
    color: 'from-lavender-accent/20 to-lavender/40',
    size: 'medium',
    demo: (
      <motion.div
        className="mt-4 w-12 h-12 rounded-full bg-lavender-accent/30 mx-auto"
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    ),
  },
  {
    icon: BarChart3,
    title: 'Emotional Pulse',
    description: 'Heatmaps and trend analysis reveal patterns in your emotional journey.',
    color: 'from-sand-accent/20 to-sand/40',
    size: 'medium',
    demo: (
      <div className="flex gap-1 mt-4 items-end h-12">
        {[3, 5, 4, 7, 6, 8, 5].map((h, i) => (
          <motion.div
            key={i}
            className="w-4 rounded-t bg-sand-accent/60"
            initial={{ height: 0 }}
            whileInView={{ height: h * 5 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          />
        ))}
      </div>
    ),
  },
  {
    icon: Sparkles,
    title: 'Zen Garden',
    description: 'Grow a digital garden with each journal entry. Different moods bloom different flowers.',
    color: 'from-sage-accent/20 to-sage/40',
    size: 'large',
    demo: (
      <div className="flex gap-2 mt-4 items-end justify-center">
        {['🌸', '🌻', '💜', '🌷'].map((flower, i) => (
          <motion.span
            key={i}
            className="text-2xl"
            initial={{ scale: 0, y: 20 }}
            whileInView={{ scale: 1, y: 0 }}
            transition={{ delay: i * 0.15, type: "spring", stiffness: 200 }}
          >
            {flower}
          </motion.span>
        ))}
      </div>
    ),
  },
];

export const BentoFeatures = () => {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Features That Heal
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Every tool is designed with your emotional wellness in mind
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-min">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`bento-card bg-gradient-to-br ${feature.color} ${
                feature.size === 'large' ? 'md:col-span-2 lg:col-span-1 lg:row-span-2' :
                feature.size === 'medium' ? 'md:col-span-1' : ''
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/50 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground">{feature.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
              {feature.demo}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
