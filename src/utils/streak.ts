const DAY_MS = 24 * 60 * 60 * 1000;

/** Consecutive calendar days (ending today or yesterday) with at least one session. */
export function computeDayStreak(sessionTimestamps: number[]): number {
  if (sessionTimestamps.length === 0) return 0;

  const days = new Set(sessionTimestamps.map((ts) => Math.floor(ts / DAY_MS)));
  const today = Math.floor(Date.now() / DAY_MS);

  // Streak must include today or yesterday to count as active.
  if (!days.has(today) && !days.has(today - 1)) return 0;

  let streak = 0;
  let cursor = days.has(today) ? today : today - 1;

  while (days.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }

  return streak;
}
