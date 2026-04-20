import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthShell } from "@/components/auth/AuthShell";

describe("AuthShell", () => {
  it("renders a premium auth frame with title and supporting points", () => {
    render(
      <AuthShell
        eyebrow="Welcome"
        title="Create your account"
        description="Private cycle tracking with richer daily signals."
        points={["Period forecasts", "Body cues", "Private notes"]}
      >
        <div>Form body</div>
      </AuthShell>
    );

    expect(screen.getByText("Welcome")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByText("Body cues")).toBeInTheDocument();
    expect(screen.getByText("Form body")).toBeInTheDocument();
  });
});
