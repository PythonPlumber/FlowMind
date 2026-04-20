import type { PredictionPhase } from "@/lib/predictions";

export type CycleVisualizationSegment = {
  label: string;
  tone: "period" | "fertile" | "predicted" | "phase";
  startDay: number;
  endDay: number;
  phase?: PredictionPhase;
};

export type CycleVisualizationModel = {
  cycleLength: number;
  cycleDay: number | null;
  progressPercent: number;
  confidenceScore: number;
  irregularityLevel: "building" | "stable" | "shifting" | "high_variability" | "long_cycle";
  uncertaintyLevel: "low" | "medium" | "high";
  centerLabel: string;
  rangeLabel: string;
  segments: CycleVisualizationSegment[];
  phaseSegments: Array<{
    phase: PredictionPhase;
    label: string;
    startDay: number;
    endDay: number;
    isActive: boolean;
    color: string;
  }>;
  nextKeyDate: {
    label: string;
    date: string;
    daysAway: number;
  } | null;
  fertilityLevel: "low" | "peak" | "post";
  ovulationDay: number | null;
};

function clampDay(day: number, cycleLength: number) {
  return Math.max(1, Math.min(cycleLength, Math.round(day)));
}

function getPhaseColor(phase: PredictionPhase, isActive: boolean): string {
  const colors: Record<PredictionPhase, { active: string; inactive: string }> = {
    menstruation: { active: "#e7a63a", inactive: "rgba(231,166,58,0.25)" },
    follicular_early: { active: "#a78bcd", inactive: "rgba(167,139,205,0.25)" },
    follicular_late: { active: "#8b5cf6", inactive: "rgba(139,92,246,0.25)" },
    ovulation: { active: "#ec4899", inactive: "rgba(236,72,153,0.25)" },
    fertile: { active: "#5f8f72", inactive: "rgba(95,143,114,0.25)" },
    luteal_early: { active: "#7387ff", inactive: "rgba(115,135,255,0.25)" },
    luteal_late: { active: "#b12b57", inactive: "rgba(177,43,87,0.25)" },
  };
  return isActive ? colors[phase].active : colors[phase].inactive;
}

const PHASE_ORDER: PredictionPhase[] = [
  "menstruation",
  "follicular_early",
  "follicular_late",
  "ovulation",
  "fertile",
  "luteal_early",
  "luteal_late",
];

export function buildCycleVisualizationModel(input: {
  cycleLength: number;
  cycleDay: number | null;
  actualPeriodLength: number;
  fertileWindowStartDay: number | null;
  fertileWindowEndDay: number | null;
  predictedWindowStartDay: number | null;
  predictedWindowEndDay: number | null;
  confidenceScore: number;
  irregularityLevel: "building" | "stable" | "shifting" | "high_variability" | "long_cycle";
  cycleLengthRange: { min: number; max: number };
  ovulationEstimateDay?: number | null;
  currentPhase?: PredictionPhase | null;
  daysUntilNextPeriod?: number | null;
  ovulationProbability?: number;
}): CycleVisualizationModel {
  const segments: CycleVisualizationSegment[] = [];
  const ovulationDay = input.ovulationEstimateDay ?? (input.cycleLength - 14);

  if (input.actualPeriodLength > 0) {
    segments.push({
      label: "Logged period",
      tone: "period",
      startDay: 1,
      endDay: clampDay(input.actualPeriodLength, input.cycleLength),
    });
  }

  if (input.fertileWindowStartDay && input.fertileWindowEndDay) {
    segments.push({
      label: "Fertile window",
      tone: "fertile",
      startDay: clampDay(input.fertileWindowStartDay, input.cycleLength),
      endDay: clampDay(input.fertileWindowEndDay, input.cycleLength),
    });
  }

  if (input.predictedWindowStartDay && input.predictedWindowEndDay) {
    segments.push({
      label: "Predicted next",
      tone: "predicted",
      startDay: clampDay(input.predictedWindowStartDay, input.cycleLength),
      endDay: clampDay(input.predictedWindowEndDay, input.cycleLength),
    });
  }

  const phaseSegments: CycleVisualizationModel["phaseSegments"] = [];
  const phaseDurations: Record<PredictionPhase, number> = {
    menstruation: Math.max(1, input.actualPeriodLength || 4),
    follicular_early: 3,
    follicular_late: Math.max(1, ovulationDay - 6),
    ovulation: 1,
    fertile: 4,
    luteal_early: 7,
    luteal_late: Math.max(1, input.cycleLength - ovulationDay - 5),
  };

  let dayCounter = 1;
  for (const phase of PHASE_ORDER) {
    const duration = phaseDurations[phase];
    const startDay = dayCounter;
    const endDay = Math.min(dayCounter + duration - 1, input.cycleLength);
    
    if (startDay <= input.cycleLength) {
      const isActive = input.currentPhase === phase;
      phaseSegments.push({
        phase,
        label: phase.charAt(0).toUpperCase() + phase.slice(1).replace(/_/g, " "),
        startDay,
        endDay,
        isActive,
        color: getPhaseColor(phase, isActive),
      });
    }
    
    dayCounter += duration;
    if (dayCounter > input.cycleLength) break;
  }

  let fertilityLevel: CycleVisualizationModel["fertilityLevel"] = "low";
  if (input.currentPhase === "ovulation" || input.currentPhase === "fertile") {
    fertilityLevel = "peak";
  } else if (input.currentPhase === "luteal_early" || input.currentPhase === "luteal_late") {
    fertilityLevel = "post";
  }

  const rangeLabel =
    input.cycleLengthRange.min === input.cycleLengthRange.max
      ? `${input.cycleLengthRange.min} day rhythm`
      : input.irregularityLevel === "high_variability"
        ? `${input.cycleLengthRange.min}-${input.cycleLengthRange.max} days`
        : `${input.cycleLengthRange.min}-${input.cycleLengthRange.max} day rhythm`;

  let centerLabel = `${input.cycleLength} days`;
  if (input.irregularityLevel === "high_variability") {
    centerLabel = "Variable";
  } else if (input.irregularityLevel === "long_cycle") {
    centerLabel = `${input.cycleLength}+ days`;
  }

  let nextKeyDate: CycleVisualizationModel["nextKeyDate"] = null;
  const daysUntilNext = input.daysUntilNextPeriod ?? null;
  if (daysUntilNext !== null && daysUntilNext > 0) {
    nextKeyDate = {
      label: "Next period in",
      date: "",
      daysAway: daysUntilNext,
    };
  } else if (ovulationDay && input.cycleDay && input.cycleDay < ovulationDay - 2) {
    const daysToOvulation = ovulationDay - input.cycleDay;
    nextKeyDate = {
      label: "Ovulation in",
      date: "",
      daysAway: daysToOvulation,
    };
  }

  return {
    cycleLength: input.cycleLength,
    cycleDay: input.cycleDay,
    progressPercent: input.cycleDay
      ? Math.max(0, Math.min(100, Math.round((input.cycleDay / input.cycleLength) * 100)))
      : 0,
    confidenceScore: input.confidenceScore,
    irregularityLevel: input.irregularityLevel,
    uncertaintyLevel:
      input.confidenceScore >= 75 ? "low" : input.confidenceScore >= 50 ? "medium" : "high",
    centerLabel,
    rangeLabel,
    segments,
    phaseSegments,
    nextKeyDate,
    fertilityLevel,
    ovulationDay: ovulationDay > 0 ? ovulationDay : null,
  };
}

export function getPhaseEmoji(phase: PredictionPhase): string {
  const emojis: Record<PredictionPhase, string> = {
    menstruation: "🌸",
    follicular_early: "🌱",
    follicular_late: "🌿",
    ovulation: "✨",
    fertile: "💚",
    luteal_early: "🍃",
    luteal_late: "🍂",
  };
  return emojis[phase];
}
