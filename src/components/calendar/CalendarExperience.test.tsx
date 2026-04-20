import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarExperience } from "@/components/calendar/CalendarExperience";

describe("CalendarExperience", () => {
  it("renders cycle view controls and calendar actions", () => {
    render(
      <CalendarExperience
        monthLabel="April 2026"
        monthParam="2026-04"
        view="cycle"
        viewLinks={{
          month: "/calendar?m=2026-04&view=month",
          cycle: "/calendar?m=2026-04&view=cycle",
        }}
        cells={[
          {
            iso: "2026-04-14",
            day: 14,
            isActual: true,
            isPredicted: true,
            isFertile: true,
            isToday: true,
            isSelected: true,
            hasLog: true,
            hasSymptoms: true,
            hasNotes: true,
            statePriority: "period",
          },
        ]}
        prevHref="/calendar?m=2026-03&view=cycle&d=2026-04-14"
        todayHref="/calendar?m=2026-04&view=cycle&d=2026-04-14"
        nextHref="/calendar?m=2026-05&view=cycle&d=2026-04-14"
        loggedDaysCount={8}
        monthSummary={{ periodDays: 5, predictedDays: 3, fertileDays: 7 }}
        cycleTimeline={{
          cycleLength: 39,
          cycleDay: 17,
          markers: [
            { label: "Period", startDay: 1, endDay: 5, tone: "period" },
            { label: "Fertile", startDay: 19, endDay: 25, tone: "fertile" },
            { label: "Predicted", startDay: 38, endDay: 39, tone: "predicted" },
          ],
        }}
        selectedLog={{
          mood: 4,
          flow: "heavy",
          notes: "Lower energy in the evening.",
          bbt: 36.7,
          mucusType: "watery",
          sex: true,
          contraception: "Condom",
        }}
      />
    );

    expect(screen.getByText("Current cycle view")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Month view" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cycle view" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Open calendar actions" })).toBeInTheDocument();
    expect(screen.getByText("Day 17 of 39")).toBeInTheDocument();
  });
});
