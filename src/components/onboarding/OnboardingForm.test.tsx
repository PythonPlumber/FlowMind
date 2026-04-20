import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock("@/actions/profile", () => ({
  completeOnboardingAction: vi.fn(async () => ({ ok: true })),
}));

describe("OnboardingForm", () => {
  it("renders goal pills and clean helper copy", () => {
    render(
      <OnboardingForm
        initial={{
          birthYear: 2002,
          cycleLengthTypical: 28,
          periodLengthTypical: 5,
          goalMode: "track",
        }}
      />
    );

    expect(screen.getByRole("button", { name: "Track periods" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trying to conceive" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "If you add this, you'll immediately get next-period and fertile-window estimates."
      )
    ).toBeInTheDocument();
  });
});
