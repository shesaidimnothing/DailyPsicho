'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      
      // Set target to 6 PM today
      target.setHours(18, 0, 0, 0);
      
      // If it's already past 6 PM, set to 6 PM tomorrow
      if (now >= target) {
        target.setDate(target.getDate() + 1);
      }
      
      const diff = target.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      return { hours, minutes, seconds };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!timeLeft) return null;

  const formatNumber = (n: number) => n.toString().padStart(2, '0');

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-[var(--bg-secondary)] border border-[var(--border-color)] px-6 py-5 mb-10"
    >
      {/* Greek corner decorations */}
      <span className="absolute top-2 left-2 text-[var(--gold-accent)] opacity-40">⌜</span>
      <span className="absolute top-2 right-2 text-[var(--gold-accent)] opacity-40">⌝</span>
      <span className="absolute bottom-2 left-2 text-[var(--gold-accent)] opacity-40">⌞</span>
      <span className="absolute bottom-2 right-2 text-[var(--gold-accent)] opacity-40">⌟</span>
      
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[var(--gold-accent)]">⏳</span>
        <p className="text-sm uppercase tracking-widest text-[var(--text-muted)] font-heading">
          Time remaining to read today&apos;s scroll
        </p>
      </div>
      
      <div className="flex items-center gap-3 font-title text-3xl font-bold">
        <div className="flex flex-col items-center">
          <span className="bg-gradient-to-b from-[var(--gold-accent)] to-[var(--gold-dark)] text-black px-4 py-2 min-w-[60px] text-center">
            {formatNumber(timeLeft.hours)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1">Hours</span>
        </div>
        <span className="text-[var(--gold-accent)] text-2xl mb-4">⋮</span>
        <div className="flex flex-col items-center">
          <span className="bg-gradient-to-b from-[var(--gold-accent)] to-[var(--gold-dark)] text-black px-4 py-2 min-w-[60px] text-center">
            {formatNumber(timeLeft.minutes)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1">Minutes</span>
        </div>
        <span className="text-[var(--gold-accent)] text-2xl mb-4">⋮</span>
        <div className="flex flex-col items-center">
          <span className="bg-gradient-to-b from-[var(--gold-accent)] to-[var(--gold-dark)] text-black px-4 py-2 min-w-[60px] text-center">
            {formatNumber(timeLeft.seconds)}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1">Seconds</span>
        </div>
      </div>
      
      <p className="text-xs text-[var(--text-muted)] mt-4 flex items-center gap-2">
        <span className="text-[var(--gold-accent)]">☀</span>
        New wisdom arrives daily at sunset (6:00 PM)
      </p>
    </motion.div>
  );
}
