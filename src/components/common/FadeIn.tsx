import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import React from 'react';

export default function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode, delay?: number, className?: string }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
