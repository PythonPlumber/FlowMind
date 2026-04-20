import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import AIAnalyticsExperience from "@/components/ai-analytics/AIAnalyticsExperience";
import type { AggregatedUserData } from "@/types/ai";

vi.mock("@/components/ai-analytics/AIStreamingCard", () => ({
  default: ({ title }: { title: string }) => <div>{title}</div>,
}));

vi.mock("@/components/ai-analytics/MotivationWidget", () => ({
  default: () => <div>Motivation</div>,
}));

vi.mock("@/components/ai-analytics/AIQuestionCard", () => ({
  default: () => <div>Ask about this month</div>,
}));

const initialData: AggregatedUserData = {
  profile: {
    ageGroup: "adult",
    goalMode: "conceive",
    typicalCycleLength: 34,
    aiTonePreference: "encouraging",
    privacyMode: "full_analysis",
  },
  cycles: {
    count: 3,
    lengths: [34, 35, 33],
    medianLength: 34,
    variability: "moderate",
    currentCycleDay: 17,
    recentRange: { min: 33, max: 35 },
  },
  moods: {
    byPhase: { follicular_early: [4, 5], follicular_late: [], ovulation: [], fertile: [], luteal_early: [3], luteal_late: [2], menstruation: [] },
    trend: "stable",
    averageRating: 3.5,
  },
  symptoms: {
    topSymptoms: [{ name: "Cramps", frequency: 4, severity: 2 }],
    correlations: [{ symptom: "Cramps", cyclePhase: "luteal", strength: 0.7 }],
    trackedDays: 4,
  },
  bodySignals: {
    bbtLogged: 5,
    mucusLogged: 3,
    sexFrequency: 1,
    coverage: 26,
  },
  notes: {
    commonThemes: ["stress"],
    emotionalTone: "neutral",
  },
  logging: {
    currentStreak: 6,
    bestStreak: 10,
    totalLogs: 24,
    consistency: 58,
    loggedDays: 18,
    daysInRange: 30,
  },
  dateRange: {
    from: new Date("2026-04-01T00:00:00.000Z"),
    to: new Date("2026-04-30T23:59:59.999Z"),
  },
};

describe("AIAnalyticsExperience", () => {
  it("renders the calmer monthly AI workspace and reveals deeper analysis on demand", async () => {
    const user = userEvent.setup();

    render(
      <AIAnalyticsExperience
        initialData={initialData}
        gamificationStats={{
          currentStreak: 6,
          bestStreak: 10,
          totalLogs: 24,
          achievements: ["first_log"],
        }}
        profile={{
          ageGroup: "adult",
          aiTonePreference: "encouraging",
          emotionalSupportLevel: "full",
        }}
        monthContext={{
          monthLabel: "April 2026",
          monthParam: "current",
          previousHref: "/ai-analytics?month=1",
          nextHref: null,
          currentHref: "/ai-analytics?month=current",
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "April 2026" })).toBeInTheDocument();
    expect(screen.getAllByText("April 2026").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Current month" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Earlier month" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Run monthly AI analysis" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Run monthly AI analysis" }));

    expect(screen.getByText("Pattern insights")).toBeInTheDocument();
    expect(screen.getByText("Ask about this month")).toBeInTheDocument();
  });
});
