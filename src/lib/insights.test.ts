import { describe, expect, it } from "vitest";

import { buildInsightsSummary } from "@/lib/insights";

describe("buildInsightsSummary", () => {
  it("summarizes cycle stability and leading symptom insights", () => {
    const summary = buildInsightsSummary({
      cyclePoints: [
        { date: "2026-01-10", length: 29 },
        { date: "2026-02-08", length: 28 },
        { date: "2026-03-08", length: 30 },
      ],
      periodPoints: [
        { date: "2026-01-10", length: 5 },
        { date: "2026-02-08", length: 4 },
        { date: "2026-03-08", length: 5 },
      ],
      moodPoints: [
        { date: "2026-03-10", mood: 4 },
        { date: "2026-03-11", mood: 3 },
        { date: "2026-03-12", mood: 5 },
      ],
      symptomTop: [{ label: "Cramps", count: 7 }],
    });

    expect(summary.typicalCycle).toBe("29 days");
    expect(summary.typicalPeriod).toBe("5 days");
    expect(summary.variability).toBe("Low");
    expect(summary.averageMood).toBe("4.0 / 5");
    expect(summary.highlight).toContain("Cramps");
  });
});
