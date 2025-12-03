// Central configuration for article reset time
// Change ONLY these values to update reset time across the app

export const RESET_HOUR: number = 8;   // 24-hour format (0-23)
export const RESET_MINUTE: number = 0; // Minutes (0-59)

// Helper to get display string
export function getResetTimeDisplay(): string {
  const hour = RESET_HOUR;
  const minute = RESET_MINUTE;
  
  if (hour >= 12) {
    const displayHour = hour === 12 ? 12 : hour - 12;
    return `${displayHour}:${String(minute).padStart(2, '0')} PM`;
  } else {
    const displayHour = hour === 0 ? 12 : hour;
    return `${displayHour}:${String(minute).padStart(2, '0')} AM`;
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
