import { motion } from 'framer-motion';
import { Wind } from 'lucide-react';

interface ZenButtonProps {
  onClick: () => void;
}

export const ZenButton = ({ onClick }: ZenButtonProps) => {
  return (
    <motion.button
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, type: 'spring' }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center"
      title="Take a breathing break"
    >
      <motion.div
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <Wind className="w-6 h-6" />
      </motion.div>
    </motion.button>
  );
};
