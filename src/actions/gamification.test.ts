import { describe, expect, it } from "vitest";

import { calculateStreakMetrics } from "@/lib/gamification/streaks";

describe("calculateStreakMetrics", () => {
  it("keeps the current streak tied to the most recent contiguous UTC dates", () => {
    const metrics = calculateStreakMetrics(
      [
        new Date("2026-04-19T00:00:00.000Z"),
        new Date("2026-04-18T00:00:00.000Z"),
        new Date("2026-04-10T00:00:00.000Z"),
        new Date("2026-04-09T00:00:00.000Z"),
      ],
      new Date("2026-04-19T12:00:00.000Z")
    );

    expect(metrics).toEqual({
      currentStreak: 2,
      bestStreak: 2,
      totalLogs: 4,
    });
  });

  it("does not let an old backfilled log corrupt the active streak", () => {
    const metrics = calculateStreakMetrics(
      [
        new Date("2026-04-19T00:00:00.000Z"),
        new Date("2026-04-18T00:00:00.000Z"),
        new Date("2026-04-01T00:00:00.000Z"),
      ],
      new Date("2026-04-19T12:00:00.000Z")
    );

    expect(metrics.currentStreak).toBe(2);
    expect(metrics.bestStreak).toBe(2);
    expect(metrics.totalLogs).toBe(3);
  });
});
