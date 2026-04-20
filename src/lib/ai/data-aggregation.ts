import mongoose from "mongoose";
import { differenceInCalendarDays, subDays } from "date-fns";

import type { AggregatedUserData } from "@/types/ai";
import { CustomSymptom } from "@/models/CustomSymptom";
import { DailyLog } from "@/models/DailyLog";
import { DailyLogSymptom } from "@/models/DailyLogSymptom";
import { Period } from "@/models/Period";
import { Profile } from "@/models/Profile";
import { SymptomDefinition } from "@/models/SymptomDefinition";

interface DateRange {
  from: Date;
  to: Date;
}

type LeanPeriod = {
  _id: mongoose.Types.ObjectId | string;
  startDate: Date;
  endDate?: Date | null;
};

type LeanLog = {
  _id: mongoose.Types.ObjectId | string;
  logDate: Date;
  mood?: number | null;
  flow?: string | null;
  bbt?: number | null;
  mucusType?: string | null;
  sex?: boolean | null;
  notes?: string | null;
};

type LeanSymptom = {
  dailyLogId: mongoose.Types.ObjectId | string;
  symptomKey?: string | null;
  customSymptomId?: mongoose.Types.ObjectId | string;
  severity?: number | null;
};

const PHASE_THRESHOLDS = {
  ovulation: 14,
  lutealTransition: 22,
};

export async function aggregateUserDataForAI(
  userId: string,
  dateRange: DateRange
): Promise<AggregatedUserData> {
  const cycleHistoryStart = subDays(dateRange.from, 180);

  const [profile, periodsRaw, dailyLogsRaw, customSymptoms, symptomDefinitions] = await Promise.all([
    Profile.findOne({ userId }).lean(),
    Period.find({
      userId,
      startDate: { $gte: cycleHistoryStart, $lte: dateRange.to },
    })
      .sort({ startDate: 1 })
      .lean(),
    DailyLog.find({
      userId,
      logDate: { $gte: dateRange.from, $lte: dateRange.to },
    })
      .sort({ logDate: 1 })
      .lean(),
    CustomSymptom.find({ userId }).lean(),
    SymptomDefinition.find({}).lean(),
  ]);

  if (!profile) {
    throw new Error("Profile not found");
  }

  const periods = periodsRaw as LeanPeriod[];
  const dailyLogs = dailyLogsRaw as LeanLog[];
  const logIds = dailyLogs.map((log) => log._id);
  const symptoms =
    logIds.length > 0
      ? ((await DailyLogSymptom.find({
          userId,
          dailyLogId: { $in: logIds },
        }).lean()) as LeanSymptom[])
      : [];

  const cycleLengths = calculateCycleLengths(periods);
  const medianLength = calculateMedian(cycleLengths) ?? profile.cycleLengthTypical ?? 28;
  const recentRange =
    cycleLengths.length > 0
      ? { min: Math.min(...cycleLengths), max: Math.max(...cycleLengths) }
      : null;

  const moodData = analyzeMoods(dailyLogs, periods, medianLength);
  const symptomData = analyzeSymptoms(symptoms, dailyLogs, periods, symptomDefinitions, customSymptoms);
  const bodySignals = analyzeBodySignals(dailyLogs);
  const flowData = analyzeFlow(dailyLogs, periods);
  const notesData = analyzeNotes(dailyLogs, profile.aiPreferences?.privacyMode || "full_analysis");
  const loggingData = analyzeLogging(
    dailyLogs,
    profile.gamification?.currentStreak || 0,
    profile.gamification?.bestStreak || 0,
    profile.gamification?.totalLogs || 0,
    dateRange
  );

  return {
    profile: {
      ageGroup: profile.ageGroup || null,
      goalMode: profile.goalMode,
      typicalCycleLength: profile.cycleLengthTypical || 28,
      aiTonePreference: profile.aiPreferences?.toneStyle || "encouraging",
      privacyMode: profile.aiPreferences?.privacyMode || "full_analysis",
    },
    cycles: {
      count: periods.filter((period) => period.startDate >= dateRange.from && period.startDate <= dateRange.to).length,
      lengths: cycleLengths,
      medianLength,
      variability: calculateVariability(cycleLengths),
      currentCycleDay: findCurrentCycleDay(periods, dateRange.to),
      recentRange,
    },
    moods: moodData,
    symptoms: symptomData,
    bodySignals,
    flow: flowData,
    notes: notesData,
    logging: loggingData,
    dateRange,
  };
}

export function calculateCycleLengths(periods: Array<{ startDate: Date }>): number[] {
  const lengths: number[] = [];

  for (let index = 1; index < periods.length; index++) {
    const previous = periods[index - 1];
    const current = periods[index];
    const length = differenceInCalendarDays(new Date(current.startDate), new Date(previous.startDate));
    if (length > 0 && length < 90) {
      lengths.push(length);
    }
  }

  return lengths;
}

export function calculateMedian(numbers: number[]): number | null {
  if (numbers.length === 0) return null;

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
    : sorted[mid]!;
}

export function calculateVariability(lengths: number[]): "low" | "moderate" | "high" {
  if (lengths.length < 2) return "low";

  const mean = lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  const variance = lengths.reduce((sum, length) => sum + Math.pow(length - mean, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev < 3) return "low";
  if (stdDev < 7) return "moderate";
  return "high";
}

function getCyclePhase(dayOfCycle: number, cycleLength: number): string {
  const ovulationDay = Math.max(1, cycleLength - 14);
  
  if (dayOfCycle <= ovulationDay * 0.4) return "menstruation";
  if (dayOfCycle <= ovulationDay * 0.6) return "follicular_early";
  if (dayOfCycle <= ovulationDay - 1) return "follicular_late";
  if (dayOfCycle <= ovulationDay + 1) return "ovulation";
  if (dayOfCycle <= ovulationDay + 4) return "fertile";
  if (dayOfCycle <= cycleLength - 7) return "luteal_early";
  return "luteal_late";
}

function analyzeMoods(dailyLogs: LeanLog[], periods: LeanPeriod[], cycleLength: number) {
  const moodLogs = dailyLogs.filter((log) => typeof log.mood === "number");

  if (moodLogs.length === 0) {
    return {
      byPhase: { menstruation: [], follicular_early: [], follicular_late: [], ovulation: [], fertile: [], luteal_early: [], luteal_late: [] },
      trend: "stable" as const,
      averageRating: 0,
      phaseAverages: {},
      worstDay: null,
      bestDay: null,
    };
  }

  const byPhase: Record<string, number[]> = {
    menstruation: [],
    follicular_early: [],
    follicular_late: [],
    ovulation: [],
    fertile: [],
    luteal_early: [],
    luteal_late: [],
  };

  for (const log of moodLogs) {
    const cycleStart = findCycleStartForDate(new Date(log.logDate), periods);
    if (!cycleStart || typeof log.mood !== "number") continue;
    const dayOfCycle = differenceInCalendarDays(new Date(log.logDate), cycleStart.startDate) + 1;
    const phase = getCyclePhase(dayOfCycle, cycleLength);
    byPhase[phase].push(log.mood);
  }

  const phaseAverages: Record<string, number> = {};
  for (const [phase, moods] of Object.entries(byPhase)) {
    if (moods.length > 0) {
      phaseAverages[phase] = moods.reduce((a, b) => a + b, 0) / moods.length;
    }
  }

  const averageRating = moodLogs.reduce((sum, log) => sum + (log.mood as number), 0) / moodLogs.length;
  const midpoint = Math.max(1, Math.floor(moodLogs.length / 2));
  const firstHalf = moodLogs.slice(0, midpoint);
  const secondHalf = moodLogs.slice(midpoint);

  const firstAvg = firstHalf.reduce((sum, log) => sum + (log.mood as number), 0) / firstHalf.length;
  const secondAvg =
    secondHalf.length > 0
      ? secondHalf.reduce((sum, log) => sum + (log.mood as number), 0) / secondHalf.length
      : firstAvg;

  let trend: "improving" | "stable" | "declining";
  if (secondAvg - firstAvg > 0.5) trend = "improving";
  else if (firstAvg - secondAvg > 0.5) trend = "declining";
  else trend = "stable";

  const worstMood = Math.min(...moodLogs.map(l => l.mood as number));
  const bestMood = Math.max(...moodLogs.map(l => l.mood as number));
  const worstDay = moodLogs.find(l => l.mood === worstMood);
  const bestDay = moodLogs.find(l => l.mood === bestMood);

  return {
    byPhase,
    trend,
    averageRating,
    phaseAverages,
    worstDay: worstDay ? { date: worstDay.logDate, mood: worstMood } : null,
    bestDay: bestDay ? { date: bestDay.logDate, mood: bestMood } : null,
  };
}

function analyzeSymptoms(
  symptoms: LeanSymptom[],
  dailyLogs: LeanLog[],
  periods: LeanPeriod[],
  symptomDefinitions: Array<{ key: string; label: string }>,
  customSymptoms: Array<{ _id: mongoose.Types.ObjectId | string; label: string }>
) {
  const symptomMap = new Map<string, { name: string; frequency: number; totalSeverity: number }>();
  const logById = new Map(dailyLogs.map((log) => [String(log._id), log]));

  for (const symptom of symptoms) {
    const sourceLog = logById.get(String(symptom.dailyLogId));
    if (!sourceLog) continue;

    const name = getSymptomName(symptom, symptomDefinitions, customSymptoms);
    const current = symptomMap.get(name) ?? { name, frequency: 0, totalSeverity: 0 };
    current.frequency += 1;
    current.totalSeverity += symptom.severity || 1;
    symptomMap.set(name, current);
  }

  const topSymptoms = Array.from(symptomMap.values())
    .map((symptom) => ({
      name: symptom.name,
      frequency: symptom.frequency,
      severity: symptom.totalSeverity / symptom.frequency,
    }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 10);

  const correlations: Array<{ symptom: string; cyclePhase: string; strength: number; count: number }> = [];
  const cycleLength = 28;

  for (const symptom of topSymptoms.slice(0, 5)) {
    const phaseCounts: Record<string, number> = {
      menstruation: 0,
      follicular_early: 0,
      follicular_late: 0,
      ovulation: 0,
      fertile: 0,
      luteal_early: 0,
      luteal_late: 0,
    };

    for (const row of symptoms) {
      const log = logById.get(String(row.dailyLogId));
      if (!log) continue;
      if (getSymptomName(row, symptomDefinitions, customSymptoms) !== symptom.name) continue;

      const cycleStart = findCycleStartForDate(new Date(log.logDate), periods);
      if (!cycleStart) continue;

      const dayOfCycle = differenceInCalendarDays(new Date(log.logDate), cycleStart.startDate) + 1;
      const phase = getCyclePhase(dayOfCycle, cycleLength);
      phaseCounts[phase] += 1;
    }

    const total = Object.values(phaseCounts).reduce((a, b) => a + b, 0);
    if (total === 0) continue;

    const dominantPhase = Object.entries(phaseCounts).reduce((a, b) => 
      b[1] > a[1] ? b : a
    );

    if (dominantPhase[1] > total * 0.4) {
      correlations.push({
        symptom: symptom.name,
        cyclePhase: dominantPhase[0],
        strength: dominantPhase[1] / total,
        count: dominantPhase[1],
      });
    }
  }

  return {
    topSymptoms,
    correlations,
    trackedDays: new Set(symptoms.map((symptom) => String(symptom.dailyLogId))).size,
  };
}

function analyzeBodySignals(dailyLogs: LeanLog[]) {
  const bbtLogged = dailyLogs.filter((log) => typeof log.bbt === "number");
  const mucusLogged = dailyLogs.filter((log) => Boolean(log.mucusType));
  const sexFrequency = dailyLogs.filter((log) => log.sex === true).length;
  const coverage =
    dailyLogs.length > 0 ? ((bbtLogged.length + mucusLogged.length) / (dailyLogs.length * 2)) * 100 : 0;

  let bbtTrend: "rising" | "stable" | "falling" | null = null;
  if (bbtLogged.length >= 5) {
    const midpoint = Math.floor(bbtLogged.length / 2);
    const firstHalf = bbtLogged.slice(0, midpoint);
    const secondHalf = bbtLogged.slice(midpoint);
    const firstAvg = firstHalf.reduce((sum, log) => sum + (log.bbt as number), 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, log) => sum + (log.bbt as number), 0) / secondHalf.length;
    if (secondAvg > firstAvg + 0.1) bbtTrend = "rising";
    else if (secondAvg < firstAvg - 0.1) bbtTrend = "falling";
    else bbtTrend = "stable";
  }

  const mucusTypes: Record<string, number> = {};
  for (const log of mucusLogged) {
    if (log.mucusType) {
      mucusTypes[log.mucusType] = (mucusTypes[log.mucusType] || 0) + 1;
    }
  }
  const dominantMucus = Object.entries(mucusTypes).sort((a, b) => b[1] - a[1])[0];

  return {
    bbtLogged: bbtLogged.length,
    mucusLogged: mucusLogged.length,
    sexFrequency,
    coverage,
    bbtTrend,
    dominantMucusType: dominantMucus ? dominantMucus[0] : null,
  };
}

function analyzeFlow(dailyLogs: LeanLog[], periods: LeanPeriod[]) {
  const flowLogs = dailyLogs.filter((log) => Boolean(log.flow));
  
  const flowByPhase: Record<string, { count: number; total: number }> = {
    menstruation: { count: 0, total: 0 },
    follicular_early: { count: 0, total: 0 },
    follicular_late: { count: 0, total: 0 },
    ovulation: { count: 0, total: 0 },
    fertile: { count: 0, total: 0 },
    luteal_early: { count: 0, total: 0 },
    luteal_late: { count: 0, total: 0 },
  };

  const flowIntensity: Record<string, number> = {
    spotting: 1,
    light: 2,
    medium: 3,
    heavy: 4,
  };

  for (const log of flowLogs) {
    if (!log.flow) continue;
    const cycleStart = findCycleStartForDate(new Date(log.logDate), periods);
    if (!cycleStart) continue;
    const dayOfCycle = differenceInCalendarDays(new Date(log.logDate), cycleStart.startDate) + 1;
    const phase = getCyclePhase(dayOfCycle, 28);
    const intensity = flowIntensity[log.flow] || 0;
    flowByPhase[phase].count += intensity;
    flowByPhase[phase].total += 1;
  }

  const heaviestFlow = flowLogs.reduce((heaviest, log) => {
    const intensity = log.flow ? flowIntensity[log.flow] || 0 : 0;
    return intensity > heaviest.intensity ? { log, intensity } : heaviest;
  }, { log: flowLogs[0], intensity: 0 } as { log: LeanLog | undefined; intensity: number });

  return {
    totalFlowDays: flowLogs.length,
    heaviestFlowDay: heaviestFlow.log ? heaviestFlow.log.logDate : null,
    heaviestFlowType: heaviestFlow.log?.flow || null,
    flowByPhase,
  };
}

function analyzeNotes(dailyLogs: LeanLog[], privacyMode: string) {
  const notesArray = dailyLogs
    .map((log) => log.notes?.trim())
    .filter((note): note is string => Boolean(note));

  if (privacyMode === "patterns_only") {
    return {
      commonThemes: [],
      emotionalTone: "neutral" as const,
      notesCount: notesArray.length,
    };
  }

  return {
    commonThemes: extractKeywords(notesArray),
    emotionalTone: analyzeEmotionalTone(notesArray),
    notesCount: notesArray.length,
  };
}

function analyzeLogging(
  dailyLogs: LeanLog[],
  currentStreak: number,
  bestStreak: number,
  totalLogs: number,
  dateRange: DateRange
) {
  const loggedDays = new Set(dailyLogs.map((log) => new Date(log.logDate).toISOString().slice(0, 10))).size;
  const daysInRange = differenceInCalendarDays(dateRange.to, dateRange.from) + 1;
  const consistency = Math.min(100, (loggedDays / Math.max(1, daysInRange)) * 100);

  return {
    currentStreak,
    bestStreak,
    totalLogs: totalLogs || dailyLogs.length,
    consistency,
    loggedDays,
    daysInRange,
  };
}

function findCycleStartForDate(date: Date, periods: LeanPeriod[]) {
  let cycleStart: LeanPeriod | null = null;
  for (const period of periods) {
    if (new Date(period.startDate) <= date) {
      cycleStart = period;
      continue;
    }
    break;
  }
  return cycleStart;
}

function findCurrentCycleDay(periods: LeanPeriod[], date: Date) {
  const cycleStart = findCycleStartForDate(date, periods);
  if (!cycleStart) return null;
  return differenceInCalendarDays(date, cycleStart.startDate) + 1;
}

function getSymptomName(
  symptom: LeanSymptom,
  symptomDefinitions: Array<{ key: string; label: string }>,
  customSymptoms: Array<{ _id: mongoose.Types.ObjectId | string; label: string }>
): string {
  if (symptom.symptomKey) {
    const definition = symptomDefinitions.find((item) => item.key === symptom.symptomKey);
    return definition?.label || symptom.symptomKey;
  }

  if (symptom.customSymptomId) {
    const custom = customSymptoms.find((item) => String(item._id) === String(symptom.customSymptomId));
    return custom?.label || "Custom symptom";
  }

  return "Unknown symptom";
}

function extractKeywords(notes: string[]): string[] {
  const allText = notes.join(" ").toLowerCase();
  const keywords = [
    "headache",
    "tired",
    "stress",
    "anxious",
    "cramps",
    "bloat",
    "mood",
    "energy",
    "sleep",
    "pain",
    "nausea",
    "backache",
  ];

  return keywords.filter((keyword) =>
    allText.split(/\s+/).filter((word) => word.includes(keyword)).length >= 2
  );
}

function analyzeEmotionalTone(notes: string[]): "positive" | "neutral" | "negative" {
  const allText = notes.join(" ").toLowerCase();
  const positiveWords = ["good", "great", "happy", "better", "fine", "well", "relaxed", "calm"];
  const negativeWords = ["bad", "awful", "terrible", "worse", "pain", "hurt", "sad", "stressed", "anxious", "exhausted"];

  const positiveCount = positiveWords.reduce(
    (count, word) => count + (allText.match(new RegExp(`\\b${word}\\b`, "g")) || []).length,
    0
  );
  const negativeCount = negativeWords.reduce(
    (count, word) => count + (allText.match(new RegExp(`\\b${word}\\b`, "g")) || []).length,
    0
  );

  if (positiveCount > negativeCount * 1.5) return "positive";
  if (negativeCount > positiveCount * 1.5) return "negative";
  return "neutral";
}

export function sanitizeNotesForAI(notes: string[]): string[] {
  return notes.map((note) => {
    let sanitized = note;
    sanitized = sanitized.replace(/\S+@\S+\.\S+/g, "[email]");
    sanitized = sanitized.replace(/\d{3}[-.]?\d{3}[-.]?\d{4}/g, "[phone]");

    if (sanitized.length > 500) {
      sanitized = `${sanitized.substring(0, 500)}...`;
    }

    return sanitized;
  });
}
