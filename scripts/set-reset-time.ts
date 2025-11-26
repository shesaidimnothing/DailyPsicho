#!/usr/bin/env node
/**
 * Script to set the article reset time for testing
 * 
 * Usage:
 *   npx tsx scripts/set-reset-time.ts 19:30
 *   npx tsx scripts/set-reset-time.ts 7:30 PM
 * 
 * This updates lib/reset-config.ts and components/CountdownTimer.tsx
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function parseTime(input: string): { hour: number; minute: number } | null {
  const cleaned = input.trim().toLowerCase();
  
  // Try 24-hour format: "19:30"
  let match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute };
    }
  }
  
  // Try 12-hour format: "7:30 PM" or "7:30PM"
  match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/);
  if (match) {
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3];
    
    if (period === 'pm' && hour !== 12) {
      hour += 12;
    } else if (period === 'am' && hour === 12) {
      hour = 0;
    }
    
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return { hour, minute };
    }
  }
  
  return null;
}

function getTimeDisplay(hour: number, minute: number): string {
  if (hour >= 12) {
    const displayHour = hour === 12 ? 12 : hour - 12;
    return `${displayHour}:${String(minute).padStart(2, '0')} PM`;
  } else {
    const displayHour = hour === 0 ? 12 : hour;
    return `${displayHour}:${String(minute).padStart(2, '0')} AM`;
  }
}

function updateResetConfig(hour: number, minute: number) {
  const filePath = join(process.cwd(), 'lib/reset-config.ts');
  
  const content = `// Central configuration for article reset time
// Change ONLY these values to update reset time across the app

export const RESET_HOUR = ${hour};   // 24-hour format (0-23)
export const RESET_MINUTE = ${minute}; // Minutes (0-59)

// Helper to get display string
export function getResetTimeDisplay(): string {
  const hour = RESET_HOUR;
  const minute = RESET_MINUTE;
  
  if (hour >= 12) {
    const displayHour = hour === 12 ? 12 : hour - 12;
    return \`\${displayHour}:\${String(minute).padStart(2, '0')} PM\`;
  } else {
    const displayHour = hour === 0 ? 12 : hour;
    return \`\${displayHour}:\${String(minute).padStart(2, '0')} AM\`;
  }
}

// Check if current time is past reset time
export function isPastResetTime(): boolean {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  return currentHour > RESET_HOUR || (currentHour === RESET_HOUR && currentMinute >= RESET_MINUTE);
}

// Check if a given time is before reset time
export function isBeforeResetTime(hour: number, minute: number): boolean {
  return hour < RESET_HOUR || (hour === RESET_HOUR && minute < RESET_MINUTE);
}
`;
  
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Updated lib/reset-config.ts`);
}

function updateCountdownTimer(hour: number, minute: number) {
  const filePath = join(process.cwd(), 'components/CountdownTimer.tsx');
  const timeDisplay = getTimeDisplay(hour, minute);
  
  const content = `'use client';

import { useState, useEffect } from 'react';

// Reset time config - change these values to update reset time
const RESET_HOUR = ${hour};   // ${hour >= 12 ? hour - 12 || 12 : hour || 12} ${hour >= 12 ? 'PM' : 'AM'} in 24-hour format
const RESET_MINUTE = ${minute}; // Minutes

function getResetTimeDisplay(): string {
  if (RESET_HOUR >= 12) {
    const displayHour = RESET_HOUR === 12 ? 12 : RESET_HOUR - 12;
    return \`\${displayHour}:\${String(RESET_MINUTE).padStart(2, '0')} PM\`;
  } else {
    const displayHour = RESET_HOUR === 0 ? 12 : RESET_HOUR;
    return \`\${displayHour}:\${String(RESET_MINUTE).padStart(2, '0')} AM\`;
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
`;
  
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Updated components/CountdownTimer.tsx`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('');
  console.log('📅 Reset Time Configuration Script');
  console.log('===================================');
  console.log('');
  console.log('Usage: npx tsx scripts/set-reset-time.ts <time>');
  console.log('');
  console.log('Examples:');
  console.log('  npx tsx scripts/set-reset-time.ts 19:30     # 7:30 PM');
  console.log('  npx tsx scripts/set-reset-time.ts 7:30 PM   # 7:30 PM');
  console.log('  npx tsx scripts/set-reset-time.ts 18:00     # 6:00 PM');
  console.log('  npx tsx scripts/set-reset-time.ts 6:00 AM   # 6:00 AM');
  console.log('');
  process.exit(1);
}

const timeInput = args.join(' ');
const parsed = parseTime(timeInput);

if (!parsed) {
  console.error(`❌ Invalid time format: "${timeInput}"`);
  console.log('');
  console.log('Valid formats:');
  console.log('  - 19:30 (24-hour)');
  console.log('  - 7:30 PM (12-hour)');
  console.log('  - 7:30 AM (12-hour)');
  process.exit(1);
}

const { hour, minute } = parsed;
const timeDisplay = getTimeDisplay(hour, minute);

console.log('');
console.log(`🕐 Setting reset time to ${timeDisplay} (${hour}:${String(minute).padStart(2, '0')})...`);
console.log('');

try {
  updateResetConfig(hour, minute);
  updateCountdownTimer(hour, minute);
  
  console.log('');
  console.log(`✅ Reset time set to ${timeDisplay}`);
  console.log('');
  console.log('📝 Restart your dev server for changes to take effect:');
  console.log('   Press Ctrl+C, then run: npm run dev');
  console.log('');
} catch (error: any) {
  console.error(`❌ Error: ${error.message}`);
  process.exit(1);
}
