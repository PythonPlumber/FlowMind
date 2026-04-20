import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";

describe("premium primitives", () => {
  it("supports hero cards, brand buttons, and styled native selects", () => {
    render(
      <div>
        <Card variant="hero">Hero</Card>
        <Button variant="brand">Track today</Button>
        <NativeSelect aria-label="Goal">
          <option value="track">Track</option>
        </NativeSelect>
      </div>
    );

    expect(screen.getByText("Hero").closest("[data-card-variant]")?.getAttribute("data-card-variant")).toBe(
      "hero"
    );
    expect(screen.getByRole("button", { name: "Track today" }).getAttribute("data-variant")).toBe(
      "brand"
    );
    expect(screen.getByRole("combobox", { name: "Goal" })).toBeTruthy();
  });
});
