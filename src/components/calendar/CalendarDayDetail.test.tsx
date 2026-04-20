import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CalendarDayDetail } from "@/components/calendar/CalendarDayDetail";

describe("CalendarDayDetail", () => {
  it("shows advanced daily log details and quick actions when they exist", () => {
    render(
      <CalendarDayDetail
        selected={{
          iso: "2026-04-14",
          isActual: true,
          isPredicted: true,
          isFertile: false,
          isToday: true,
          day: 14,
          isSelected: true,
          hasLog: true,
          hasSymptoms: true,
          hasNotes: true,
          statePriority: "period",
        }}
        logDetails={{
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

    expect(screen.getByText("Heavy")).toBeInTheDocument();
    expect(screen.getByText("Good (4/5)")).toBeInTheDocument();
    expect(screen.getByText("36.70°C")).toBeInTheDocument();
    expect(screen.getByText("Had sex · Condom")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Log today" })[0]).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start period" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "End period" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Edit log" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Insights" })).toBeInTheDocument();
  });
});
