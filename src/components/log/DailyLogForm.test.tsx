import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DailyLogForm } from "@/components/log/DailyLogForm";
import { saveDailyLogAction } from "@/actions/dailyLog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/actions/dailyLog", () => ({
  saveDailyLogAction: vi.fn(async () => ({ ok: true })),
}));

describe("DailyLogForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the log as a guided premium check-in with one sticky primary action", async () => {
    const user = userEvent.setup();

    render(
      <DailyLogForm
        initial={{
          date: "2026-04-14",
          flow: "",
          mood: "",
          notes: "",
          bbt: "",
          mucusType: "",
          sex: null,
          contraception: "",
          selectedPredefined: {},
          selectedCustom: {},
        }}
        definitions={[
          { key: "cramps", label: "Cramps", category: "pain" },
          { key: "bloating", label: "Bloating", category: "body" },
        ]}
        existingCustomSymptoms={[]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Heavy" }));
    await user.click(screen.getByRole("button", { name: "4" }));
    await user.type(screen.getByLabelText("BBT (°C)"), "36.7");
    await user.click(screen.getByRole("button", { name: "Watery" }));
    await user.click(screen.getByRole("button", { name: "Had sex" }));
    await user.type(screen.getByLabelText("Contraception"), "Condom");
    await user.click(screen.getAllByText("Cramps")[0]);
    await user.click(screen.getByRole("button", { name: "Save log" }));

    expect(screen.getByText("Check-in progress")).toBeInTheDocument();
    expect(screen.getByText("Today at a glance")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Flow" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Body signals" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Symptoms" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save log" })).toBeInTheDocument();
    expect(screen.getByTestId("sticky-log-actions")).toBeInTheDocument();
    expect(saveDailyLogAction).toHaveBeenCalledWith(
      expect.objectContaining({
        flow: "heavy",
        mood: 4,
        bbt: 36.7,
        mucusType: "watery",
        sex: true,
        contraception: "Condom",
      })
    );
  }, 10000);

  it("keeps optional body-signal pills unset until the user explicitly chooses a value", async () => {
    const user = userEvent.setup();

    render(
      <DailyLogForm
        initial={{
          date: "2026-04-14",
          flow: "",
          mood: "",
          notes: "",
          bbt: "",
          mucusType: "",
          sex: null,
          contraception: "",
          selectedPredefined: {},
          selectedCustom: {},
        }}
        definitions={[]}
        existingCustomSymptoms={[]}
      />
    );

    await user.click(screen.getByRole("button", { name: "Watery" }));
    await user.click(screen.getByRole("button", { name: "Watery" }));
    await user.click(screen.getByRole("button", { name: "Save log" }));

    expect(saveDailyLogAction).toHaveBeenLastCalledWith(
      expect.objectContaining({
        mucusType: undefined,
        sex: undefined,
      })
    );
  });
});

