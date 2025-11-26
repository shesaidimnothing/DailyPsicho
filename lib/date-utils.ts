// Date utilities for Daily Psicho
// Reset time is configured in lib/reset-config.ts

import { RESET_HOUR, RESET_MINUTE, isPastResetTime } from './reset-config';

/**
 * Get the current "article date" based on reset time.
 * Before reset time = yesterday's date
 * After reset time = today's date
 */
export function getArticleDate(): string {
  const now = new Date();
  
  if (!isPastResetTime()) {
    // Before reset time, use yesterday's date
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
  }
  
  // After reset time, use today's date
  return formatDate(now);
}

/**
 * Format a date as YYYY-MM-DD in local timezone
 */
export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get seconds until next reset
 */
export function getSecondsUntilReset(): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(RESET_HOUR, RESET_MINUTE, 0, 0);
  
  // If past reset time, target is tomorrow
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }
  
  return Math.floor((target.getTime() - now.getTime()) / 1000);
}

/**
 * Get archive dates (last N days based on reset time)
 */
export function getArchiveDates(days: number): string[] {
  const dates: string[] = [];
  const currentArticleDate = getArticleDate();
  
  for (let i = 0; i < days; i++) {
    const date = new Date(currentArticleDate);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  
  return dates;
}
