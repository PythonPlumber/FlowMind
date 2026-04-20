import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingsClient } from "@/components/settings/SettingsClient";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

vi.mock("@/actions/profile", () => ({
  updateProfileAction: vi.fn(async () => ({ ok: true })),
}));

vi.mock("@/actions/customSymptoms", () => ({
  deleteCustomSymptomAction: vi.fn(async () => ({ ok: true })),
}));

vi.mock("@/actions/account", () => ({
  deleteAccountAction: vi.fn(async () => ({ ok: true })),
}));

describe("SettingsClient", () => {
  it("renders sectioned settings with readable empty state copy", () => {
    render(
      <SettingsClient
        initialProfile={{
          birthYear: 2000,
          cycleLengthTypical: 28,
          periodLengthTypical: 5,
          goalMode: "track",
        }}
        customSymptoms={[]}
      />
    );

    expect(screen.getByRole("heading", { name: "Profile" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Cycle preferences" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Privacy" })).toBeInTheDocument();
    expect(
      screen.getByText("You do not have any custom symptoms yet. Add them from the Log page.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete account" })).toBeInTheDocument();
  });
});
