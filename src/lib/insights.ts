function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1]! + sorted[middle]!) / 2)
    : sorted[middle]!;
}

export function buildInsightsSummary({
  cyclePoints,
  periodPoints,
  moodPoints,
  symptomTop,
}: {
  cyclePoints: Array<{ date: string; length: number }>;
  periodPoints: Array<{ date: string; length: number }>;
  moodPoints: Array<{ date: string; mood: number }>;
  symptomTop: Array<{ label: string; count: number }>;
}) {
  const cycleLengths = cyclePoints.map((point) => point.length);
  const periodLengths = periodPoints.map((point) => point.length);
  const moods = moodPoints.map((point) => point.mood);
  const cycleSpread =
    cycleLengths.length > 1 ? Math.max(...cycleLengths) - Math.min(...cycleLengths) : 0;

  return {
    typicalCycle: cycleLengths.length > 0 ? `${median(cycleLengths)} days` : "Not enough data",
    typicalPeriod: periodLengths.length > 0 ? `${median(periodLengths)} days` : "Not enough data",
    variability: cycleSpread <= 2 ? "Low" : cycleSpread <= 5 ? "Moderate" : "High",
    averageMood:
      moods.length > 0
        ? `${(moods.reduce((sum, value) => sum + value, 0) / moods.length).toFixed(1)} / 5`
        : "Not enough data",
    highlight:
      symptomTop.length > 0
        ? `${symptomTop[0]!.label} appears most often in your recent logs.`
        : "Keep logging symptoms to unlock pattern highlights.",
  };
}
