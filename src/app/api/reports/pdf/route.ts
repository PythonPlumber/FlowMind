import { NextResponse } from "next/server";

import { renderPeriodReportPdfBuffer } from "@/lib/reports/PeriodReport";
import {
  currentYearInTimeZone,
  dateOnlyToUTCDate,
  isoDateSchema,
  utcDateToISODate,
} from "@/lib/dateOnly";
import { dbConnect } from "@/lib/db";
import { requireUserId } from "@/lib/guards";
import { Profile } from "@/models/Profile";
import { Period } from "@/models/Period";
import { DailyLog } from "@/models/DailyLog";
import { DailyLogSymptom } from "@/models/DailyLogSymptom";
import { SymptomDefinition } from "@/models/SymptomDefinition";
import { CustomSymptom } from "@/models/CustomSymptom";
import { computePredictions } from "@/lib/predictions";

export const runtime = "nodejs";

function parseQueryDate(url: URL, key: string) {
  const value = url.searchParams.get(key);
  const parsed = isoDateSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fromIso = parseQueryDate(url, "from");
  const toIso = parseQueryDate(url, "to");

  if (!fromIso || !toIso) {
    return NextResponse.json(
      { error: "Missing or invalid from/to. Use YYYY-MM-DD." },
      { status: 400 }
    );
  }

  const fromDate = dateOnlyToUTCDate(fromIso);
  const toDate = dateOnlyToUTCDate(toIso);

  if (toDate.getTime() < fromDate.getTime()) {
    return NextResponse.json(
      { error: "`to` cannot be before `from`." },
      { status: 400 }
    );
  }

  const userId = await requireUserId();
  await dbConnect();

  const profile = await Profile.findOne({ userId }).lean();
  if (!profile?.onboardingCompleted) {
    return NextResponse.json(
      { error: "Complete onboarding before generating reports." },
      { status: 400 }
    );
  }

  const age =
    typeof profile.birthYear === "number"
      ? currentYearInTimeZone() - profile.birthYear
      : null;

  const allPeriods = await Period.find({ userId }).sort({ startDate: -1 }).lean();
  const predictions = computePredictions(allPeriods, {
    cycleLengthTypical: profile.cycleLengthTypical ?? 28,
    periodLengthTypical: profile.periodLengthTypical ?? 5,
  });

  const periods = await Period.find({
    userId,
    startDate: { $lte: toDate },
    $or: [{ endDate: { $gte: fromDate } }, { endDate: { $exists: false } }],
  })
    .sort({ startDate: -1 })
    .lean();

  const logs = await DailyLog.find({
    userId,
    logDate: { $gte: fromDate, $lte: toDate },
  })
    .select({ _id: 1 })
    .lean();

  const logIds = logs.map((l) => l._id);
  const symptomRows =
    logIds.length > 0
      ? await DailyLogSymptom.find({
          userId,
          dailyLogId: { $in: logIds },
        }).lean()
      : [];

  const [defs, customs] = await Promise.all([
    SymptomDefinition.find({}).lean(),
    CustomSymptom.find({ userId }).lean(),
  ]);

  const defMap = new Map(defs.map((d) => [d.key, d.label]));
  const customMap = new Map(customs.map((c) => [String(c._id), c.label]));

  const counts = new Map<string, number>();
  for (const s of symptomRows) {
    let label: string | null = null;
    if (s.symptomKey) label = defMap.get(s.symptomKey) ?? s.symptomKey;
    if (s.customSymptomId) label = customMap.get(String(s.customSymptomId)) ?? "Custom";
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const symptomTop = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([label, count]) => ({ label, count }));

  const stats: Array<{ label: string; value: string }> = [
    { label: "Typical cycle length", value: `${predictions.medianCycleLength} days` },
    { label: "Typical period length", value: `${predictions.medianPeriodLength} days` },
    { label: "Periods in range", value: String(periods.length) },
  ];

  if (symptomTop[0]) {
    stats.push({ label: "Most common symptom", value: `${symptomTop[0].label} (${symptomTop[0].count})` });
  }

  const buffer = await renderPeriodReportPdfBuffer({
    title: "Period Tracker Report",
    from: fromIso,
    to: toIso,
    age,
    stats,
    periods: periods.map((p) => ({
      start: utcDateToISODate(p.startDate),
      end: p.endDate ? utcDateToISODate(p.endDate) : null,
    })),
    symptoms: symptomTop,
  });

  const filename = `period-report_${fromIso}_to_${toIso}.pdf`;

  const body = new Uint8Array(buffer);

  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=\"${filename}\"`,
      "Cache-Control": "no-store",
    },
  });
}
