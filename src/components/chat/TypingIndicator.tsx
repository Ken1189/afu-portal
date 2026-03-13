'use client';

import { motion } from 'framer-motion';
import { Sprout } from 'lucide-react';

const dotVariants = {
  initial: { y: 0 },
  animate: { y: -6 },
};

const dotTransition = (delay: number) => ({
  duration: 0.4,
  repeat: Infinity,
  repeatType: 'reverse' as const,
  ease: 'easeInOut' as const,
  delay,
});

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex gap-2.5 my-3 justify-start"
    >
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-teal flex items-center justify-center mt-1">
        <Sprout className="w-4 h-4 text-white" />
      </div>

      {/* Typing Dots */}
      <div className="bg-teal-light rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={dotTransition(i * 0.15)}
            className="block w-2 h-2 rounded-full bg-teal"
          />
        ))}
      </div>
    </motion.div>
  );
}
