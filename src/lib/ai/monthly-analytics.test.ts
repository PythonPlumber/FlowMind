import { describe, expect, it } from "vitest";

import { buildAnalysisReadiness, resolveAnalyticsMonth } from "@/lib/ai/monthly-analytics";
import type { AggregatedUserData } from "@/types/ai";

const sampleData: AggregatedUserData = {
  profile: {
    ageGroup: "adult",
    goalMode: "track",
    typicalCycleLength: 34,
    aiTonePreference: "encouraging",
    privacyMode: "full_analysis",
  },
  cycles: {
    count: 3,
    lengths: [33, 35, 34],
    medianLength: 34,
    variability: "moderate",
    currentCycleDay: 18,
    recentRange: { min: 33, max: 35 },
  },
  moods: {
    byPhase: {
      follicular_early: [4, 5],
      follicular_late: [],
      ovulation: [],
      fertile: [],
      luteal_early: [3],
      luteal_late: [2],
      menstruation: [],
    },
    trend: "stable",
    averageRating: 3.5,
  },
  symptoms: {
    topSymptoms: [{ name: "Cramps", frequency: 4, severity: 2.2 }],
    correlations: [{ symptom: "Cramps", cyclePhase: "luteal", strength: 0.76 }],
    trackedDays: 5,
  },
  bodySignals: {
    bbtLogged: 6,
    mucusLogged: 4,
    sexFrequency: 2,
    coverage: 33,
  },
  notes: {
    commonThemes: ["sleep", "stress"],
    emotionalTone: "neutral",
  },
  logging: {
    currentStreak: 5,
    bestStreak: 12,
    totalLogs: 40,
    consistency: 60,
    loggedDays: 18,
    daysInRange: 30,
  },
  dateRange: {
    from: new Date("2026-04-01T00:00:00.000Z"),
    to: new Date("2026-04-30T23:59:59.999Z"),
  },
};

describe("resolveAnalyticsMonth", () => {
  it("returns the current month window and navigation links", () => {
    const result = resolveAnalyticsMonth("current", new Date("2026-04-14T12:00:00.000Z"));

    expect(result.monthParam).toBe("current");
    expect(result.monthLabel).toBe("April 2026");
    expect(result.from.toISOString()).toBe("2026-04-01T00:00:00.000Z");
    expect(result.previousMonthParam).toBe("1");
    expect(result.nextMonthParam).toBeNull();
  });

  it("supports earlier months using numeric params", () => {
    const result = resolveAnalyticsMonth("2", new Date("2026-04-14T12:00:00.000Z"));

    expect(result.monthParam).toBe("2");
    expect(result.monthLabel).toBe("February 2026");
    expect(result.previousMonthParam).toBe("3");
    expect(result.nextMonthParam).toBe("1");
  });
});

describe("buildAnalysisReadiness", () => {
  it("marks a rich month dataset as ready", () => {
    const readiness = buildAnalysisReadiness(sampleData);

    expect(readiness.level).toBe("ready");
    expect(readiness.coverageLabel).toBe("18 of 30 days logged");
    expect(readiness.supportingPoints).toContain("Cycle history is strong enough for adaptive interpretation.");
  });

  it("falls back to a truthful low-data state", () => {
    const readiness = buildAnalysisReadiness({
      ...sampleData,
      cycles: { ...sampleData.cycles, count: 0, lengths: [], medianLength: 34, recentRange: null },
      logging: { ...sampleData.logging, loggedDays: 2, consistency: 7 },
      symptoms: { ...sampleData.symptoms, topSymptoms: [], trackedDays: 0 },
      bodySignals: { ...sampleData.bodySignals, coverage: 0, bbtLogged: 0, mucusLogged: 0 },
    });

    expect(readiness.level).toBe("early");
    expect(readiness.coverageLabel).toBe("2 of 30 days logged");
    expect(readiness.summary).toContain("still building");
  });
});
