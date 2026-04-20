import { beforeEach, describe, expect, it, vi } from "vitest";

import { deleteAccountAction } from "@/actions/account";

const {
  dbConnect,
  requireUserId,
  profileDeleteOne,
  periodDeleteMany,
  dailyLogDeleteMany,
  dailyLogSymptomDeleteMany,
  customSymptomDeleteMany,
  aiAnalysisCacheDeleteMany,
  aiRateLimitDeleteMany,
  userDeleteOne,
} = vi.hoisted(() => ({
  dbConnect: vi.fn(),
  requireUserId: vi.fn(),
  profileDeleteOne: vi.fn(),
  periodDeleteMany: vi.fn(),
  dailyLogDeleteMany: vi.fn(),
  dailyLogSymptomDeleteMany: vi.fn(),
  customSymptomDeleteMany: vi.fn(),
  aiAnalysisCacheDeleteMany: vi.fn(),
  aiRateLimitDeleteMany: vi.fn(),
  userDeleteOne: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  dbConnect,
}));

vi.mock("@/lib/guards", () => ({
  requireUserId,
}));

vi.mock("@/models/Profile", () => ({
  Profile: {
    deleteOne: profileDeleteOne,
  },
}));

vi.mock("@/models/Period", () => ({
  Period: {
    deleteMany: periodDeleteMany,
  },
}));

vi.mock("@/models/DailyLog", () => ({
  DailyLog: {
    deleteMany: dailyLogDeleteMany,
  },
}));

vi.mock("@/models/DailyLogSymptom", () => ({
  DailyLogSymptom: {
    deleteMany: dailyLogSymptomDeleteMany,
  },
}));

vi.mock("@/models/CustomSymptom", () => ({
  CustomSymptom: {
    deleteMany: customSymptomDeleteMany,
  },
}));

vi.mock("@/models/AIAnalysisCache", () => ({
  AIAnalysisCache: {
    deleteMany: aiAnalysisCacheDeleteMany,
  },
}));

vi.mock("@/models/AIRateLimit", () => ({
  AIRateLimit: {
    deleteMany: aiRateLimitDeleteMany,
  },
}));

vi.mock("@/models/User", () => ({
  User: {
    deleteOne: userDeleteOne,
  },
}));

describe("deleteAccountAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserId.mockResolvedValue("user-123");
    dbConnect.mockResolvedValue(undefined);
    profileDeleteOne.mockResolvedValue({ acknowledged: true });
    periodDeleteMany.mockResolvedValue({ acknowledged: true });
    dailyLogDeleteMany.mockResolvedValue({ acknowledged: true });
    dailyLogSymptomDeleteMany.mockResolvedValue({ acknowledged: true });
    customSymptomDeleteMany.mockResolvedValue({ acknowledged: true });
    aiAnalysisCacheDeleteMany.mockResolvedValue({ acknowledged: true });
    aiRateLimitDeleteMany.mockResolvedValue({ acknowledged: true });
    userDeleteOne.mockResolvedValue({ acknowledged: true });
  });

  it("removes AI cache rows alongside the rest of the user's account data", async () => {
    const result = await deleteAccountAction();

    expect(result).toEqual({ ok: true });
    expect(aiAnalysisCacheDeleteMany).toHaveBeenCalledWith({ userId: "user-123" });
    expect(aiRateLimitDeleteMany).toHaveBeenCalledWith({ userId: "user-123" });
    expect(userDeleteOne).toHaveBeenCalledWith({ _id: "user-123" });
  });
});
