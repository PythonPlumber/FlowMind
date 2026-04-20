import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrbButton } from "@/components/ui/orb-button";
import { PageIntro } from "@/components/ui/page-intro";

describe("premium primitives", () => {
  it("renders hero surfaces, compact chips, and orb controls", () => {
    render(
      <div>
        <Card variant="hero">Hero surface</Card>
        <Button variant="brand">Log today</Button>
        <OrbButton aria-label="Open menu">+</OrbButton>
        <Badge variant="muted">April 2026</Badge>
        <PageIntro
          eyebrow="Today"
          title="Late follicular"
          description="One clear next step."
          meta={<span>Cycle day 12</span>}
        />
      </div>
    );

    expect(screen.getByText("Hero surface").closest("[data-card-variant]")).toHaveAttribute(
      "data-card-variant",
      "hero"
    );
    expect(screen.getByRole("button", { name: "Log today" })).toHaveAttribute("data-variant", "brand");
    expect(screen.getByLabelText("Open menu")).toHaveAttribute("data-orb-button", "true");
    expect(screen.getByText("Cycle day 12")).toBeInTheDocument();
  });
});
