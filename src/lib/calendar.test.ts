import { describe, expect, it } from "vitest";

import { buildCalendarMonth } from "@/lib/calendar";

describe("buildCalendarMonth", () => {
  it("keeps actual, predicted, fertile, today, and selected state together", () => {
    const month = buildCalendarMonth({
      year: 2026,
      month: 4,
      todayIso: "2026-04-14",
      selectedIso: "2026-04-14",
      actualDays: new Set(["2026-04-14"]),
      predictedDays: new Set(["2026-04-14", "2026-04-15"]),
      fertileDays: new Set(["2026-04-12", "2026-04-13", "2026-04-14"]),
      logSignals: {
        "2026-04-14": { hasLog: true, hasSymptoms: true, hasNotes: true },
      },
    });

    const selected = month.cells.find((cell) => cell?.iso === "2026-04-14");

    expect(selected).toMatchObject({
      iso: "2026-04-14",
      isActual: true,
      isPredicted: true,
      isFertile: true,
      isToday: true,
      isSelected: true,
      hasLog: true,
      hasSymptoms: true,
      hasNotes: true,
      statePriority: "period",
    });
    expect(month.monthLabel).toBe("April 2026");
  });
});
