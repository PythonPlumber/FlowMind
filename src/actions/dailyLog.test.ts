import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserId = vi.fn();
const dbConnect = vi.fn();
const periodFindOne = vi.fn();
const dailyLogFindOne = vi.fn();
const dailyLogFindOneAndUpdate = vi.fn();
const dailyLogSymptomDeleteMany = vi.fn();
const customSymptomFindOneAndUpdate = vi.fn();
const dailyLogSymptomInsertMany = vi.fn();
const updateLoggingStreak = vi.fn();

vi.mock("@/lib/guards", () => ({
  requireUserId,
}));

vi.mock("@/lib/db", () => ({
  dbConnect,
}));

vi.mock("@/models/Period", () => ({
  Period: {
    findOne: periodFindOne,
  },
}));

vi.mock("@/models/DailyLog", () => ({
  DailyLog: {
    findOne: dailyLogFindOne,
    findOneAndUpdate: dailyLogFindOneAndUpdate,
  },
}));

vi.mock("@/models/DailyLogSymptom", () => ({
  DailyLogSymptom: {
    deleteMany: dailyLogSymptomDeleteMany,
    insertMany: dailyLogSymptomInsertMany,
  },
}));

vi.mock("@/models/CustomSymptom", () => ({
  CustomSymptom: {
    findOneAndUpdate: customSymptomFindOneAndUpdate,
  },
}));

vi.mock("./gamification", () => ({
  updateLoggingStreak,
}));

describe("saveDailyLogAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserId.mockResolvedValue("user-123");
    dbConnect.mockResolvedValue(undefined);
    periodFindOne.mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(null),
    });
    dailyLogFindOneAndUpdate.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: "log-1" }),
    });
    dailyLogSymptomDeleteMany.mockResolvedValue({ acknowledged: true });
    dailyLogSymptomInsertMany.mockResolvedValue([]);
    customSymptomFindOneAndUpdate.mockReturnValue({
      lean: vi.fn().mockResolvedValue({ _id: "custom-1" }),
    });
    updateLoggingStreak.mockResolvedValue({
      newStreak: 2,
      newBestStreak: 4,
      newAchievements: [],
      motivationalMessage: "Nice work",
    });
  });

  it("tells gamification when a save is editing an existing day instead of creating a new one", async () => {
    const { saveDailyLogAction } = await import("@/actions/dailyLog");

    dailyLogFindOne.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue({ _id: "existing-log" }),
    });

    await saveDailyLogAction({
      date: "2026-04-14",
      predefinedSymptoms: [],
      customSymptoms: [],
    });

    expect(updateLoggingStreak).toHaveBeenCalledWith(
      "user-123",
      new Date("2026-04-14T00:00:00.000Z"),
      { isNewLog: false }
    );
  });

  it("marks first-time saves as new log entries for gamification", async () => {
    const { saveDailyLogAction } = await import("@/actions/dailyLog");

    dailyLogFindOne.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(null),
    });

    await saveDailyLogAction({
      date: "2026-04-15",
      predefinedSymptoms: [],
      customSymptoms: [],
    });

    expect(updateLoggingStreak).toHaveBeenCalledWith(
      "user-123",
      new Date("2026-04-15T00:00:00.000Z"),
      { isNewLog: true }
    );
  });
});
