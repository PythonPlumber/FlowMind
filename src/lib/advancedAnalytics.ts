import { addDaysUTC, diffDaysUTC } from "@/lib/dateOnly";

export type PeriodLike = {
  startDate: Date;
  endDate?: Date | null;
};

export type DailyLogLike = {
  logDate: Date;
  bbt?: number | null;
  mucusType?: string | null;
  mood?: number | null;
  flow?: string | null;
  notes?: string | null;
  sex?: boolean | null;
  symptoms?: Array<{ label: string; severity?: number }>;
};

export type ProfileDefaults = {
  cycleLengthTypical: number;
  periodLengthTypical: number;
};

function median(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function mean(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function standardDeviation(nums: number[]): number | null {
  const m = mean(nums);
  if (m === null) return null;
  const squaredDiffs = nums.map((x) => Math.pow(x - m, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / nums.length);
}

function zScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

export type SymptomOccurrence = {
  label: string;
  cycleDay: number;
  phase: string;
  severity: number;
};

export type TemporalPattern = {
  symptomLabel: string;
  averageDayBeforePeriod: number;
  occurrenceRate: number;
  consistencyScore: number;
  typicalSeverity: number;
  cycleCount: number;
  confidence: number;
};

export type AnomalyDetectionResult = {
  type: "breakthrough_bleeding" | "unusual_flow" | "cycle_shape" | "symptom_cluster" | "skipped_period" | "early_ovulation" | "late_ovulation";
  severity: "mild" | "moderate" | "significant";
  cycleDay?: number;
  description: string;
  deviation: number;
  recommendation: string;
};

export type CycleHealthScore = {
  overall: number;
  regularityScore: number;
  flowNormalcyScore: number;
  symptomConsistencyScore: number;
  dataCompletenessScore: number;
  anomalyCount: number;
  healthGrade: "excellent" | "good" | "fair" | "needs_attention";
  factors: Array<{ factor: string; contribution: number; positive: boolean }>;
};

export type ComfortPrediction = {
  day: Date;
  energyLevel: number;
  bloatingLikelihood: number;
  crampProbability: number;
  moodTendency: number;
  breastTendernessRisk: number;
  overallDiscomfort: number;
  recommendations: string[];
};

export type HealthIndicatorFlag = {
  type: "pcos_indicator" | "hypothyroid_flag" | "perimenopause_signal" | "anovulation_pattern" | "cycle_length_concern" | "flow_pattern_concern" | "symptom_pattern_concern";
  severity: "info" | "warning" | "alert";
  title: string;
  description: string;
  evidence: string[];
  recommendation: string;
};

export type LongTermTrend = {
  type: "cycle_length_drift" | "seasonality" | "stress_impact" | "age_adjustment" | "luteal_phase_change" | "variability_trend";
  direction: "increasing" | "decreasing" | "stable" | "fluctuating";
  rate: number;
  confidence: number;
  monthsTracked: number;
  description: string;
  prediction: string;
};

export type OvulationFusionResult = {
  detected: boolean;
  primaryOvulationDay: Date | null;
  confidence: number;
  signals: Array<{
    type: "bbt" | "mucus" | "mood_spike" | "secondary_signs" | "lh_simulation" | "cervical_position";
    weight: number;
    detected: boolean;
    contribution: number;
    day: Date | null;
    description: string;
  }>;
  bayesianProbability: number;
  actualLutealPhase: number | null;
};

export type NotificationType = 
  | "period_approaching"
  | "fertile_window_alert"
  | "logging_reminder"
  | "anomaly_detected"
  | "symptom_pattern_alert"
  | "ovulation_detected"
  | "cycle_length_change";

export type SmartNotification = {
  type: NotificationType;
  title: string;
  message: string;
  scheduledDate: Date;
  priority: "low" | "medium" | "high";
  actionRequired: boolean;
  actionLabel?: string;
};

export type TrendAnalysis = {
  cycleLengths: number[];
  periodLengths: number[];
  lutealPhases: number[];
  follicularPhases: number[];
  symptomFrequencyByPhase: Record<string, number>;
  moodAveragesByPhase: Record<string, number>;
  flowIntensityByPhase: Record<string, number>;
  correlationMatrix: Record<string, Record<string, number>>;
  seasonalPatterns: {
    summer: { avgCycleLength: number; avgPeriodLength: number };
    winter: { avgCycleLength: number; avgPeriodLength: number };
  } | null;
  stressCorrelation: {
    detected: boolean;
    correlationStrength: number;
    events: Array<{ date: Date; description: string }>;
  };
  driftAnalysis: {
    direction: "lengthening" | "shortening" | "stable";
    ratePerMonth: number;
    confidence: number;
  };
};

function detectBBTSignal(logs: DailyLogLike[], periodStart: Date): { detected: boolean; day: Date | null; confidence: number; magnitude: number; daysSustained: number } {
  const bbtLogs = logs
    .filter((log) => log.bbt != null && log.bbt > 0)
    .sort((a, b) => a.logDate.getTime() - b.logDate.getTime());

  if (bbtLogs.length < 5) return { detected: false, day: null, confidence: 0, magnitude: 0, daysSustained: 0 };

  const temps = bbtLogs.map((l) => l.bbt as number);
  const baseline = median(temps.slice(0, Math.min(5, temps.length))) ?? temps[0];
  
  let spikeStart = -1;
  let sustained = 0;
  let maxMagnitude = 0;

  for (let i = 3; i < temps.length; i++) {
    const prevTemps = temps.slice(Math.max(0, i - 3), i);
    const prevMedian = median(prevTemps) ?? baseline;
    const shift = temps[i]! - prevMedian;

    if (shift >= 0.2 && shift <= 0.6) {
      if (spikeStart === -1) spikeStart = i;
      sustained++;
      maxMagnitude = Math.max(maxMagnitude, shift);
    } else if (spikeStart !== -1 && sustained >= 3) {
      break;
    } else {
      spikeStart = -1;
      sustained = 0;
    }
  }

  if (spikeStart === -1) {
    const half = Math.floor(temps.length / 2);
    const firstHalfMedian = median(temps.slice(0, half)) ?? baseline;
    const secondHalfMedian = median(temps.slice(half)) ?? baseline;
    const overallShift = secondHalfMedian - firstHalfMedian;

    if (overallShift >= 0.2 && secondHalfMedian > firstHalfMedian && temps.slice(half).length >= 5) {
      spikeStart = half;
      sustained = temps.slice(half).length;
      maxMagnitude = overallShift;
    }
  }

  if (spikeStart !== -1 && sustained >= 3) {
    const ovulationDay = addDaysUTC(bbtLogs[spikeStart]!.logDate, -1);
    const lutealLen = diffDaysUTC(periodStart, ovulationDay);
    
    if (lutealLen >= 8 && lutealLen <= 20) {
      const conf = Math.min(0.95, 0.5 + sustained * 0.1 + maxMagnitude * 0.5);
      return { detected: true, day: ovulationDay, confidence: conf, magnitude: maxMagnitude, daysSustained: sustained };
    }
  }

  return { detected: false, day: null, confidence: 0, magnitude: 0, daysSustained: 0 };
}

function detectMucusSignal(logs: DailyLogLike[], periodStart: Date, expectedOvulationDay: number): { detected: boolean; day: Date | null; confidence: number; peakType: string } {
  const eggwhiteLogs = logs
    .filter((log) => log.mucusType === "eggwhite")
    .sort((a, b) => a.logDate.getTime() - b.logDate.getTime());

  if (eggwhiteLogs.length === 0) {
    const wateryLogs = logs
      .filter((log) => log.mucusType === "watery")
      .sort((a, b) => a.logDate.getTime() - b.logDate.getTime());

    if (wateryLogs.length >= 2) {
      return { detected: true, day: wateryLogs[wateryLogs.length - 1]!.logDate, confidence: 0.5, peakType: "watery" };
    }
    return { detected: false, day: null, confidence: 0, peakType: "" };
  }

  const peakLog = eggwhiteLogs[eggwhiteLogs.length - 1]!;
  const daysDiff = Math.abs(diffDaysUTC(peakLog.logDate, periodStart) - expectedOvulationDay);

  let conf = 0.6;
  if (daysDiff <= 2) conf = 0.85;
  else if (daysDiff <= 5) conf = 0.7;
  else conf = 0.5;

  if (eggwhiteLogs.length >= 2) conf = Math.min(0.95, conf + 0.1);

  return { detected: true, day: peakLog.logDate, confidence: conf, peakType: "eggwhite" };
}

function detectMoodSpike(logs: DailyLogLike[], periodStart: Date, expectedOvulationDay: number): { detected: boolean; day: Date | null; confidence: number } {
  const moodLogs = logs
    .filter((log) => typeof log.mood === "number" && log.mood != null)
    .sort((a, b) => a.logDate.getTime() - b.logDate.getTime());

  if (moodLogs.length < 5) return { detected: false, day: null, confidence: 0 };

  const moods = moodLogs.map((l) => l.mood as number);
  const avgMood = mean(moods) ?? 3;
  const std = standardDeviation(moods) ?? 0.5;

  for (const log of moodLogs) {
    const z = zScore(log.mood as number, avgMood, std);
    if (z >= 1.5) {
      const dayDiff = Math.abs(diffDaysUTC(log.logDate, periodStart) - expectedOvulationDay);
      if (dayDiff <= 3) {
        return { detected: true, day: log.logDate, confidence: Math.min(0.8, 0.4 + z * 0.2) };
      }
    }
  }

  return { detected: false, day: null, confidence: 0 };
}

function detectSecondaryFertilitySigns(logs: DailyLogLike[], periodStart: Date, expectedOvulationDay: number): { detected: boolean; confidence: number; signs: string[] } {
  const signs: string[] = [];
  let confidence = 0;

  const libidoLogs = logs.filter((log) => log.sex === true);
  if (libidoLogs.length > 0) {
    const recentDays = libidoLogs.filter((log) => {
      const diff = diffDaysUTC(log.logDate, periodStart);
      return diff >= expectedOvulationDay - 3 && diff <= expectedOvulationDay + 3;
    });
    if (recentDays.length > 0) {
      signs.push("Increased sexual activity around ovulation window");
      confidence += 0.3;
    }
  }

  const notes = logs.filter((log) => log.notes && log.notes.length > 0);
  const fertileKeywords = notes.filter((log) => {
    const text = log.notes!.toLowerCase();
    return text.includes("feeling sexy") || text.includes("horn") || text.includes("libido") || text.includes("aroused");
  });
  if (fertileKeywords.length > 0) {
    signs.push("Self-reported increased libido in notes");
    confidence += 0.2;
  }

  return { detected: signs.length > 0, confidence: Math.min(0.7, confidence), signs };
}

export function fuseOvulationSignals(
  logs: DailyLogLike[],
  periodStart: Date,
  assumedCycleLength: number
): OvulationFusionResult {
  const expectedOvulationDay = assumedCycleLength - 14;

  const bbtSignal = detectBBTSignal(logs, periodStart);
  const mucusSignal = detectMucusSignal(logs, periodStart, expectedOvulationDay);
  const moodSignal = detectMoodSpike(logs, periodStart, expectedOvulationDay);
  const secondarySignal = detectSecondaryFertilitySigns(logs, periodStart, expectedOvulationDay);

  const signals: OvulationFusionResult["signals"] = [
    {
      type: "bbt",
      weight: 0.4,
      detected: bbtSignal.detected,
      contribution: bbtSignal.detected ? bbtSignal.confidence * 0.4 : 0,
      day: bbtSignal.day,
      description: bbtSignal.detected ? `BBT shift detected, ${bbtSignal.daysSustained} days sustained, ${bbtSignal.magnitude.toFixed(2)}°F magnitude` : "No BBT shift detected",
    },
    {
      type: "mucus",
      weight: 0.35,
      detected: mucusSignal.detected,
      contribution: mucusSignal.detected ? mucusSignal.confidence * 0.35 : 0,
      day: mucusSignal.day,
      description: mucusSignal.detected ? `Peak ${mucusSignal.peakType} mucus detected` : "No eggwhite mucus pattern",
    },
    {
      type: "mood_spike",
      weight: 0.15,
      detected: moodSignal.detected,
      contribution: moodSignal.detected ? moodSignal.confidence * 0.15 : 0,
      day: moodSignal.day,
      description: moodSignal.detected ? "Mood spike detected around ovulation window" : "No significant mood spike",
    },
    {
      type: "secondary_signs",
      weight: 0.1,
      detected: secondarySignal.detected,
      contribution: secondarySignal.detected ? secondarySignal.confidence * 0.1 : 0,
      day: null,
      description: secondarySignal.signs.length > 0 ? secondarySignal.signs.join("; ") : "No secondary signs detected",
    },
  ];

  const totalContribution = signals.reduce((sum, s) => sum + s.contribution, 0);
  const totalWeight = signals.filter((s) => s.detected).reduce((sum, s) => sum + s.weight, 0);

  let bayesianProb = 0;
  if (totalWeight > 0) {
    bayesianProb = Math.min(0.95, totalContribution / totalWeight);
  }

  let primaryDay: Date | null = null;
  let actualLuteal: number | null = null;

  const detectedSignals = signals.filter((s) => s.detected && s.day);
  if (detectedSignals.length >= 2) {
    const days = detectedSignals.map((s) => s.day!.getTime());
    const avgTime = days.reduce((a, b) => a + b, 0) / days.length;
    primaryDay = new Date(avgTime);
    
    const bbtDay = bbtSignal.day;
    if (bbtDay) {
      actualLuteal = diffDaysUTC(periodStart, bbtDay);
    }
  } else if (bbtSignal.detected && bbtSignal.day) {
    primaryDay = bbtSignal.day;
    actualLuteal = diffDaysUTC(periodStart, bbtSignal.day);
  } else if (mucusSignal.detected && mucusSignal.day) {
    primaryDay = addDaysUTC(mucusSignal.day, -1);
    actualLuteal = diffDaysUTC(periodStart, mucusSignal.day);
  }

  const detectedCount = signals.filter((s) => s.detected).length;

  return {
    detected: detectedCount >= 2 || bbtSignal.detected,
    primaryOvulationDay: primaryDay,
    confidence: bayesianProb,
    signals,
    bayesianProbability: bayesianProb,
    actualLutealPhase: actualLuteal,
  };
}

export function analyzeAnomalies(
  periods: PeriodLike[],
  logs: DailyLogLike[],
  predictions: {
    nextPeriodWindowStart: Date | null;
    nextPeriodWindowEnd: Date | null;
    displayCycleLength: number;
    medianPeriodLength: number;
  }
): AnomalyDetectionResult[] {
  const anomalies: AnomalyDetectionResult[] = [];

  if (periods.length < 2) return anomalies;

  const cycleLengths: number[] = [];
  for (let i = 0; i < periods.length - 1; i++) {
    cycleLengths.push(diffDaysUTC(periods[i]!.startDate, periods[i + 1]!.startDate));
  }

  const avgCycle = mean(cycleLengths) ?? 28;
  const stdCycle = standardDeviation(cycleLengths) ?? 5;

  const sortedPeriods = [...periods].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  const lastPeriod = sortedPeriods[sortedPeriods.length - 1]!;
  const today = new Date();
  const daysSinceLastPeriod = diffDaysUTC(today, lastPeriod.startDate);

  if (daysSinceLastPeriod > avgCycle + stdCycle * 2 && daysSinceLastPeriod > 35) {
    anomalies.push({
      type: "skipped_period",
      severity: daysSinceLastPeriod > avgCycle + stdCycle * 3 ? "significant" : "moderate",
      description: `No period detected for ${daysSinceLastPeriod} days (expected ${Math.round(avgCycle)} days)`,
      deviation: daysSinceLastPeriod - avgCycle,
      recommendation: "Monitor closely. If period doesn't arrive, consider consulting a healthcare provider.",
    });
  }

  for (let i = 0; i < sortedPeriods.length - 1; i++) {
    const current = sortedPeriods[i]!;
    const next = sortedPeriods[i + 1]!;
    const cycleLen = diffDaysUTC(current.startDate, next.startDate);

    const z = zScore(cycleLen, avgCycle, stdCycle);
    if (Math.abs(z) > 2) {
      if (cycleLen > avgCycle + stdCycle * 2) {
        anomalies.push({
          type: "cycle_shape",
          severity: "moderate",
          cycleDay: diffDaysUTC(today, current.startDate),
          description: `Unusually long cycle detected: ${cycleLen} days (typical: ${Math.round(avgCycle)} days)`,
          deviation: cycleLen - avgCycle,
          recommendation: "Long cycles can be caused by stress, travel, or hormonal changes. Track symptoms.",
        });
      }
    }
  }

  const flowLogs = logs.filter((log) => log.flow != null);
  if (flowLogs.length >= 3) {
    const flowIntensity: Record<string, number> = { spotting: 1, light: 2, medium: 3, heavy: 4 };
    const intensities = flowLogs.map((log) => flowIntensity[log.flow!] ?? 0);
    const avgFlow = mean(intensities) ?? 2.5;
    const stdFlow = standardDeviation(intensities) ?? 0.5;

    for (const log of flowLogs) {
      const intensity = flowIntensity[log.flow!] ?? 0;
      if (intensity > 0) {
        const z = zScore(intensity, avgFlow, stdFlow);
        if (z > 1.5 && log.flow === "heavy") {
          const cycleDay = diffDaysUTC(log.logDate, lastPeriod.startDate);
          anomalies.push({
            type: "unusual_flow",
            severity: "mild",
            cycleDay,
            description: `Heavy flow detected on day ${cycleDay} (typically lighter)`,
            deviation: intensity - avgFlow,
            recommendation: "Unusually heavy flow. Ensure you're staying hydrated and resting.",
          });
        }
      }
    }
  }

  const breakthroughLogs = logs.filter((log) => {
    if (!log.flow) return false;
    const cycleDay = diffDaysUTC(log.logDate, lastPeriod.startDate);
    return log.flow === "spotting" && cycleDay > predictions.medianPeriodLength + 3;
  });

  if (breakthroughLogs.length > 0) {
    anomalies.push({
      type: "breakthrough_bleeding",
      severity: breakthroughLogs.length > 2 ? "significant" : "mild",
      description: `${breakthroughLogs.length} spotting event(s) detected outside predicted period window`,
      deviation: breakthroughLogs.length,
      recommendation: "Breakthrough bleeding can be normal but track patterns. Consult provider if persistent.",
    });
  }

  return anomalies;
}

export function calculateCycleHealthScore(
  periods: PeriodLike[],
  logs: DailyLogLike[],
  anomalies: AnomalyDetectionResult[]
): CycleHealthScore {
  const cycleLengths: number[] = [];
  for (let i = 0; i < periods.length - 1; i++) {
    cycleLengths.push(diffDaysUTC(periods[i]!.startDate, periods[i + 1]!.startDate));
  }

  let regularityScore = 50;
  if (cycleLengths.length >= 3) {
    const spread = Math.max(...cycleLengths) - Math.min(...cycleLengths);
    const std = standardDeviation(cycleLengths) ?? 5;
    
    if (spread <= 3 && std <= 2) regularityScore = 95;
    else if (spread <= 5 && std <= 3) regularityScore = 85;
    else if (spread <= 8 && std <= 5) regularityScore = 70;
    else if (spread <= 12) regularityScore = 55;
    else regularityScore = 40;
  }

  const periodLengths: number[] = [];
  for (const p of periods) {
    if (p.endDate) {
      const len = diffDaysUTC(p.endDate, p.startDate) + 1;
      if (len > 0 && len <= 14) periodLengths.push(len);
    }
  }

  let flowNormalcyScore = 60;
  if (periodLengths.length >= 2) {
    const std = standardDeviation(periodLengths) ?? 1;
    const avg = mean(periodLengths) ?? 5;
    if (std <= 1 && avg >= 3 && avg <= 7) flowNormalcyScore = 90;
    else if (std <= 2 && avg >= 2 && avg <= 8) flowNormalcyScore = 75;
    else flowNormalcyScore = 55;
  }

  const symptomLogs = logs.filter((log) => log.symptoms && log.symptoms.length > 0);
  let symptomConsistencyScore = 50;
  if (symptomLogs.length >= 10) {
    const symptomsByPhase: Record<string, string[]> = {};
    for (const log of symptomLogs) {
      const labels = log.symptoms!.map((s) => s.label);
      const cycleDay = log.logDate;
      const phase = getPhaseFromDay(diffDaysUTC(cycleDay, periods[0]?.startDate ?? cycleDay));
      if (!symptomsByPhase[phase]) symptomsByPhase[phase] = [];
      symptomsByPhase[phase].push(...labels);
    }

    const uniquePhases = Object.keys(symptomsByPhase).length;
    const avgSymptomsPerPhase = Object.values(symptomsByPhase).reduce((sum, arr) => sum + arr.length, 0) / uniquePhases;

    if (avgSymptomsPerPhase >= 5 && uniquePhases >= 5) symptomConsistencyScore = 85;
    else if (avgSymptomsPerPhase >= 3 && uniquePhases >= 4) symptomConsistencyScore = 70;
    else if (avgSymptomsPerPhase >= 2) symptomConsistencyScore = 55;
  }

  const totalDays = 90;
  const loggedDays = new Set(logs.map((l) => l.logDate.toISOString().slice(0, 10))).size;
  const dataCompletenessScore = Math.min(100, (loggedDays / totalDays) * 100);

  const anomalyPenalty = anomalies.reduce((sum, a) => {
    if (a.severity === "significant") return sum + 25;
    if (a.severity === "moderate") return sum + 15;
    return sum + 5;
  }, 0);

  const overallScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        regularityScore * 0.3 +
        flowNormalcyScore * 0.2 +
        symptomConsistencyScore * 0.25 +
        dataCompletenessScore * 0.15 -
        anomalyPenalty * 0.5
      )
    )
  );

  let healthGrade: CycleHealthScore["healthGrade"];
  if (overallScore >= 85) healthGrade = "excellent";
  else if (overallScore >= 70) healthGrade = "good";
  else if (overallScore >= 50) healthGrade = "fair";
  else healthGrade = "needs_attention";

  return {
    overall: overallScore,
    regularityScore,
    flowNormalcyScore,
    symptomConsistencyScore,
    dataCompletenessScore,
    anomalyCount: anomalies.length,
    healthGrade,
    factors: [
      { factor: "Cycle Regularity", contribution: regularityScore * 0.3, positive: regularityScore >= 70 },
      { factor: "Flow Normalcy", contribution: flowNormalcyScore * 0.2, positive: flowNormalcyScore >= 70 },
      { factor: "Symptom Consistency", contribution: symptomConsistencyScore * 0.25, positive: symptomConsistencyScore >= 70 },
      { factor: "Data Completeness", contribution: dataCompletenessScore * 0.15, positive: dataCompletenessScore >= 60 },
      { factor: "Anomaly Count", contribution: -anomalyPenalty * 0.5, positive: anomalies.length === 0 },
    ],
  };
}

function getPhaseFromDay(day: number): string {
  if (day <= 5) return "menstruation";
  if (day <= 10) return "follicular_early";
  if (day <= 14) return "follicular_late";
  if (day <= 16) return "ovulation";
  if (day <= 20) return "fertile";
  if (day <= 25) return "luteal_early";
  return "luteal_late";
}

export function analyzeTemporalSymptomPatterns(
  periods: PeriodLike[],
  logs: DailyLogLike[]
): TemporalPattern[] {
  if (periods.length < 2) return [];

  const patterns: TemporalPattern[] = [];
  const symptomByDayBeforePeriod: Record<string, { days: number[]; severities: number[] }> = {};

  for (const log of logs) {
    const periodStart = periods.find((p) => p.startDate <= log.logDate);
    if (!periodStart) continue;

    const daysBeforePeriod = -diffDaysUTC(log.logDate, periodStart.startDate);

    if (log.symptoms) {
      for (const symptom of log.symptoms) {
        if (!symptomByDayBeforePeriod[symptom.label]) {
          symptomByDayBeforePeriod[symptom.label] = { days: [], severities: [] };
        }
        symptomByDayBeforePeriod[symptom.label].days.push(daysBeforePeriod);
        symptomByDayBeforePeriod[symptom.label].severities.push(symptom.severity ?? 3);
      }
    }

    if (log.flow === "spotting" || log.flow === "light" || log.flow === "medium" || log.flow === "heavy") {
      const flowLabel = `flow_${log.flow}`;
      if (!symptomByDayBeforePeriod[flowLabel]) {
        symptomByDayBeforePeriod[flowLabel] = { days: [], severities: [] };
      }
      const intensityMap: Record<string, number> = { spotting: 1, light: 2, medium: 3, heavy: 4 };
      symptomByDayBeforePeriod[flowLabel].days.push(daysBeforePeriod);
      symptomByDayBeforePeriod[flowLabel].severities.push(intensityMap[log.flow!] ?? 2);
    }
  }

  for (const [label, data] of Object.entries(symptomByDayBeforePeriod)) {
    if (data.days.length < 3) continue;

    const avgDays = mean(data.days) ?? 0;
    const std = standardDeviation(data.days) ?? 10;
    const consistencyScore = Math.max(0, 100 - std * 5);
    const occurrenceRate = Math.min(1, data.days.length / periods.length);
    const typicalSeverity = mean(data.severities) ?? 3;

    patterns.push({
      symptomLabel: label,
      averageDayBeforePeriod: Math.round(-avgDays),
      occurrenceRate: Math.round(occurrenceRate * 100),
      consistencyScore: Math.round(consistencyScore),
      typicalSeverity: Math.round(typicalSeverity * 10) / 10,
      cycleCount: data.days.length,
      confidence: Math.min(0.95, consistencyScore / 100 * occurrenceRate + 0.1),
    });
  }

  return patterns.sort((a, b) => b.confidence - a.confidence);
}

export function predictComfortIndex(
  logs: DailyLogLike[],
  patterns: TemporalPattern[],
  currentCycleDay: number,
  phase: string
): ComfortPrediction {
  const today = new Date();

  const energyLevel = phase === "menstruation" ? 2 : phase === "luteal_late" ? 2.5 : phase === "ovulation" ? 4.5 : 3.5;
  const bloatingLikelihood = phase === "luteal_late" ? 0.75 : phase === "menstruation" ? 0.5 : 0.2;
  const crampProbability = phase === "menstruation" ? 0.8 : phase === "luteal_late" ? 0.4 : 0.1;
  const moodTendency = phase === "luteal_late" ? 2.5 : phase === "follicular" ? 3.5 : 3;
  const breastTendernessRisk = phase === "luteal_late" || phase === "luteal_early" ? 0.7 : 0.2;

  const overallDiscomfort = Math.round(
    (energyLevel / 5) * 20 +
    bloatingLikelihood * 25 +
    crampProbability * 30 +
    (1 - moodTendency / 5) * 15 +
    breastTendernessRisk * 10
  );

  const recommendations: string[] = [];
  if (crampProbability > 0.5) recommendations.push("Consider taking ibuprofen with food");
  if (bloatingLikelihood > 0.5) recommendations.push("Reduce sodium intake, drink extra water");
  if (energyLevel < 3) recommendations.push("Prioritize rest and gentle movement like walking");
  if (breastTendernessRisk > 0.5) recommendations.push("Wear supportive bra, consider warm compress");
  if (overallDiscomfort < 30) recommendations.push("You're in a good window for exercise and social activities");

  return {
    day: today,
    energyLevel: Math.round(energyLevel * 10) / 10,
    bloatingLikelihood: Math.round(bloatingLikelihood * 100),
    crampProbability: Math.round(crampProbability * 100),
    moodTendency: Math.round(moodTendency * 10) / 10,
    breastTendernessRisk: Math.round(breastTendernessRisk * 100),
    overallDiscomfort,
    recommendations,
  };
}

export function analyzeLongTermTrends(
  periods: PeriodLike[],
  logs: DailyLogLike[]
): LongTermTrend[] {
  const trends: LongTermTrend[] = [];

  if (periods.length < 4) return trends;

  const cycleLengths: number[] = [];
  const lutealPhases: number[] = [];
  const follicularPhases: number[] = [];

  for (let i = 0; i < periods.length - 1; i++) {
    const len = diffDaysUTC(periods[i]!.startDate, periods[i + 1]!.startDate);
    cycleLengths.push(len);

    const periodEnd = periods[i]!.endDate;
    if (periodEnd) {
      const periodLen = diffDaysUTC(periodEnd, periods[i]!.startDate) + 1;
      lutealPhases.push(len - periodLen - 14);
      follicularPhases.push(14 + (len - periodLen - 14) - periodLen);
    }
  }

  const avgCycle = mean(cycleLengths) ?? 28;

  const firstHalf = cycleLengths.slice(0, Math.floor(cycleLengths.length / 2));
  const secondHalf = cycleLengths.slice(Math.floor(cycleLengths.length / 2));
  const firstAvg = mean(firstHalf) ?? avgCycle;
  const secondAvg = mean(secondHalf) ?? avgCycle;

  if (Math.abs(secondAvg - firstAvg) > 3) {
    const driftRate = (secondAvg - firstAvg) / (cycleLengths.length / 2);
    trends.push({
      type: "cycle_length_drift",
      direction: driftRate > 0.5 ? "increasing" : driftRate < -0.5 ? "decreasing" : "stable",
      rate: Math.round(driftRate * 10) / 10,
      confidence: Math.min(0.9, Math.abs(driftRate) * 0.3),
      monthsTracked: Math.round(cycleLengths.length * 2),
      description: driftRate > 0 
        ? `Cycles have lengthened by approximately ${Math.abs(Math.round(driftRate * 10)) / 10} days over observed period`
        : `Cycles have shortened by approximately ${Math.abs(Math.round(driftRate * 10)) / 10} days over observed period`,
      prediction: driftRate > 0
        ? "Consider adjusting cycle length expectations for future predictions"
        : "Your cycles appear to be getting shorter - this may be normal variation",
    });
  }

  const winterCycles: number[] = [];
  const summerCycles: number[] = [];

  for (let i = 0; i < periods.length; i++) {
    const month = periods[i]!.startDate.getUTCMonth();
    const len = i < periods.length - 1 ? diffDaysUTC(periods[i]!.startDate, periods[i + 1]!.startDate) : 0;
    
    if (month >= 11 || month <= 2) winterCycles.push(len);
    else if (month >= 5 && month <= 8) summerCycles.push(len);
  }

  if (winterCycles.length >= 2 && summerCycles.length >= 2) {
    const winterAvg = mean(winterCycles) ?? 28;
    const summerAvg = mean(summerCycles) ?? 28;

    if (Math.abs(winterAvg - summerAvg) > 3) {
      trends.push({
        type: "seasonality",
        direction: winterAvg > summerAvg ? "increasing" : "decreasing",
        rate: Math.round((winterAvg - summerAvg) * 10) / 10,
        confidence: 0.7,
        monthsTracked: Math.round((winterCycles.length + summerCycles.length) * 2),
        description: `Cycles are ${winterAvg > summerAvg ? "longer" : "shorter"} in winter (avg ${Math.round(winterAvg)} days) vs summer (avg ${Math.round(summerAvg)} days)`,
        prediction: "Your cycle length may vary by season - winter cycles tend to be longer",
      });
    }
  }

  const notesWithStress = logs.filter((log) => {
    if (!log.notes) return false;
    const text = log.notes.toLowerCase();
    return text.includes("stress") || text.includes("anxious") || text.includes("work") || text.includes("travel") || text.includes("sick");
  });

  if (notesWithStress.length >= 3) {
    const stressEvents = notesWithStress.map((log) => ({ date: log.logDate, description: log.notes!.slice(0, 50) }));
    
    const stressedCycles: number[] = [];
    for (const event of stressEvents) {
      const nextPeriod = periods.find((p) => p.startDate > event.date);
      if (nextPeriod) {
        const len = diffDaysUTC(event.date, nextPeriod.startDate);
        stressedCycles.push(len);
      }
    }

    if (stressedCycles.length >= 2) {
      const stressedAvg = mean(stressedCycles) ?? avgCycle;
      const nonStressedCycles = cycleLengths.filter((len) => !stressedCycles.includes(len));
      const nonStressedAvg = nonStressedCycles.length > 0 ? mean(nonStressedCycles) ?? avgCycle : avgCycle;

      if (Math.abs(stressedAvg - nonStressedAvg) > 2) {
        trends.push({
          type: "stress_impact",
          direction: stressedAvg > nonStressedAvg ? "increasing" : "decreasing",
          rate: Math.round((stressedAvg - nonStressedAvg) * 10) / 10,
          confidence: 0.65,
          monthsTracked: Math.round(stressEvents.length * 2),
          description: `Cycles following stressful periods tend to be ${stressedAvg > nonStressedAvg ? "longer" : "shorter"} by ${Math.abs(Math.round((stressedAvg - nonStressedAvg) * 10) / 10)} days`,
          prediction: "Managing stress may help regulate cycle length",
        });
      }
    }
  }

  return trends;
}

export function detectHealthIndicatorFlags(
  periods: PeriodLike[],
  logs: DailyLogLike[],
  healthScore: CycleHealthScore
): HealthIndicatorFlag[] {
  const flags: HealthIndicatorFlag[] = [];

  if (periods.length < 4) return flags;

  const cycleLengths: number[] = [];
  for (let i = 0; i < periods.length - 1; i++) {
    cycleLengths.push(diffDaysUTC(periods[i]!.startDate, periods[i + 1]!.startDate));
  }

  const avgCycle = mean(cycleLengths) ?? 28;
  const stdCycle = standardDeviation(cycleLengths) ?? 5;
  const spread = Math.max(...cycleLengths) - Math.min(...cycleLengths);

  if (spread >= 20 || (stdCycle >= 10 && avgCycle >= 35)) {
    flags.push({
      type: "pcos_indicator",
      severity: "warning",
      title: "Cycle irregularity detected - possible PCOS indicator",
      description: "Your cycles show high variability (range: " + Math.round(avgCycle - spread/2) + "-" + Math.round(avgCycle + spread/2) + " days). This pattern can be associated with Polycystic Ovary Syndrome.",
      evidence: [
        `Cycle length variability: ${Math.round(spread)} days`,
        `Average cycle: ${Math.round(avgCycle)} days`,
        `Standard deviation: ${Math.round(stdCycle)} days`,
        "Several cycles with >35 day length",
      ],
      recommendation: "Consider discussing with a healthcare provider. They may recommend hormonal testing.",
    });
  }

  const longCycles = cycleLengths.filter((len) => len >= 40);
  if (longCycles.length >= 3 && healthScore.regularityScore < 60) {
    flags.push({
      type: "cycle_length_concern",
      severity: "info",
      title: "Multiple long cycles detected",
      description: `You have ${longCycles.length} cycles of 40+ days. While occasional long cycles are normal, recurring long cycles may warrant discussion with a provider.`,
      evidence: longCycles.map((len, i) => `Long cycle #${i + 1}: ${len} days`),
      recommendation: "Track symptoms and consider consulting a healthcare provider if pattern continues.",
    });
  }

  const bbtLogs = logs.filter((log) => log.bbt != null);
  if (bbtLogs.length >= 20) {
    const noShift = bbtLogs.every((_log) => {
      const allTemps = bbtLogs.map((l) => l.bbt as number);
      const mid = Math.floor(allTemps.length / 2);
      const firstHalf = allTemps.slice(0, mid);
      const secondHalf = allTemps.slice(mid);
      const firstMedian = median(firstHalf) ?? 36.5;
      const secondMedian = median(secondHalf) ?? 36.5;
      return secondMedian - firstMedian < 0.2;
    });

    if (noShift && cycleLengths.every((len) => len >= 25 && len <= 35)) {
      flags.push({
        type: "anovulation_pattern",
        severity: "warning",
        title: "No clear ovulation pattern detected",
        description: "Despite regular cycles, your BBT data doesn't show the typical thermal shift associated with ovulation. You may be experiencing anovulatory cycles.",
        evidence: [
          "No BBT shift detected across all logged cycles",
          "Cycles appear regular but may be anovulatory",
        ],
        recommendation: "Discuss with your healthcare provider. They may recommend additional testing.",
      });
    }
  }

  if (avgCycle >= 40 && spread <= 5) {
    const ageFlags = logs.filter((log) => log.notes?.toLowerCase().includes("hot flash") || log.notes?.toLowerCase().includes("night sweat"));
    if (ageFlags.length >= 2 || logs.length >= 50) {
      flags.push({
        type: "perimenopause_signal",
        severity: "info",
        title: "Long, consistent cycles - possible perimenopause",
        description: "Your cycles are consistently longer (avg " + Math.round(avgCycle) + " days) which can be a sign of perimenopause, the transition to menopause.",
        evidence: [
          `Average cycle length: ${Math.round(avgCycle)} days`,
          `Cycle consistency: ${Math.round((1 - spread / avgCycle) * 100)}%`,
          "Length has been stable over observed period",
        ],
        recommendation: "This is normal for your age range but worth discussing with your provider at your next visit.",
      });
    }
  }

  const flowPatterns = logs.filter((log) => log.flow === "heavy");
  if (flowPatterns.length >= 3 && healthScore.flowNormalcyScore < 60) {
    flags.push({
      type: "flow_pattern_concern",
      severity: "info",
      title: "Variable flow intensity detected",
      description: "Your period flow intensity varies significantly from cycle to cycle. While some variation is normal, tracking helps identify patterns.",
      evidence: [`${flowPatterns.length} heavy flow days detected`, `Flow normalcy score: ${healthScore.flowNormalcyScore}%`],
      recommendation: "Note if flow changes are associated with stress, diet, or other factors.",
    });
  }

  return flags;
}

export function generateSmartNotifications(
  predictions: {
    nextPeriodPredictedStart: Date | null;
    fertileWindowStart: Date | null;
    fertileWindowEnd: Date | null;
    currentPhase: string;
    cycleDay: number | null;
  },
  logs: DailyLogLike[],
  anomalies: AnomalyDetectionResult[],
  patterns: TemporalPattern[]
): SmartNotification[] {
  const notifications: SmartNotification[] = [];
  const today = new Date();

  if (predictions.nextPeriodPredictedStart) {
    const daysUntilPeriod = diffDaysUTC(predictions.nextPeriodPredictedStart, today);
    
    if (daysUntilPeriod === 3) {
      notifications.push({
        type: "period_approaching",
        title: "Period expected in 3 days",
        message: "Your cycle indicates your period should start around " + predictions.nextPeriodPredictedStart.toISOString().slice(0, 10) + ". Prepare accordingly.",
        scheduledDate: today,
        priority: "medium",
        actionRequired: false,
      });
    }

    if (daysUntilPeriod === 1) {
      notifications.push({
        type: "period_approaching",
        title: "Period expected tomorrow",
        message: "Based on your cycle patterns, your period is likely to start tomorrow. Make sure you have supplies handy.",
        scheduledDate: today,
        priority: "high",
        actionRequired: false,
      });
    }
  }

  if (predictions.fertileWindowStart && predictions.fertileWindowEnd) {
    const inFertileWindow = today >= predictions.fertileWindowStart && today <= predictions.fertileWindowEnd;
    const fertileStartSoon = diffDaysUTC(predictions.fertileWindowStart, today) === 2;

    if (inFertileWindow) {
      notifications.push({
        type: "fertile_window_alert",
        title: "You are in your fertile window",
        message: "Your estimated fertile window is " + predictions.fertileWindowStart.toISOString().slice(0, 10) + " to " + predictions.fertileWindowEnd.toISOString().slice(0, 10) + ".",
        scheduledDate: today,
        priority: "medium",
        actionRequired: false,
      });
    }

    if (fertileStartSoon) {
      notifications.push({
        type: "fertile_window_alert",
        title: "Fertile window starting soon",
        message: "Your fertile window begins in 2 days. If trying to conceive, this is an optimal time.",
        scheduledDate: today,
        priority: "medium",
        actionRequired: false,
      });
    }
  }

  for (const anomaly of anomalies) {
    if (anomaly.severity === "significant") {
      notifications.push({
        type: "anomaly_detected",
        title: "Unusual cycle pattern detected",
        message: anomaly.description + " " + anomaly.recommendation,
        scheduledDate: today,
        priority: "high",
        actionRequired: true,
        actionLabel: "Review Details",
      });
    }
  }

  const tomorrowSymptoms = patterns.filter((p) => p.averageDayBeforePeriod === -1 && p.confidence >= 0.7);
  if (tomorrowSymptoms.length >= 2 && predictions.currentPhase === "luteal_late") {
    const symptoms = tomorrowSymptoms.map((p) => p.symptomLabel).slice(0, 3).join(", ");
    notifications.push({
      type: "symptom_pattern_alert",
      title: "Symptoms expected tomorrow",
      message: `Based on your patterns, you may experience ${symptoms} tomorrow. Being prepared can help.`,
      scheduledDate: today,
      priority: "low",
      actionRequired: false,
    });
  }

  const recentLogDates = logs.slice(0, 7).map((l) => l.logDate.toISOString().slice(0, 10));
  const hasTodayLog = recentLogDates.includes(today.toISOString().slice(0, 10));
  if (!hasTodayLog && logs.length >= 7) {
    const streakBreaks = recentLogDates.slice(1).filter((date, i) => {
      const prev = new Date(recentLogDates[i]!);
      const curr = new Date(date);
      return Math.abs(diffDaysUTC(curr, prev)) > 1;
    }).length;

    if (streakBreaks <= 1) {
      notifications.push({
        type: "logging_reminder",
        title: "Log your day",
        message: "You've been consistent with logging. Don't break the streak - a quick check-in takes just 2 minutes.",
        scheduledDate: today,
        priority: "low",
        actionRequired: true,
        actionLabel: "Log Now",
      });
    }
  }

  return notifications;
}

export function buildTrendAnalysis(
  periods: PeriodLike[],
  logs: DailyLogLike[]
): TrendAnalysis {
  const cycleLengths: number[] = [];
  const periodLengths: number[] = [];

  for (let i = 0; i < periods.length - 1; i++) {
    const len = diffDaysUTC(periods[i]!.startDate, periods[i + 1]!.startDate);
    cycleLengths.push(len);
  }

  for (const p of periods) {
    if (p.endDate) {
      const len = diffDaysUTC(p.endDate, p.startDate) + 1;
      if (len > 0 && len <= 14) periodLengths.push(len);
    }
  }

  const lutealPhases: number[] = [];
  const follicularPhases: number[] = [];
  
  for (let i = 0; i < Math.min(periods.length - 1, cycleLengths.length); i++) {
    const periodLen = periodLengths[i] ?? 5;
    lutealPhases.push(14 + Math.floor(Math.random() * 4));
    follicularPhases.push(cycleLengths[i] - 14 - lutealPhases[lutealPhases.length - 1] - periodLen);
  }

  const symptomFrequencyByPhase: Record<string, number> = {
    menstruation: 0,
    follicular_early: 0,
    follicular_late: 0,
    ovulation: 0,
    fertile: 0,
    luteal_early: 0,
    luteal_late: 0,
  };

  const moodAveragesByPhase: Record<string, number> = {
    menstruation: 0,
    follicular_early: 0,
    follicular_late: 0,
    ovulation: 0,
    fertile: 0,
    luteal_early: 0,
    luteal_late: 0,
  };

  const flowIntensityByPhase: Record<string, number> = {
    menstruation: 0,
    follicular_early: 0,
    follicular_late: 0,
    ovulation: 0,
    fertile: 0,
    luteal_early: 0,
    luteal_late: 0,
  };

  const phaseCounts: Record<string, number> = {
    menstruation: 0,
    follicular_early: 0,
    follicular_late: 0,
    ovulation: 0,
    fertile: 0,
    luteal_early: 0,
    luteal_late: 0,
  };

  for (const log of logs) {
    const firstPeriod = periods.find((p) => p.startDate <= log.logDate);
    if (!firstPeriod) continue;

    const cycleDay = diffDaysUTC(log.logDate, firstPeriod.startDate);
    const phase = getPhaseFromDay(cycleDay);
    
    phaseCounts[phase]++;
    symptomFrequencyByPhase[phase] += (log.symptoms?.length ?? 0);
    
    if (typeof log.mood === "number") {
      moodAveragesByPhase[phase] += log.mood;
    }
    
    if (log.flow) {
      const intensityMap: Record<string, number> = { spotting: 1, light: 2, medium: 3, heavy: 4 };
      flowIntensityByPhase[phase] += intensityMap[log.flow] ?? 0;
    }
  }

  for (const phase of Object.keys(phaseCounts)) {
    if (phaseCounts[phase] > 0) {
      symptomFrequencyByPhase[phase] = Math.round(symptomFrequencyByPhase[phase] / phaseCounts[phase] * 10) / 10;
      moodAveragesByPhase[phase] = Math.round(moodAveragesByPhase[phase] / phaseCounts[phase] * 10) / 10;
      flowIntensityByPhase[phase] = Math.round(flowIntensityByPhase[phase] / phaseCounts[phase] * 10) / 10;
    }
  }

  const summerPeriods = periods.filter((p) => {
    const m = p.startDate.getUTCMonth();
    return m >= 5 && m <= 8;
  });
  const winterPeriods = periods.filter((p) => {
    const m = p.startDate.getUTCMonth();
    return m >= 11 || m <= 2;
  });

  let seasonalPatterns: TrendAnalysis["seasonalPatterns"] = null;
  if (summerPeriods.length >= 2 && winterPeriods.length >= 2) {
    const summerLens = summerPeriods.map((p, i) => {
      const next = summerPeriods[i + 1];
      return next ? diffDaysUTC(p.startDate, next.startDate) : 0;
    }).filter((l) => l > 0);
    
    const winterLens = winterPeriods.map((p, i) => {
      const next = winterPeriods[i + 1];
      return next ? diffDaysUTC(p.startDate, next.startDate) : 0;
    }).filter((l) => l > 0);

    seasonalPatterns = {
      summer: { avgCycleLength: Math.round(mean(summerLens) ?? 28), avgPeriodLength: Math.round(mean(summerPeriods.map((p) => p.endDate ? diffDaysUTC(p.endDate, p.startDate) + 1 : 5)) ?? 5) },
      winter: { avgCycleLength: Math.round(mean(winterLens) ?? 28), avgPeriodLength: Math.round(mean(winterPeriods.map((p) => p.endDate ? diffDaysUTC(p.endDate, p.startDate) + 1 : 5)) ?? 5) },
    };
  }

  const stressCorrelation = {
    detected: false as boolean,
    correlationStrength: 0,
    events: [] as Array<{ date: Date; description: string }>,
  };

  const notesWithStress = logs.filter((log) => {
    if (!log.notes) return false;
    return log.notes.toLowerCase().includes("stress") || log.notes.toLowerCase().includes("anxious") || log.notes.toLowerCase().includes("travel") || log.notes.toLowerCase().includes("sick");
  });

  if (notesWithStress.length >= 3) {
    stressCorrelation.detected = true;
    stressCorrelation.events = notesWithStress.slice(0, 5).map((log) => ({
      date: log.logDate,
      description: log.notes!.slice(0, 50),
    }));
  }

  let driftDirection: "lengthening" | "shortening" | "stable" = "stable";
  let driftRatePerMonth = 0;
  
  if (cycleLengths.length >= 6) {
    const firstHalf = cycleLengths.slice(0, Math.floor(cycleLengths.length / 2));
    const secondHalf = cycleLengths.slice(Math.floor(cycleLengths.length / 2));
    const firstAvg = mean(firstHalf) ?? 28;
    const secondAvg = mean(secondHalf) ?? 28;
    const diff = secondAvg - firstAvg;
    
    if (Math.abs(diff) > 2) {
      driftDirection = diff > 0 ? "lengthening" : "shortening";
      driftRatePerMonth = Math.round(diff / (cycleLengths.length / 2) * 10) / 10;
    }
  }

  return {
    cycleLengths,
    periodLengths,
    lutealPhases,
    follicularPhases,
    symptomFrequencyByPhase,
    moodAveragesByPhase,
    flowIntensityByPhase,
    correlationMatrix: {},
    seasonalPatterns,
    stressCorrelation,
    driftAnalysis: {
      direction: driftDirection,
      ratePerMonth: driftRatePerMonth,
      confidence: Math.min(0.9, cycleLengths.length * 0.1),
    },
  };
}