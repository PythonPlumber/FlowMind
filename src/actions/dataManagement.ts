"use server";

import { z } from "zod";

import { dbConnect } from "@/lib/db";
import { requireUserId } from "@/lib/guards";
import { DailyLog } from "@/models/DailyLog";
import { DailyLogSymptom } from "@/models/DailyLogSymptom";
import { Period } from "@/models/Period";
import { Profile } from "@/models/Profile";
import { CustomSymptom } from "@/models/CustomSymptom";

const importSchema = z.object({
  version: z.number(),
  periods: z.array(z.object({
    startDate: z.string(),
    endDate: z.string().nullable(),
  })),
  dailyLogs: z.array(z.object({
    date: z.string(),
    flow: z.enum(["spotting", "light", "medium", "heavy"]).nullable(),
    mood: z.number().min(1).max(5).nullable(),
    notes: z.string().nullable(),
    bbt: z.number().min(30).max(45).nullable(),
    mucusType: z.enum(["dry", "sticky", "creamy", "watery", "eggwhite"]).nullable(),
    sex: z.boolean().nullable(),
    contraception: z.string().nullable(),
  })),
  customSymptoms: z.array(z.string()),
});

export async function importDataAction(input: unknown): Promise<{ ok: boolean; error?: string; summary?: { periods: number; logs: number; customSymptoms: number } }> {
  try {
    const userId = await requireUserId();
    await dbConnect();

    const parsed = importSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: "Invalid data format" };
    }

    const data = parsed.data;

    if (data.version !== 1) {
      return { ok: false, error: "Unsupported backup version" };
    }

    let periodsImported = 0;
    let logsImported = 0;
    let customSymptomsImported = 0;

    for (const period of data.periods) {
      const startDate = new Date(period.startDate);
      const endDate = period.endDate ? new Date(period.endDate) : undefined;

      const existing = await Period.findOne({
        userId,
        startDate,
      });

      if (!existing) {
        await Period.create({
          userId,
          startDate,
          endDate,
        });
        periodsImported++;
      }
    }

    for (const log of data.dailyLogs) {
      const logDate = new Date(log.date);

      const existing = await DailyLog.findOne({
        userId,
        logDate,
      });

      if (!existing) {
        await DailyLog.create({
          userId,
          logDate,
          flow: log.flow,
          mood: log.mood,
          notes: log.notes,
          bbt: log.bbt,
          mucusType: log.mucusType,
          sex: log.sex,
          contraception: log.contraception,
        });
        logsImported++;
      }
    }

    for (const label of data.customSymptoms) {
      const existing = await CustomSymptom.findOne({
        userId,
        label,
      });

      if (!existing) {
        await CustomSymptom.create({
          userId,
          label,
        });
        customSymptomsImported++;
      }
    }

    return {
      ok: true,
      summary: {
        periods: periodsImported,
        logs: logsImported,
        customSymptoms: customSymptomsImported,
      },
    };
  } catch (error) {
    console.error("Import error:", error);
    return { ok: false, error: "Failed to import data" };
  }
}

export async function exportAllDataAction(): Promise<{ ok: boolean; error?: string; data?: string }> {
  try {
    const userId = await requireUserId();
    await dbConnect();

    const [profile, periods, dailyLogs, customSymptoms] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      Period.find({ userId }).sort({ startDate: 1 }).lean(),
      DailyLog.find({ userId }).sort({ logDate: 1 }).lean(),
      CustomSymptom.find({ userId }).lean(),
    ]);
    const exportData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      user: profile
        ? {
            birthYear: profile.birthYear,
            cycleLengthTypical: profile.cycleLengthTypical,
            periodLengthTypical: profile.periodLengthTypical,
            goalMode: profile.goalMode,
            ageGroup: profile.ageGroup,
            aiPreferences: profile.aiPreferences,
          }
        : null,
      periods: periods.map((p) => ({
        startDate: p.startDate.toISOString(),
        endDate: p.endDate?.toISOString() ?? null,
      })),
      dailyLogs: dailyLogs.map((log) => ({
        date: log.logDate.toISOString(),
        flow: log.flow ?? null,
        mood: log.mood ?? null,
        notes: log.notes ?? null,
        bbt: log.bbt ?? null,
        mucusType: log.mucusType ?? null,
        sex: log.sex ?? null,
        contraception: log.contraception ?? null,
      })),
      customSymptoms: customSymptoms.map((s) => s.label),
    };

    return {
      ok: true,
      data: JSON.stringify(exportData, null, 2),
    };
  } catch (error) {
    console.error("Export error:", error);
    return { ok: false, error: "Failed to export data" };
  }
}
