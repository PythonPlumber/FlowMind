import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AIQuestionCard from "@/components/ai-analytics/AIQuestionCard";

describe("AIQuestionCard", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        body: new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              new TextEncoder().encode(
                'data: {"choices":[{"delta":{"content":"Focused answer"}}]}\n\ndata: [DONE]\n'
              )
            );
            controller.close();
          },
        }),
      }))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the selected month parameter along with the user question", async () => {
    const user = userEvent.setup();

    render(<AIQuestionCard monthLabel="April 2026" monthParam="2" />);

    await user.type(screen.getByPlaceholderText("Ask a month-specific question about your data..."), "What changed?");
    await user.click(screen.getByRole("button", { name: "Ask AI" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/ai/chat",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            message: "For April 2026, What changed?",
            monthParam: "2",
          }),
        })
      );
    });
  });
});
