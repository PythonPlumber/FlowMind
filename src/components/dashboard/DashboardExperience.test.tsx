import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardExperience } from "@/components/dashboard/DashboardExperience";
import { buildCycleVisualizationModel } from "@/lib/cycleVisualization";

describe("DashboardExperience", () => {
  it("renders the dashboard as a hero-led cycle workspace", () => {
    render(
      <DashboardExperience
        todayLabel="2026-04-14"
        age={26}
        goalMode="conceive"
        phaseLabel="Late follicular phase"
        phaseDescription="Rising estrogen. You may feel more confident and social."
        cycleRing={buildCycleVisualizationModel({
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
        })}
        predictions={{
          hasHistory: true,
          medianCycleLength: 39,
          medianPeriodLength: 5,
          variabilityDays: 2,
          cycleLengthRange: { min: 38, max: 39 },
          confidenceScore: 84,
          irregularityLevel: "long_cycle",
          displayCycleLength: 39,
          predictionMode: "single",
          lastPeriodStart: new Date("2026-03-29"),
          nextPeriodPredictedStart: new Date("2026-04-29"),
          nextPeriodWindowStart: new Date("2026-04-27"),
          nextPeriodWindowEnd: new Date("2026-05-01"),
          ovulationEstimate: new Date("2026-04-15"),
          fertileWindowStart: new Date("2026-04-10"),
          fertileWindowEnd: new Date("2026-04-16"),
          currentPhase: {
            phase: "follicular_late",
            phaseLabel: "Late Follicular",
            phaseDescription: "Rising estrogen. You may feel more confident and social.",
            daysIntoPhase: 3,
            daysUntilNextPhase: 4,
            isInWindow: false,
          },
          cycleDay: 17,
          phaseProgress: 50,
          ovulationProbability: 0.1,
        }}
        cycleHealth={[
          { label: "Current cycle day", value: "17" },
          { label: "Usual range", value: "38-39 days" },
          { label: "Current confidence", value: "84%" },
          { label: "Pattern", value: "Long-cycle pattern observed" },
          { label: "Last period", value: "2026-03-29" },
          { label: "Goal-aware note", value: "Fertile estimate is approaching." },
        ]}
        nextPeriodWindow={{ start: "2026-04-29", end: "2026-04-30", variabilityLabel: "Low swing", daysAway: 15 }}
        fertileWindow={{ start: "2026-04-16", end: "2026-04-22", daysAway: 2 }}
        latestLog={{
          date: "2026-04-14",
          mood: 4,
          flow: "heavy",
          bbt: 36.7,
          mucusType: "watery",
          sex: true,
          contraception: "Condom",
          notes: "Lower energy in the evening.",
        }}
        trackingStreak={6}
        confidenceLabel="High confidence"
        rhythmLabel="Long-cycle rhythm"
      />
    );

    expect(screen.getByRole("heading", { name: "Late follicular phase" })).toBeInTheDocument();
    expect(screen.getByLabelText("Adaptive cycle ring")).toBeInTheDocument();
    expect(screen.getByText("Latest check-in")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Month analytics" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open dashboard actions" })).toBeInTheDocument();
    expect(screen.getAllByText("6 day streak").length).toBeGreaterThan(0);
    expect(screen.getByText("Estimates only. Not medical advice and not birth control.")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /open calendar/i }).length).toBeGreaterThan(0);
  });
});
