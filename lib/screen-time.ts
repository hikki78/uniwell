"use client";

// Screen time tracking utilities

let screenTimeStarted = false;
let screenTimeMinutes = 0;
let lastUpdated = Date.now();

/**
 * Updates the screen time and returns the formatted screen time string.
 */
export function updateScreenTime(): string {
  if (!screenTimeStarted) {
    screenTimeStarted = true;
    lastUpdated = Date.now();
    return "0h 0m";
  }
  
  const now = Date.now();
  const elapsedMinutes = Math.floor((now - lastUpdated) / (1000 * 60));
  
  screenTimeMinutes += elapsedMinutes;
  lastUpdated = now;
  
  return formatScreenTime(screenTimeMinutes);
}

/**
 * Gets the current screen time without updating it.
 */
export function getScreenTime(): string {
  return formatScreenTime(screenTimeMinutes);
}

/**
 * Formats minutes into hours and minutes string.
 */
function formatScreenTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours}h ${mins}m`;
}

/**
 * Resets the screen time tracking.
 */
export function resetScreenTime(): void {
  screenTimeMinutes = 0;
  lastUpdated = Date.now();
}

// Add visibility change listener to track when the user switches tabs
if (typeof window !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    updateScreenTime();
  });
}
