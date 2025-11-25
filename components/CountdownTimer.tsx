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
      className="bg-foreground/5 border border-foreground/10 px-6 py-4 mb-8"
    >
      <p className="text-sm uppercase tracking-wider text-foreground/60 mb-2">
        Time remaining to read today&apos;s article
      </p>
      <div className="flex items-center gap-2 font-title text-2xl font-bold">
        <span className="bg-foreground text-background px-3 py-1">
          {formatNumber(timeLeft.hours)}
        </span>
        <span className="text-foreground/40">:</span>
        <span className="bg-foreground text-background px-3 py-1">
          {formatNumber(timeLeft.minutes)}
        </span>
        <span className="text-foreground/40">:</span>
        <span className="bg-foreground text-background px-3 py-1">
          {formatNumber(timeLeft.seconds)}
        </span>
      </div>
      <p className="text-xs text-foreground/50 mt-2">
        Resets daily at 6:00 PM
      </p>
    </motion.div>
  );
}

