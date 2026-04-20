import { describe, expect, it } from "vitest";

import { buildCycleVisualizationModel } from "@/lib/cycleVisualization";

describe("buildCycleVisualizationModel", () => {
  it("builds ring segments for a stable longer cycle", () => {
    const model = buildCycleVisualizationModel({
      cycleLength: 39,
      cycleDay: 17,
      actualPeriodLength: 6,
      fertileWindowStartDay: 19,
      fertileWindowEndDay: 25,
      predictedWindowStartDay: 38,
      predictedWindowEndDay: 39,
      confidenceScore: 84,
      irregularityLevel: "long_cycle",
      cycleLengthRange: { min: 38, max: 39 },
    });

    expect(model.progressPercent).toBe(44);
    expect(model.rangeLabel).toBe("38-39 day rhythm");
    expect(model.uncertaintyLevel).toBe("low");
    expect(model.segments.map((segment) => segment.label)).toEqual([
      "Logged period",
      "Fertile window",
      "Predicted next",
    ]);
  });

  it("switches to a wider range and stronger uncertainty for irregular cycles", () => {
    const model = buildCycleVisualizationModel({
      cycleLength: 38,
      cycleDay: 22,
      actualPeriodLength: 5,
      fertileWindowStartDay: 18,
      fertileWindowEndDay: 24,
      predictedWindowStartDay: 34,
      predictedWindowEndDay: 38,
      confidenceScore: 48,
      irregularityLevel: "high_variability",
      cycleLengthRange: { min: 35, max: 41 },
    });

    expect(model.rangeLabel).toBe("35-41 days");
    expect(model.uncertaintyLevel).toBe("high");
    expect(model.centerLabel).toBe("Variable");
    expect(model.segments.find((segment) => segment.label === "Predicted next")).toMatchObject({
      startDay: 34,
      endDay: 38,
    });
  });
});
