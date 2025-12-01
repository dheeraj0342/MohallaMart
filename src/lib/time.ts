/**
 * Time utility functions for ETA calculations
 */

/**
 * Check if the current time (or provided time) falls within peak hours
 * Peak hours: 7-10 AM and 6-10 PM (18-22)
 * @param now - Optional Date object, defaults to current time
 * @returns true if within peak hours, false otherwise
 */
export function isPeakHour(now: Date = new Date()): boolean {
  const hour = now.getHours();
  // Peak hours: 7-10 AM and 6-10 PM (18-22)
  return (hour >= 7 && hour <= 10) || (hour >= 18 && hour <= 22);
}

