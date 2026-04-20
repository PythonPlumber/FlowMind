"use server";

import { z } from "zod";

import { dateOnlyToUTCDate, isoDateSchema } from "@/lib/dateOnly";
import { dbConnect } from "@/lib/db";
import { requireUserId } from "@/lib/guards";
import { CustomSymptom } from "@/models/CustomSymptom";
import { DailyLog } from "@/models/DailyLog";
import { DailyLogSymptom } from "@/models/DailyLogSymptom";
import { Period } from "@/models/Period";
import { updateLoggingStreak } from "./gamification";

const flowSchema = z.enum(["spotting", "light", "medium", "heavy"]);

const logSchema = z.object({
  date: isoDateSchema,
  flow: flowSchema.optional(),
  mood: z.number().int().min(1).max(5).optional(),
  notes: z.string().max(5000).optional(),
  bbt: z.number().min(30).max(45).optional(),
  mucusType: z.enum(["dry", "sticky", "creamy", "watery", "eggwhite"]).optional(),
  sex: z.boolean().optional(),
  contraception: z.string().max(100).optional(),
  predefinedSymptoms: z
    .array(
      z.object({
        key: z.string().min(1),
        severity: z.number().int().min(0).max(3).default(1),
      })
    )
    .default([]),
  customSymptoms: z
    .array(
      z.object({
        label: z.string().min(1).max(50),
        severity: z.number().int().min(0).max(3).default(1),
      })
    )
    .default([]),
});

export async function saveDailyLogAction(input: unknown) {
  const parsed = logSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid input" };
  }

  const userId = await requireUserId();
  await dbConnect();

  const logDate = dateOnlyToUTCDate(parsed.data.date);
  const existingLog = await DailyLog.findOne({ userId, logDate })
    .select({ _id: 1 })
    .lean();
  const isNewLog = !existingLog;

  // Link to a period if the date falls inside a logged period range.
  const period = await Period.findOne({
    userId,
    startDate: { $lte: logDate },
    $or: [{ endDate: { $gte: logDate } }, { endDate: { $exists: false } }],
  })
    .sort({ startDate: -1 })
    .select({ _id: 1 })
    .lean();

  const dailyLog = await DailyLog.findOneAndUpdate(
    { userId, logDate },
    {
      $set: {
        flow: parsed.data.flow,
        mood: parsed.data.mood,
        notes: parsed.data.notes,
        bbt: parsed.data.bbt,
        mucusType: parsed.data.mucusType,
        sex: parsed.data.sex,
        contraception: parsed.data.contraception,
        periodId: period?._id,
      },
      $setOnInsert: { userId, logDate },
    },
    { upsert: true, new: true }
  ).lean();

  await DailyLogSymptom.deleteMany({ userId, dailyLogId: dailyLog._id });

  const customSymptomDocs = await Promise.all(
    parsed.data.customSymptoms.map(async (s) => {
      const label = s.label.trim();
      return CustomSymptom.findOneAndUpdate(
        { userId, label },
        { $setOnInsert: { userId, label } },
        { upsert: true, new: true }
      ).lean();
    })
  );

  const symptomWrites: Array<{
    userId: string;
    dailyLogId: unknown;
    symptomKey?: string;
    customSymptomId?: unknown;
    severity: number;
  }> = [];

  for (const s of parsed.data.predefinedSymptoms) {
    symptomWrites.push({
      userId,
      dailyLogId: dailyLog._id,
      symptomKey: s.key,
      severity: s.severity,
    });
  }

  parsed.data.customSymptoms.forEach((s, idx) => {
    const doc = customSymptomDocs[idx];
    if (!doc?._id) return;
    symptomWrites.push({
      userId,
      dailyLogId: dailyLog._id,
      customSymptomId: doc._id,
      severity: s.severity,
    });
  });

  if (symptomWrites.length > 0) {
    await DailyLogSymptom.insertMany(symptomWrites);
  }

  // Update gamification stats
  const gamificationResult = await updateLoggingStreak(userId, logDate, {
    isNewLog,
  });

  return {
    ok: true as const,
    newStreak: gamificationResult.newStreak,
    newAchievements: gamificationResult.newAchievements,
    motivationalMessage: gamificationResult.motivationalMessage,
  };
}
