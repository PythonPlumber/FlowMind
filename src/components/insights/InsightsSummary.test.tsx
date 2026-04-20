import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InsightsSummary } from "@/components/insights/InsightsSummary";

describe("InsightsSummary", () => {
  it("renders a concise hero strip with summary metrics and one interpretation surface", () => {
    render(
      <InsightsSummary
        typicalCycle="34 days"
        typicalPeriod="5 days"
        variability="Moderate"
        averageMood="3.5 / 5"
        highlight="Recent cycles are steady enough for trend reading."
      />
    );

    expect(screen.getByText("34 days")).toBeInTheDocument();
    expect(screen.getByText("Recent cycles are steady enough for trend reading.")).toBeInTheDocument();
  });
});
