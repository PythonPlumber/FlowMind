import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BrandMark } from "@/components/brand/BrandMark";

describe("BrandMark", () => {
  it("renders a custom svg logo with accessible label", () => {
    render(<BrandMark label="Period Tracker" />);

    const logo = screen.getByLabelText("Period Tracker");

    expect(logo.tagName.toLowerCase()).toBe("svg");
    expect(logo.querySelector("circle")).toBeTruthy();
    expect(logo.querySelector("path")).toBeTruthy();
  });
});
