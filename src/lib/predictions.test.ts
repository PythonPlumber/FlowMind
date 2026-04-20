import { describe, expect, it } from "vitest";

import { dateOnlyToUTCDate, utcDateToISODate } from "@/lib/dateOnly";
import { computePredictions } from "@/lib/predictions";

describe("computePredictions", () => {
  it("returns null predictions when no periods exist", () => {
    const res = computePredictions([], {
      cycleLengthTypical: 28,
      periodLengthTypical: 5,
    });

    expect(res.nextPeriodPredictedStart).toBeNull();
    expect(res.fertileWindowStart).toBeNull();
  });

  it("predicts next period and fertile window from history", () => {
    const periods = [
      { startDate: dateOnlyToUTCDate("2026-04-26"), endDate: dateOnlyToUTCDate("2026-04-30") },
      { startDate: dateOnlyToUTCDate("2026-03-29"), endDate: dateOnlyToUTCDate("2026-04-02") },
      { startDate: dateOnlyToUTCDate("2026-03-01"), endDate: dateOnlyToUTCDate("2026-03-05") },
      { startDate: dateOnlyToUTCDate("2026-02-01"), endDate: dateOnlyToUTCDate("2026-02-05") },
    ];

    const res = computePredictions(periods, {
      cycleLengthTypical: 28,
      periodLengthTypical: 5,
    });

    expect(res.nextPeriodPredictedStart && utcDateToISODate(res.nextPeriodPredictedStart)).toBe("2026-05-24");
    expect(res.fertileWindowStart && utcDateToISODate(res.fertileWindowStart)).toBe("2026-05-05");
    expect(res.fertileWindowEnd && utcDateToISODate(res.fertileWindowEnd)).toBe("2026-05-11");
  });

  it("adapts display range and confidence for longer but stable cycles", () => {
    const periods = [
      { startDate: dateOnlyToUTCDate("2026-05-17"), endDate: dateOnlyToUTCDate("2026-05-22") },
      { startDate: dateOnlyToUTCDate("2026-04-08"), endDate: dateOnlyToUTCDate("2026-04-13") },
      { startDate: dateOnlyToUTCDate("2026-03-01"), endDate: dateOnlyToUTCDate("2026-03-06") },
      { startDate: dateOnlyToUTCDate("2026-01-21"), endDate: dateOnlyToUTCDate("2026-01-26") },
    ];

    const res = computePredictions(periods, {
      cycleLengthTypical: 28,
      periodLengthTypical: 5,
    });

    expect(res.displayCycleLength).toBe(39);
    expect(res.cycleLengthRange).toEqual({ min: 38, max: 39 });
    expect(res.irregularityLevel).toBe("long_cycle");
    expect(res.confidenceScore).toBeGreaterThanOrEqual(50);
    expect(res.predictionMode).toBe("single");
  });

  it("widens prediction windows and reduces confidence for inconsistent cycles", () => {
    const periods = [
      { startDate: dateOnlyToUTCDate("2026-05-16"), endDate: dateOnlyToUTCDate("2026-05-21") },
      { startDate: dateOnlyToUTCDate("2026-04-06"), endDate: dateOnlyToUTCDate("2026-04-11") },
      { startDate: dateOnlyToUTCDate("2026-03-01"), endDate: dateOnlyToUTCDate("2026-03-05") },
      { startDate: dateOnlyToUTCDate("2026-01-19"), endDate: dateOnlyToUTCDate("2026-01-25") },
      { startDate: dateOnlyToUTCDate("2025-12-15"), endDate: dateOnlyToUTCDate("2025-12-20") },
    ];

    const res = computePredictions(periods, {
      cycleLengthTypical: 28,
      periodLengthTypical: 5,
    });

    expect(res.cycleLengthRange).toEqual({ min: 35, max: 41 });
    expect(res.variabilityDays).toBeGreaterThanOrEqual(4);
    expect(res.confidenceScore).toBeLessThanOrEqual(60);
    expect(res.irregularityLevel).toBe("high_variability");
    expect(res.predictionMode).toBe("range");
  });
});
