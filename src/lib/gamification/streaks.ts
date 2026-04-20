const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcDayValue(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / DAY_MS;
}

export function calculateStreakMetrics(logDates: Date[], today = new Date()) {
  const uniqueDays = [...new Set(logDates.map((logDate) => toUtcDayValue(new Date(logDate))))].sort(
    (a, b) => b - a
  );

  if (uniqueDays.length === 0) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalLogs: 0,
    };
  }

  let bestStreak = 1;
  let bestRun = 1;

  for (let index = 1; index < uniqueDays.length; index++) {
    if (uniqueDays[index - 1]! - uniqueDays[index]! === 1) {
      bestRun += 1;
      bestStreak = Math.max(bestStreak, bestRun);
    } else {
      bestRun = 1;
    }
  }

  const todayDay = toUtcDayValue(today);
  let currentStreak = 0;

  if (todayDay - uniqueDays[0]! <= 1) {
    currentStreak = 1;
    for (let index = 1; index < uniqueDays.length; index++) {
      if (uniqueDays[index - 1]! - uniqueDays[index]! === 1) {
        currentStreak += 1;
      } else {
        break;
      }
    }
  }

  return {
    currentStreak,
    bestStreak,
    totalLogs: uniqueDays.length,
  };
}
