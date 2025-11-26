'use client';

import { useState, useEffect } from 'react';

// Reset time config - change these values to update reset time
const RESET_HOUR = 8;   // 8 AM in 24-hour format
const RESET_MINUTE = 30; // Minutes

function getResetTimeDisplay(): string {
  if (RESET_HOUR >= 12) {
    const displayHour = RESET_HOUR === 12 ? 12 : RESET_HOUR - 12;
    return `${displayHour}:${String(RESET_MINUTE).padStart(2, '0')} PM`;
  } else {
    const displayHour = RESET_HOUR === 0 ? 12 : RESET_HOUR;
    return `${displayHour}:${String(RESET_MINUTE).padStart(2, '0')} AM`;
  }
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const target = new Date();
      
      // Set target to reset time today
      target.setHours(RESET_HOUR, RESET_MINUTE, 0, 0);
      
      // If it's already past reset time, set to reset time tomorrow
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
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] px-4 md:px-6 py-4 mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[var(--gold-accent)]">⏳</span>
        <p className="text-xs md:text-sm uppercase tracking-wider text-[var(--text-muted)] font-heading">
          Time until next article
        </p>
      </div>
      
      <div className="flex items-center gap-2 md:gap-3 font-title text-xl md:text-2xl font-bold">
        <div className="flex flex-col items-center">
          <span className="bg-gradient-to-b from-[var(--gold-accent)] to-[var(--gold-dark)] text-black px-3 md:px-4 py-1.5 md:py-2 min-w-[45px] md:min-w-[55px] text-center text-lg md:text-2xl">
            {formatNumber(timeLeft.hours)}
          </span>
          <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1">Hrs</span>
        </div>
        <span className="text-[var(--gold-accent)] text-lg md:text-xl">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-gradient-to-b from-[var(--gold-accent)] to-[var(--gold-dark)] text-black px-3 md:px-4 py-1.5 md:py-2 min-w-[45px] md:min-w-[55px] text-center text-lg md:text-2xl">
            {formatNumber(timeLeft.minutes)}
          </span>
          <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1">Min</span>
        </div>
        <span className="text-[var(--gold-accent)] text-lg md:text-xl">:</span>
        <div className="flex flex-col items-center">
          <span className="bg-gradient-to-b from-[var(--gold-accent)] to-[var(--gold-dark)] text-black px-3 md:px-4 py-1.5 md:py-2 min-w-[45px] md:min-w-[55px] text-center text-lg md:text-2xl">
            {formatNumber(timeLeft.seconds)}
          </span>
          <span className="text-[8px] md:text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1">Sec</span>
        </div>
      </div>
      
      <p className="text-[10px] md:text-xs text-[var(--text-muted)] mt-3 flex items-center gap-2">
        <span className="text-[var(--gold-accent)]">☀</span>
        Resets daily at {getResetTimeDisplay()}
      </p>
    </div>
  );
}
