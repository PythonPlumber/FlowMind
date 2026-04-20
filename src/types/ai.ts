export type AnalysisType =
  | "pattern_detection"
  | "health_coaching"
  | "emotional_support"
  | "monthly_summary"
  | "symptom_suggestion";

export type ToneStyle = "gentle" | "encouraging" | "celebratory";
export type AgeGroup = "teen" | "adult" | null;
export type PrivacyMode = "full_analysis" | "patterns_only";
export type EmotionalSupportLevel = "minimal" | "moderate" | "full";

export interface AIPreferences {
  toneStyle: ToneStyle;
  privacyMode: PrivacyMode;
  emotionalSupportLevel: EmotionalSupportLevel;
  lastAIInteraction?: Date;
}

export interface GamificationData {
  currentStreak: number;
  bestStreak: number;
  totalLogs: number;
  achievements: string[];
}

export type CyclePhase = 
  | "menstruation"
  | "follicular_early"
  | "follicular_late"
  | "ovulation"
  | "fertile"
  | "luteal_early"
  | "luteal_late";

export interface AggregatedUserData {
  profile: {
    ageGroup: AgeGroup;
    goalMode: "track" | "conceive" | "avoid";
    typicalCycleLength: number;
    aiTonePreference: ToneStyle;
    privacyMode: PrivacyMode;
  };
  cycles: {
    count: number;
    lengths: number[];
    medianLength: number;
    variability: "low" | "moderate" | "high";
    currentCycleDay: number | null;
    recentRange: {
      min: number;
      max: number;
    } | null;
  };
  moods: {
    byPhase: Record<CyclePhase, number[]>;
    trend: "improving" | "stable" | "declining";
    averageRating: number;
    phaseAverages?: Record<string, number>;
    worstDay?: { date: Date; mood: number } | null;
    bestDay?: { date: Date; mood: number } | null;
  };
  symptoms: {
    topSymptoms: Array<{
      name: string;
      frequency: number;
      severity: number;
    }>;
    correlations: Array<{
      symptom: string;
      cyclePhase: string;
      strength: number;
      count?: number;
    }>;
    trackedDays: number;
  };
  bodySignals: {
    bbtLogged: number;
    mucusLogged: number;
    sexFrequency: number;
    coverage: number;
    bbtTrend?: "rising" | "stable" | "falling" | null;
    dominantMucusType?: string | null;
  };
  flow?: {
    totalFlowDays: number;
    heaviestFlowDay?: Date | null;
    heaviestFlowType?: string | null;
    flowByPhase?: Record<CyclePhase, { count: number; total: number }>;
  };
  notes: {
    commonThemes: string[];
    emotionalTone: "positive" | "neutral" | "negative";
    notesCount?: number;
  };
  logging: {
    currentStreak: number;
    bestStreak: number;
    totalLogs: number;
    consistency: number;
    loggedDays: number;
    daysInRange: number;
  };
  dateRange: {
    from: Date;
    to: Date;
  };
}

export interface AIResponse {
  content: string;
  cached?: boolean;
  cacheAge?: string;
}

export interface StreamingAIResponse {
  stream: ReadableStream<Uint8Array>;
}

export interface RateLimitInfo {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface Achievement {
  id: string;
  label: string;
  emoji: string;
  description: string;
}

export interface StreakData {
  current: number;
  best: number;
  totalLogs: number;
  lastLogDate?: Date;
}
