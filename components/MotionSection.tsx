'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type MotionSectionProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

const MotionSection = ({ children, className, delay = 0 }: MotionSectionProps) => (
  <motion.section
    className={className}
    initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    transition={{ duration: 0.5, ease: 'easeOut', delay }}
  >
    {children}
  </motion.section>
);

export default MotionSection;
