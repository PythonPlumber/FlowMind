"use server";

import { z } from "zod";

import {
  currentYearInTimeZone,
  dateOnlyToUTCDate,
  isoDateSchema,
} from "@/lib/dateOnly";
import { dbConnect } from "@/lib/db";
import { requireUserId } from "@/lib/guards";
import { Profile } from "@/models/Profile";
import { Period } from "@/models/Period";

const goalModeSchema = z.enum(["track", "conceive", "avoid"]);

const onboardingSchema = z.object({
  birthYear: z.number().int().min(1900).max(2100),
  cycleLengthTypical: z.number().int().min(15).max(60).default(28),
  periodLengthTypical: z.number().int().min(1).max(14).default(5),
  goalMode: goalModeSchema.default("track"),
  lastPeriodStart: isoDateSchema.optional(),
  u13Permission: z.boolean().optional(),
});

export async function completeOnboardingAction(input: unknown) {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Invalid input",
      issues: parsed.error.issues,
    };
  }

  const {
    birthYear,
    cycleLengthTypical,
    periodLengthTypical,
    goalMode,
    lastPeriodStart,
    u13Permission,
  } = parsed.data;

  const currentYear = currentYearInTimeZone();
  const age = currentYear - birthYear;
  if (age < 13 && !u13Permission) {
    return {
      ok: false as const,
      error: "Permission is required for users under 13.",
    };
  }

  const userId = await requireUserId();
  await dbConnect();

  await Profile.updateOne(
    { userId },
    {
      $set: {
        birthYear,
        cycleLengthTypical,
        periodLengthTypical,
        goalMode,
        onboardingCompleted: true,
      },
      $setOnInsert: { userId },
    },
    { upsert: true }
  );

  if (lastPeriodStart) {
    const existing = await Period.findOne({ userId }).select({ _id: 1 }).lean();
    if (!existing) {
      await Period.create({ userId, startDate: dateOnlyToUTCDate(lastPeriodStart) });
    }
  }

  return { ok: true as const };
}

const updateProfileSchema = z.object({
  birthYear: z.number().int().min(1900).max(2100).optional(),
  cycleLengthTypical: z.number().int().min(15).max(60).optional(),
  periodLengthTypical: z.number().int().min(1).max(14).optional(),
  goalMode: goalModeSchema.optional(),
  ageGroup: z.enum(["teen", "adult"]).optional().nullable(),
  aiPreferences: z.object({
    toneStyle: z.enum(["gentle", "encouraging", "celebratory"]).optional(),
    privacyMode: z.enum(["full_analysis", "patterns_only"]).optional(),
    emotionalSupportLevel: z.enum(["minimal", "moderate", "full"]).optional(),
  }).optional(),
});

export async function updateProfileAction(input: unknown) {
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Invalid input" };
  }

  const userId = await requireUserId();
  await dbConnect();

  const updateData: Record<string, unknown> = {
    ...parsed.data,
    onboardingCompleted: true,
  };

  // Flatten AI preferences for MongoDB update
  if (parsed.data.aiPreferences) {
    updateData["aiPreferences.toneStyle"] = parsed.data.aiPreferences.toneStyle;
    updateData["aiPreferences.privacyMode"] = parsed.data.aiPreferences.privacyMode;
    updateData["aiPreferences.emotionalSupportLevel"] = parsed.data.aiPreferences.emotionalSupportLevel;
    delete updateData.aiPreferences;
  }

  await Profile.updateOne(
    { userId },
    { $set: updateData, $setOnInsert: { userId } },
    { upsert: true }
  );

  return { ok: true as const };
}
