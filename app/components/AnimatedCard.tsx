'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
}

export default function AnimatedCard({ 
  children, 
  delay = 0,
  className = '',
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`card ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedButton({
  children,
  onClick,
  disabled,
  className = '',
  variant = 'primary',
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary';
}) {
  const baseClass = variant === 'primary' 
    ? 'bg-gradient-to-r from-base-blue to-base-blue-dark text-white'
    : 'bg-background-secondary text-foreground';

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${className} touch-target px-6 py-3 rounded-xl font-semibold focus-ring`}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  );
}

export function AnimatedListItem({
  children,
  index = 0,
}: {
  children: ReactNode;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: 'easeOut',
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedNumber({
  value,
  decimals = 2,
}: {
  value: number;
  decimals?: number;
}) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      {value.toFixed(decimals)}
    </motion.span>
  );
}

export function PulseAnimation({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        ease: "easeInOut",
        repeat: Infinity,
      }}
    >
      {children}
    </motion.div>
  );
}