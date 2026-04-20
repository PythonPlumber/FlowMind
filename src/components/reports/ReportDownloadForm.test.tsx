import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ReportDownloadForm } from "@/components/reports/ReportDownloadForm";

describe("ReportDownloadForm", () => {
  it("updates the export link when a preset is selected", async () => {
    const user = userEvent.setup();

    render(<ReportDownloadForm todayOverride="2026-04-14" />);
    await user.click(screen.getByRole("button", { name: "Last 30 days" }));

    expect(screen.getByRole("link", { name: "Download PDF" }).getAttribute("href")).toContain(
      "from=2026-03-15"
    );
    expect(screen.getByText("Range span")).toBeInTheDocument();
    expect(screen.getByText("Cycle stats, period history, symptoms, notes")).toBeInTheDocument();
  });
});
