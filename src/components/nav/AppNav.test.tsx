import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/insights",
}));

vi.mock("@/components/nav/UserMenu", () => ({
  UserMenu: () => <div>Account menu</div>,
}));

import { AppNav } from "@/components/nav/AppNav";

describe("AppNav", () => {
  it("shows premium shell controls with the current route highlighted", () => {
    render(<AppNav />);

    expect(
      screen
        .getAllByRole("link", { name: "Insights" })
        .some((link) => link.getAttribute("aria-current") === "page")
    ).toBe(true);
    expect(screen.getByRole("link", { name: "Quick log" })).toBeInTheDocument();
    expect(screen.getByLabelText("Open navigation menu")).toBeInTheDocument();
    expect(screen.getAllByText("Quiet cycle OS").length).toBeGreaterThan(0);
  });
});
