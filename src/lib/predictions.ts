import { addDaysUTC, diffDaysUTC } from "@/lib/dateOnly";

export type GoalMode = "track" | "conceive" | "avoid";

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

function medianAbsoluteDeviation(nums: number[]): number | null {
  const m = median(nums);
  if (m === null) return null;
  const deviations = nums.map((x) => Math.abs(x - m));
  return median(deviations);
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

function weightedMedian(lengths: number[], recencyWeights: number[]): number | null {
  if (lengths.length === 0) return null;
  const paired = lengths.map((len, i) => ({
    len,
    weight: recencyWeights[i] ?? 1
  })).sort((a, b) => a.len - b.len);

  const totalWeight = paired.reduce((sum, p) => sum + p.weight, 0);
  let cumulative = 0;

  for (const { len, weight } of paired) {
    cumulative += weight;
    if (cumulative >= totalWeight / 2) {
      return len;
    }
  }
  return paired[paired.length - 1]?.len ?? null;
}

export type PredictionPhase =
  | "menstruation"
  | "follicular_early"
  | "follicular_late"
  | "ovulation"
  | "fertile"
  | "luteal_early"
  | "luteal_late";

export type CyclePhaseDetail = {
  phase: PredictionPhase;
  phaseLabel: string;
  phaseDescription: string;
  daysIntoPhase: number;
  daysUntilNextPhase: number | null;
  isInWindow: boolean;
};

export type OvulationEvidence = {
  type: "bbt_shift" | "mucus_eggwhite" | "both" | "combined";
  detectedDate: Date;
  confidence: number;
  supportingData: {
    bbtShift?: {
      temperature: number;
      daysSustained: number;
      shiftMagnitude: number;
    };
    mucusPeak?: string;
  };
};

export type PredictionDiscrepancy = {
  predictedOvulation: Date;
  evidenceBasedOvulation: Date | null;
  adjustmentMade: boolean;
  discrepancyDays: number;
  source: "bbt" | "mucus" | "combined" | null;
};

export type ConfidenceBreakdown = {
  baseScore: number;
  bbtSignalBonus: number;
  mucusSignalBonus: number;
  consistencyBonus: number;
  discrepancyPenalty: number;
  finalConfidence: number;
};

export type PredictionResult = {
  hasHistory: boolean;
  medianCycleLength: number;
  medianPeriodLength: number;
  variabilityDays: number;
  cycleLengthRange: { min: number; max: number };
  confidenceScore: number;
  irregularityLevel: "building" | "stable" | "shifting" | "high_variability" | "long_cycle";
  displayCycleLength: number;
  predictionMode: "single" | "range";
  lastPeriodStart: Date | null;
  nextPeriodPredictedStart: Date | null;
  nextPeriodWindowStart: Date | null;
  nextPeriodWindowEnd: Date | null;
  ovulationEstimate: Date | null;
  fertileWindowStart: Date | null;
  fertileWindowEnd: Date | null;
  currentPhase: CyclePhaseDetail | null;
  cycleDay: number | null;
  phaseProgress: number;
  ovulationProbability: number;
  ovulationEvidence?: OvulationEvidence;
  adjustedLutealPhase?: number;
  predictionDiscrepancy?: PredictionDiscrepancy;
  confidenceBreakdown: ConfidenceBreakdown;
};

const PHASE_ORDER: PredictionPhase[] = [
  "menstruation",
  "follicular_early",
  "follicular_late",
  "ovulation",
  "fertile",
  "luteal_early",
  "luteal_late",
];

const PHASE_LABELS: Record<PredictionPhase, { label: string; description: string }> = {
  menstruation: { label: "Menstruation", description: "Your period is here. Rest and care are important." },
  follicular_early: { label: "Early Follicular", description: "Energy is building. A good time for new starts." },
  follicular_late: { label: "Late Follicular", description: "Rising estrogen. You may feel more social and confident." },
  ovulation: { label: "Ovulation", description: "Peak fertility window. Most likely time to conceive." },
  fertile: { label: "Fertile Window", description: "Still within the fertile period. Conception is possible." },
  luteal_early: { label: "Early Luteal", description: "Progesterone rises. Body is preparing for potential pregnancy." },
  luteal_late: { label: "Late Luteal", description: "PMS window. Be gentle with yourself." },
};

export type BBTSpikeResult = {
  detected: boolean;
  ovulationDay: Date | null;
  lutealPhaseLength: number | null;
  confidence: number;
  shiftMagnitude: number;
  daysSustained: number;
};

export function detectBBTOvulation(
  dailyLogs: DailyLogLike[],
  periodStart: Date,
  assumedCycleLength: number
): BBTSpikeResult {
  const bbtLogs = dailyLogs
    .filter((log) => log.bbt != null && log.bbt > 0)
    .sort((a, b) => a.logDate.getTime() - b.logDate.getTime());

  if (bbtLogs.length < 5) {
    return { detected: false, ovulationDay: null, lutealPhaseLength: null, confidence: 0, shiftMagnitude: 0, daysSustained: 0 };
  }

  const temperatures = bbtLogs.map((log) => log.bbt as number);
  const baselineTemp = median(temperatures.slice(0, Math.min(5, temperatures.length))) ?? temperatures[0];
  const minShift = 0.2;
  const maxShift = 0.6;

  let spikeStartIndex = -1;
  let sustainedDays = 0;
  let maxTemp = baselineTemp;
  let shiftMagnitude = 0;

  for (let i = 3; i < temperatures.length; i++) {
    const temp = temperatures[i]!;
    const prevTemps = temperatures.slice(Math.max(0, i - 3), i);
    const prevMedian = median(prevTemps) ?? baselineTemp;
    const shift = temp - prevMedian;

    if (shift >= minShift && shift <= maxShift) {
      if (spikeStartIndex === -1) {
        spikeStartIndex = i;
      }
      sustainedDays++;
      maxTemp = Math.max(maxTemp, temp);
      shiftMagnitude = Math.max(shiftMagnitude, shift);
    } else if (spikeStartIndex !== -1 && sustainedDays >= 3) {
      break;
    } else {
      spikeStartIndex = -1;
      sustainedDays = 0;
    }
  }

  if (spikeStartIndex === -1 || sustainedDays < 3) {
    const halfPoint = Math.floor(temperatures.length / 2);
    const firstHalf = temperatures.slice(0, halfPoint);
    const secondHalf = temperatures.slice(halfPoint);
    const firstMedian = median(firstHalf) ?? baselineTemp;
    const secondMedian = median(secondHalf) ?? baselineTemp;
    const overallShift = secondMedian - firstMedian;

    if (overallShift >= minShift && secondHalf.length >= 5) {
      spikeStartIndex = halfPoint;
      sustainedDays = secondHalf.length;
      maxTemp = secondMedian;
      shiftMagnitude = overallShift;
    }
  }

  if (spikeStartIndex !== -1 && sustainedDays >= 3) {
    const ovulationDay = addDaysUTC(bbtLogs[spikeStartIndex]!.logDate, -1);
    const lutealPhaseLength = diffDaysUTC(periodStart, ovulationDay);

    if (lutealPhaseLength >= 8 && lutealPhaseLength <= 20) {
      const confidence = Math.min(0.95, 0.5 + (sustainedDays * 0.1) + (shiftMagnitude * 0.5));
      return {
        detected: true,
        ovulationDay,
        lutealPhaseLength,
        confidence,
        shiftMagnitude,
        daysSustained: sustainedDays,
      };
    }
  }

  return { detected: false, ovulationDay: null, lutealPhaseLength: null, confidence: 0, shiftMagnitude: 0, daysSustained: 0 };
}

export type MucusOvulationResult = {
  detected: boolean;
  peakDate: Date | null;
  confidence: number;
  peakType: string;
};

export function detectMucusOvulation(
  dailyLogs: DailyLogLike[],
  periodStart: Date,
  assumedCycleLength: number
): MucusOvulationResult {
  const mucusLogs = dailyLogs
    .filter((log) => log.mucusType && (log.mucusType === "eggwhite" || log.mucusType === "watery"))
    .sort((a, b) => a.logDate.getTime() - b.logDate.getTime());

  if (mucusLogs.length === 0) {
    return { detected: false, peakDate: null, confidence: 0, peakType: "" };
  }

  const eggwhiteLogs = mucusLogs.filter((log) => log.mucusType === "eggwhite");
  if (eggwhiteLogs.length === 0) {
    const wateryLogs = mucusLogs.filter((log) => log.mucusType === "watery");
    if (wateryLogs.length >= 2) {
      return {
        detected: true,
        peakDate: wateryLogs[wateryLogs.length - 1]!.logDate,
        confidence: 0.5,
        peakType: "watery",
      };
    }
    return { detected: false, peakDate: null, confidence: 0, peakType: "" };
  }

  const peakLog = eggwhiteLogs[eggwhiteLogs.length - 1]!;
  const daysFromPeriodStart = diffDaysUTC(peakLog.logDate, periodStart);
  const expectedOvulationDay = assumedCycleLength - 14;

  let confidence = 0.6;
  if (Math.abs(daysFromPeriodStart - expectedOvulationDay) <= 2) {
    confidence = 0.85;
  } else if (Math.abs(daysFromPeriodStart - expectedOvulationDay) <= 5) {
    confidence = 0.7;
  } else {
    confidence = 0.5;
  }

  if (eggwhiteLogs.length >= 2) {
    confidence = Math.min(0.95, confidence + 0.1);
  }

  return {
    detected: true,
    peakDate: peakLog.logDate,
    confidence,
    peakType: "eggwhite",
  };
}

export type OvulationDetectionResult = {
  detected: boolean;
  ovulationDay: Date | null;
  evidence: OvulationEvidence | null;
  adjustedLutealPhase: number | null;
};

export function detectOvulationEvidence(
  dailyLogs: DailyLogLike[],
  periodStart: Date,
  assumedCycleLength: number
): OvulationDetectionResult {
  const bbtResult = detectBBTOvulation(dailyLogs, periodStart, assumedCycleLength);
  const mucusResult = detectMucusOvulation(dailyLogs, periodStart, assumedCycleLength);

  if (bbtResult.detected && mucusResult.detected) {
    const dayDiff = Math.abs(diffDaysUTC(bbtResult.ovulationDay!, mucusResult.peakDate!));
    if (dayDiff <= 2) {
      const avgDay = addDaysUTC(bbtResult.ovulationDay!, Math.floor(dayDiff / 2));
      const avgLuteal = Math.round((bbtResult.lutealPhaseLength! + diffDaysUTC(periodStart, mucusResult.peakDate!)) / 2);
      return {
        detected: true,
        ovulationDay: avgDay,
        adjustedLutealPhase: avgLuteal,
        evidence: {
          type: "both",
          detectedDate: avgDay,
          confidence: Math.min(0.95, bbtResult.confidence + 0.1),
          supportingData: {
            bbtShift: {
              temperature: bbtResult.shiftMagnitude,
              daysSustained: bbtResult.daysSustained,
              shiftMagnitude: bbtResult.shiftMagnitude,
            },
            mucusPeak: mucusResult.peakType,
          },
        },
      };
    }
  }

  if (bbtResult.detected) {
    return {
      detected: true,
      ovulationDay: bbtResult.ovulationDay,
      adjustedLutealPhase: bbtResult.lutealPhaseLength,
      evidence: {
        type: "bbt_shift",
        detectedDate: bbtResult.ovulationDay!,
        confidence: bbtResult.confidence,
        supportingData: {
          bbtShift: {
            temperature: bbtResult.shiftMagnitude,
            daysSustained: bbtResult.daysSustained,
            shiftMagnitude: bbtResult.shiftMagnitude,
          },
        },
      },
    };
  }

  if (mucusResult.detected) {
    return {
      detected: true,
      ovulationDay: addDaysUTC(mucusResult.peakDate!, -1),
      adjustedLutealPhase: diffDaysUTC(periodStart, mucusResult.peakDate!),
      evidence: {
        type: "mucus_eggwhite",
        detectedDate: mucusResult.peakDate!,
        confidence: mucusResult.confidence,
        supportingData: {
          mucusPeak: mucusResult.peakType,
        },
      },
    };
  }

  return { detected: false, ovulationDay: null, evidence: null, adjustedLutealPhase: null };
}

function estimateCurrentPhase(cycleDay: number, cycleLength: number, periodLength: number): CyclePhaseDetail {
  const ovulationDay = Math.max(1, cycleLength - 14);

  let phase: PredictionPhase;
  let daysIntoPhase: number;
  let daysUntilNextPhase: number | null;

  if (cycleDay <= periodLength) {
    phase = "menstruation";
    daysIntoPhase = cycleDay;
    daysUntilNextPhase = periodLength - cycleDay + 1;
  } else if (cycleDay <= 5) {
    phase = "follicular_early";
    daysIntoPhase = cycleDay - periodLength;
    daysUntilNextPhase = 6 - cycleDay;
  } else if (cycleDay <= ovulationDay - 1) {
    phase = "follicular_late";
    daysIntoPhase = cycleDay - 5;
    daysUntilNextPhase = ovulationDay - cycleDay;
  } else if (cycleDay <= ovulationDay + 1) {
    phase = "ovulation";
    daysIntoPhase = cycleDay === ovulationDay ? 0 : cycleDay - ovulationDay;
    daysUntilNextPhase = 1;
  } else if (cycleDay <= ovulationDay + 4) {
    phase = "fertile";
    daysIntoPhase = cycleDay - ovulationDay - 1;
    daysUntilNextPhase = ovulationDay + 4 - cycleDay + 1;
  } else if (cycleDay <= cycleLength - 7) {
    phase = "luteal_early";
    daysIntoPhase = cycleDay - ovulationDay - 4;
    daysUntilNextPhase = cycleLength - 7 - cycleDay + 1;
  } else {
    phase = "luteal_late";
    daysIntoPhase = cycleDay - (cycleLength - 7);
    daysUntilNextPhase = cycleLength - cycleDay + 1;
  }

  const phaseInfo = PHASE_LABELS[phase];
  return {
    phase,
    phaseLabel: phaseInfo.label,
    phaseDescription: phaseInfo.description,
    daysIntoPhase,
    daysUntilNextPhase,
    isInWindow: phase === "ovulation" || phase === "fertile",
  };
}

function calculateOvulationProbability(cycleDay: number, cycleLength: number): number {
  const ovulationDay = cycleLength - 14;
  const deviation = Math.abs(cycleDay - ovulationDay);

  if (deviation === 0) return 0.95;
  if (deviation === 1) return 0.70;
  if (deviation === 2) return 0.40;
  if (deviation === 3) return 0.20;
  if (deviation <= 5) return 0.10;
  return 0.02;
}

function calculateAdaptiveConfidence(
  hasHistory: boolean,
  cycleLengths: number[],
  bbtResult: ReturnType<typeof detectBBTOvulation>,
  mucusResult: ReturnType<typeof detectMucusOvulation>,
  discrepancyDays: number
): ConfidenceBreakdown {
  let baseScore = !hasHistory ? 25 : 55;

  let bbtSignalBonus = 0;
  if (bbtResult.detected && bbtResult.confidence > 0.5) {
    bbtSignalBonus = 15;
    if (bbtResult.daysSustained >= 5) bbtSignalBonus += 5;
    if (bbtResult.shiftMagnitude >= 0.3) bbtSignalBonus += 5;
  }

  let mucusSignalBonus = 0;
  if (mucusResult.detected && mucusResult.confidence > 0.5) {
    mucusSignalBonus = 8;
    if (mucusResult.peakType === "eggwhite") mucusSignalBonus += 7;
  }

  let consistencyBonus = 0;
  if (cycleLengths.length >= 3) {
    const spread = Math.max(...cycleLengths) - Math.min(...cycleLengths);
    if (spread <= 3) consistencyBonus = 10;
    else if (spread <= 5) consistencyBonus = 5;
  }

  let discrepancyPenalty = 0;
  if (discrepancyDays > 0) {
    if (discrepancyDays <= 2) discrepancyPenalty = 5;
    else if (discrepancyDays <= 4) discrepancyPenalty = 15;
    else discrepancyPenalty = 25;
  }

  const finalConfidence = Math.max(
    15,
    Math.min(
      98,
      Math.round(
        baseScore +
        bbtSignalBonus +
        mucusSignalBonus +
        consistencyBonus -
        discrepancyPenalty
      )
    )
  );

  return {
    baseScore,
    bbtSignalBonus,
    mucusSignalBonus,
    consistencyBonus,
    discrepancyPenalty,
    finalConfidence,
  };
}

export function computePredictions(
  periods: PeriodLike[],
  dailyLogsOrDefaults: DailyLogLike[] | ProfileDefaults,
  maybeDefaults?: ProfileDefaults,
  maybeOpts?: { maxCycles?: number; minCycles?: number }
): PredictionResult {
  let dailyLogs: DailyLogLike[] = [];
  let defaults: ProfileDefaults;
  let opts: { maxCycles?: number; minCycles?: number } | undefined;

  if (Array.isArray(dailyLogsOrDefaults)) {
    dailyLogs = dailyLogsOrDefaults;
    defaults = maybeDefaults!;
    opts = maybeOpts;
  } else {
    defaults = dailyLogsOrDefaults;
    opts = maybeOpts;
  }

  const maxCycles = opts?.maxCycles ?? 12;
  const minCycles = opts?.minCycles ?? 2;

  const sorted = [...periods].sort(
    (a, b) => b.startDate.getTime() - a.startDate.getTime()
  );

  const lastPeriodStart = sorted[0]?.startDate ?? null;

  const cycleLengths: number[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const newer = sorted[i]!.startDate;
    const older = sorted[i + 1]!.startDate;
    const len = diffDaysUTC(newer, older);
    if (len > 18 && len <= 120) cycleLengths.push(len);
  }

  const periodLengths: number[] = [];
  for (const p of sorted) {
    if (!p.endDate) continue;
    const len = diffDaysUTC(p.endDate, p.startDate) + 1;
    if (len > 0 && len <= 30) periodLengths.push(len);
  }

  const hasHistory = cycleLengths.length >= minCycles;

  const recencyWeights = cycleLengths.map((_, i) => Math.pow(1.15, i));
  const weightedMedianCycle = weightedMedian(cycleLengths, recencyWeights.slice(0, cycleLengths.length));
  const medianCycle = weightedMedianCycle ?? median(cycleLengths) ?? defaults.cycleLengthTypical;
  const medianPeriod = median(periodLengths) ?? defaults.periodLengthTypical;

  const mad = medianAbsoluteDeviation(cycleLengths);
  const stdDev = standardDeviation(cycleLengths);

  const cycleLengthRange =
    cycleLengths.length > 0
      ? {
          min: Math.min(...cycleLengths),
          max: Math.max(...cycleLengths),
        }
      : {
          min: defaults.cycleLengthTypical,
          max: defaults.cycleLengthTypical,
        };

  const cycleSpread = cycleLengthRange.max - cycleLengthRange.min;

  const effectiveVariability = Math.max(
    1,
    Math.min(10, Math.round((mad ?? 2) + (stdDev ?? 0) * 0.5 + cycleSpread / 8))
  );

  const displayCycleLength = Math.round(medianCycle);

  const bbtResult = lastPeriodStart
    ? detectBBTOvulation(dailyLogs, lastPeriodStart, displayCycleLength)
    : { detected: false, ovulationDay: null, lutealPhaseLength: null, confidence: 0, shiftMagnitude: 0, daysSustained: 0 };

  const mucusResult = lastPeriodStart
    ? detectMucusOvulation(dailyLogs, lastPeriodStart, displayCycleLength)
    : { detected: false, peakDate: null, confidence: 0, peakType: "" };

  const ovulationDetection = lastPeriodStart
    ? detectOvulationEvidence(dailyLogs, lastPeriodStart, displayCycleLength)
    : { detected: false, ovulationDay: null, evidence: null, adjustedLutealPhase: null };

  const predictedOvulation = lastPeriodStart ? addDaysUTC(lastPeriodStart, displayCycleLength - 14) : null;
  const discrepancyDays = ovulationDetection.detected && predictedOvulation
    ? Math.abs(diffDaysUTC(ovulationDetection.ovulationDay!, predictedOvulation))
    : 0;

  const confidenceBreakdown = calculateAdaptiveConfidence(
    hasHistory,
    cycleLengths,
    bbtResult,
    mucusResult,
    discrepancyDays
  );

  const confidenceScore = confidenceBreakdown.finalConfidence;

  const irregularityLevel: PredictionResult["irregularityLevel"] = !hasHistory
    ? "building"
    : cycleLengthRange.max >= 38 && cycleSpread <= 5
      ? "long_cycle"
    : effectiveVariability >= 5 || cycleSpread >= 8
      ? "high_variability"
    : cycleSpread <= 2 && effectiveVariability <= 2
      ? "stable"
      : cycleSpread <= 5
      ? "shifting"
      : "high_variability";

  const predictionMode: PredictionResult["predictionMode"] =
    irregularityLevel === "high_variability" || effectiveVariability >= 5 ? "range" : "single";

  if (!lastPeriodStart) {
    return {
      hasHistory: false,
      medianCycleLength: defaults.cycleLengthTypical,
      medianPeriodLength: defaults.periodLengthTypical,
      variabilityDays: 3,
      cycleLengthRange: {
        min: defaults.cycleLengthTypical,
        max: defaults.cycleLengthTypical,
      },
      confidenceScore: 20,
      irregularityLevel: "building",
      displayCycleLength: defaults.cycleLengthTypical,
      predictionMode: "single",
      lastPeriodStart: null,
      nextPeriodPredictedStart: null,
      nextPeriodWindowStart: null,
      nextPeriodWindowEnd: null,
      ovulationEstimate: null,
      fertileWindowStart: null,
      fertileWindowEnd: null,
      currentPhase: null,
      cycleDay: null,
      phaseProgress: 0,
      ovulationProbability: 0,
      confidenceBreakdown,
    };
  }

  const today = new Date();
  const daysSinceLastPeriod = diffDaysUTC(today, lastPeriodStart);
  const currentCycleDay = Math.max(1, daysSinceLastPeriod + 1);

  let nextPeriodPredictedStart: Date;
  let ovulationEstimate: Date;
  let adjustedLutealPhase: number | undefined;

  if (ovulationDetection.detected && ovulationDetection.ovulationDay && ovulationDetection.adjustedLutealPhase) {
    ovulationEstimate = ovulationDetection.ovulationDay;
    adjustedLutealPhase = ovulationDetection.adjustedLutealPhase;
    nextPeriodPredictedStart = addDaysUTC(ovulationEstimate, adjustedLutealPhase);
  } else {
    ovulationEstimate = addDaysUTC(lastPeriodStart, displayCycleLength - 14);
    nextPeriodPredictedStart = addDaysUTC(lastPeriodStart, Math.round(medianCycle));
  }

  const adjustedVariability = predictionMode === "range" ? effectiveVariability : Math.ceil(effectiveVariability / 2);

  const nextPeriodWindowStart = addDaysUTC(nextPeriodPredictedStart, -adjustedVariability);
  const nextPeriodWindowEnd = addDaysUTC(nextPeriodPredictedStart, adjustedVariability);

  const fertileWindowStart = addDaysUTC(ovulationEstimate, -5);
  const fertileWindowEnd = addDaysUTC(ovulationEstimate, 1);

  const currentPhase = estimateCurrentPhase(
    currentCycleDay,
    displayCycleLength,
    Math.round(medianPeriod)
  );

  const phaseProgress = currentPhase.daysUntilNextPhase !== null
    ? Math.round(((currentPhase.daysIntoPhase + 1) / (currentPhase.daysIntoPhase + currentPhase.daysUntilNextPhase + 1)) * 100)
    : 0;

  const ovulationProbability = calculateOvulationProbability(currentCycleDay, displayCycleLength);

  let predictionDiscrepancy: PredictionDiscrepancy | undefined;
  if (discrepancyDays > 0 && ovulationDetection.detected && predictedOvulation) {
    predictionDiscrepancy = {
      predictedOvulation,
      evidenceBasedOvulation: ovulationDetection.ovulationDay,
      adjustmentMade: discrepancyDays >= 2,
      discrepancyDays,
      source: bbtResult.detected ? "bbt" : mucusResult.detected ? "mucus" : "combined",
    };
  }

  return {
    hasHistory,
    medianCycleLength: displayCycleLength,
    medianPeriodLength: Math.round(medianPeriod),
    variabilityDays: effectiveVariability,
    cycleLengthRange,
    confidenceScore,
    irregularityLevel,
    displayCycleLength,
    predictionMode,
    lastPeriodStart,
    nextPeriodPredictedStart,
    nextPeriodWindowStart,
    nextPeriodWindowEnd,
    ovulationEstimate,
    fertileWindowStart,
    fertileWindowEnd,
    currentPhase,
    cycleDay: currentCycleDay,
    phaseProgress,
    ovulationProbability,
    ovulationEvidence: ovulationDetection.evidence ?? undefined,
    adjustedLutealPhase,
    predictionDiscrepancy,
    confidenceBreakdown,
  };
}

export function computePredictionsForDate(
  periods: PeriodLike[],
  dailyLogsOrDefaults: DailyLogLike[] | ProfileDefaults,
  maybeDefaultsOrTarget?: ProfileDefaults | Date,
  maybeTarget?: Date,
  maybeOpts?: { maxCycles?: number; minCycles?: number }
): PredictionResult & { isTargetInWindow: boolean; targetPhase: CyclePhaseDetail } {
  let dailyLogs: DailyLogLike[] = [];
  let defaults: ProfileDefaults;
  let targetDate: Date;
  let opts: { maxCycles?: number; minCycles?: number } | undefined;

  if (Array.isArray(dailyLogsOrDefaults)) {
    dailyLogs = dailyLogsOrDefaults;
    defaults = maybeDefaultsOrTarget as ProfileDefaults;
    targetDate = maybeTarget as Date;
    opts = maybeOpts;
  } else {
    defaults = dailyLogsOrDefaults;
    targetDate = maybeDefaultsOrTarget as Date;
    opts = maybeOpts;
  }

  const result = computePredictions(periods, dailyLogs, defaults, opts);

  if (!result.lastPeriodStart) {
    return {
      ...result,
      isTargetInWindow: false,
      targetPhase: PHASE_LABELS.menstruation as unknown as CyclePhaseDetail,
    };
  }

  const daysSinceLastPeriod = diffDaysUTC(targetDate, result.lastPeriodStart);
  const cycleDay = Math.max(1, daysSinceLastPeriod + 1);
  const targetPhase = estimateCurrentPhase(cycleDay, result.displayCycleLength, result.medianPeriodLength);

  return {
    ...result,
    cycleDay,
    isTargetInWindow: targetPhase.isInWindow,
    targetPhase,
  };
}

export function getPhaseWeek(phase: PredictionPhase): 1 | 2 | 3 | 4 {
  switch (phase) {
    case "menstruation":
    case "follicular_early":
      return 1;
    case "follicular_late":
    case "ovulation":
      return 2;
    case "fertile":
      return 3;
    case "luteal_early":
    case "luteal_late":
      return 4;
  }
}

export function getWellbeingGuidance(phase: PredictionPhase): string[] {
  switch (phase) {
    case "menstruation":
      return [
        "Prioritize rest and gentle movement",
        "Stay hydrated and eat iron-rich foods",
        "This is a good time for introspection",
      ];
    case "follicular_early":
      return [
        "Energy is slowly returning",
        "Good time to start new habits",
        "Light exercise can help",
      ];
    case "follicular_late":
      return [
        "Estrogen levels are rising",
        "You may feel more confident and social",
        "Great time for creative projects",
      ];
    case "ovulation":
      return [
        "Peak energy and communication skills",
        "Good time for important conversations",
        "Stay mindful of peak fertility",
      ];
    case "fertile":
      return [
        "Fertile window still active",
        "Continue healthy habits",
        "Note any ovulation symptoms",
      ];
    case "luteal_early":
      return [
        "Progesterone is dominant",
        "Focus on routine and structure",
        "Moderate exercise is beneficial",
      ];
    case "luteal_late":
      return [
        "Be gentle with yourself",
        "Reduce caffeine and salt intake",
        "Extra self-care can help with PMS",
      ];
  }
}