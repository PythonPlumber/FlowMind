"use server";

import { z } from "zod";

import { dbConnect } from "@/lib/db";
import { requireUserId } from "@/lib/guards";
import { CustomSymptom } from "@/models/CustomSymptom";
import { DailyLogSymptom } from "@/models/DailyLogSymptom";

const inputSchema = z.object({
  label: z.string().min(1).max(50),
});

export async function deleteCustomSymptomAction(input: unknown) {
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };

  const userId = await requireUserId();
  await dbConnect();

  const doc = await CustomSymptom.findOne({ userId, label: parsed.data.label })
    .select({ _id: 1 })
    .lean();
  if (!doc) return { ok: true as const };

  await Promise.all([
    DailyLogSymptom.deleteMany({ userId, customSymptomId: doc._id }),
    CustomSymptom.deleteOne({ userId, _id: doc._id }),
  ]);

  return { ok: true as const };
}

