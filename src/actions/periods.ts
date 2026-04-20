"use server";

import { z } from "zod";

import { dateOnlyToUTCDate, isoDateSchema, todayISODate } from "@/lib/dateOnly";
import { dbConnect } from "@/lib/db";
import { requireUserId } from "@/lib/guards";
import { Period } from "@/models/Period";

const dateInputSchema = z.object({
  date: isoDateSchema.optional(),
});

export async function startPeriodAction(input?: { date?: string }) {
  const parsed = dateInputSchema.safeParse(input ?? {});
  if (!parsed.success) return { ok: false as const, error: "Invalid date" };

  const userId = await requireUserId();
  await dbConnect();

  const existingOpen = await Period.findOne({ userId, endDate: { $exists: false } })
    .select({ _id: 1 })
    .lean();
  if (existingOpen) {
    return { ok: false as const, error: "You already have an ongoing period." };
  }

  const iso = parsed.data.date ?? todayISODate();
  const startDate = dateOnlyToUTCDate(iso);

  await Period.create({ userId, startDate });

  return { ok: true as const };
}

export async function endCurrentPeriodAction(input?: { date?: string }) {
  const parsed = dateInputSchema.safeParse(input ?? {});
  if (!parsed.success) return { ok: false as const, error: "Invalid date" };

  const userId = await requireUserId();
  await dbConnect();

  const current = await Period.findOne({
    userId,
    endDate: { $exists: false },
  })
    .sort({ startDate: -1 })
    .lean();

  if (!current) {
    return { ok: false as const, error: "No ongoing period found." };
  }

  const iso = parsed.data.date ?? todayISODate();
  const endDate = dateOnlyToUTCDate(iso);

  if (endDate.getTime() < current.startDate.getTime()) {
    return {
      ok: false as const,
      error: "End date cannot be before start date.",
    };
  }

  await Period.updateOne({ _id: current._id, userId }, { $set: { endDate } });
  return { ok: true as const };
}

