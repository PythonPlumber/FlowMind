import { NextResponse } from "next/server";

import { dbConnect } from "@/lib/db";
import { requireUserId } from "@/lib/guards";
import { DailyLog } from "@/models/DailyLog";
import { DailyLogSymptom } from "@/models/DailyLogSymptom";
import { Period } from "@/models/Period";
import { Profile } from "@/models/Profile";
import { CustomSymptom } from "@/models/CustomSymptom";
import { SymptomDefinition } from "@/models/SymptomDefinition";

export async function GET() {
  try {
    const userId = await requireUserId();
    await dbConnect();

    const [profile, periods, dailyLogs, customSymptoms, symptomDefinitions] = await Promise.all([
      Profile.findOne({ userId }).lean(),
      Period.find({ userId }).sort({ startDate: 1 }).lean(),
      DailyLog.find({ userId }).sort({ logDate: 1 }).lean(),
      CustomSymptom.find({ userId }).lean(),
      SymptomDefinition.find({}).lean(),
    ]);

    const dailyLogIds = dailyLogs.map((log) => log._id);
    const dailyLogSymptoms = dailyLogIds.length > 0
      ? await DailyLogSymptom.find({ userId, dailyLogId: { $in: dailyLogIds } }).lean()
      : [];

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
            gamification: profile.gamification,
          }
        : null,
      periods: periods.map((p) => ({
        startDate: p.startDate.toISOString(),
        endDate: p.endDate?.toISOString() ?? null,
        createdAt: p.createdAt.toISOString(),
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
      symptoms: dailyLogSymptoms.map((s) => ({
        dailyLogDate: dailyLogs.find((l) => l._id.equals(s.dailyLogId))?.logDate.toISOString() ?? "",
        symptomKey: s.symptomKey ?? null,
        customSymptomId: s.customSymptomId?.toString() ?? null,
        severity: s.severity ?? 1,
      })),
      customSymptoms: customSymptoms.map((s) => s.label),
      symptomDefinitions: symptomDefinitions.map((s) => ({
        key: s.key,
        label: s.label,
        category: s.category,
      })),
    };

    const json = JSON.stringify(exportData, null, 2);
    const filename = `period-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
