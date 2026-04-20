import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AIStreamingCard from "@/components/ai-analytics/AIStreamingCard";
import type { AggregatedUserData } from "@/types/ai";

const sampleData: AggregatedUserData = {
  profile: {
    ageGroup: "adult",
    goalMode: "track",
    typicalCycleLength: 28,
    aiTonePreference: "encouraging",
    privacyMode: "full_analysis",
  },
  cycles: {
    count: 1,
    lengths: [28],
    medianLength: 28,
    variability: "low",
    currentCycleDay: 4,
    recentRange: { min: 28, max: 28 },
  },
  moods: {
    byPhase: { follicular_early: [4], follicular_late: [], ovulation: [], fertile: [], luteal_early: [3], luteal_late: [], menstruation: [] },
    trend: "stable",
    averageRating: 3.5,
  },
  symptoms: {
    topSymptoms: [],
    correlations: [],
    trackedDays: 0,
  },
  bodySignals: {
    bbtLogged: 0,
    mucusLogged: 0,
    sexFrequency: 0,
    coverage: 0,
  },
  notes: {
    commonThemes: [],
    emotionalTone: "neutral",
  },
  logging: {
    currentStreak: 1,
    bestStreak: 1,
    totalLogs: 1,
    consistency: 10,
    loggedDays: 1,
    daysInRange: 30,
  },
  dateRange: {
    from: new Date("2026-04-01T00:00:00.000Z"),
    to: new Date("2026-04-30T23:59:59.999Z"),
  },
};

describe("AIStreamingCard", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        headers: new Headers({ "Content-Type": "text/event-stream" }),
        body: new ReadableStream<Uint8Array>({
          start(controller) {
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode('data: {"choices":[{"del'));
            controller.enqueue(encoder.encode('ta":{"content":"Hello"}}]}\n\n'));
            controller.enqueue(
              encoder.encode(
                'data: {"choices":[{"delta":{"content":"<script>alert(1)</script>"}}]}\n\ndata: [DONE]\n'
              )
            );
            controller.close();
          },
        }),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses split SSE chunks and renders model text without injecting HTML", async () => {
    const { container } = render(
      <AIStreamingCard
        title="Pattern insights"
        analysisType="pattern_detection"
        icon={<span>Icon</span>}
        color="teal"
        aggregatedData={sampleData}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Hello/)).toBeInTheDocument();
      expect(screen.getByText(/<script>alert\(1\)<\/script>/)).toBeInTheDocument();
    });

    expect(container.querySelector("script")).toBeNull();
  });
});
