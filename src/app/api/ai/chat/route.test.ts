import { beforeEach, describe, expect, it, vi } from "vitest";

const dbConnect = vi.fn();
const requireUserId = vi.fn();
const enforceRateLimit = vi.fn();
const aggregateUserDataForAI = vi.fn();
const callNvidiaAI = vi.fn();
const resolveAnalyticsMonth = vi.fn();
const profileUpdateOne = vi.fn();

vi.mock("@/lib/db", () => ({
  dbConnect,
}));

vi.mock("@/lib/guards", () => ({
  requireUserId,
}));

vi.mock("@/lib/ai/rate-limiter", () => ({
  enforceRateLimit,
}));

vi.mock("@/lib/ai/data-aggregation", () => ({
  aggregateUserDataForAI,
}));

vi.mock("@/lib/ai/nvidia-api", () => ({
  callNvidiaAI,
}));

vi.mock("@/lib/ai/monthly-analytics", () => ({
  resolveAnalyticsMonth,
}));

vi.mock("@/models/Profile", () => ({
  Profile: {
    updateOne: profileUpdateOne,
  },
}));

describe("POST /api/ai/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbConnect.mockResolvedValue(undefined);
    requireUserId.mockResolvedValue("user-123");
    enforceRateLimit.mockResolvedValue(undefined);
    resolveAnalyticsMonth.mockReturnValue({
      from: new Date("2026-02-01T00:00:00.000Z"),
      to: new Date("2026-02-28T23:59:59.999Z"),
    });
    aggregateUserDataForAI.mockResolvedValue({ cycles: { count: 1 } });
    profileUpdateOne.mockResolvedValue({ acknowledged: true });
    callNvidiaAI.mockResolvedValue(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n"));
          controller.close();
        },
      })
    );
  });

  it("uses the requested analytics month instead of a rolling 90-day range", async () => {
    const { POST } = await import("@/app/api/ai/chat/route");

    await POST(
      new Request("http://localhost/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "What changed?",
          monthParam: "2",
        }),
      })
    );

    expect(resolveAnalyticsMonth).toHaveBeenCalledWith("2");
    expect(aggregateUserDataForAI).toHaveBeenCalledWith("user-123", {
      from: new Date("2026-02-01T00:00:00.000Z"),
      to: new Date("2026-02-28T23:59:59.999Z"),
    });
  });
});
