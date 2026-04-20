import { CalendarExperience } from "@/components/calendar/CalendarExperience";
import { addDaysUTC, dateOnlyToUTCDate, diffDaysUTC, isoDateSchema, todayISODate, utcDateToISODate } from "@/lib/dateOnly";
import { buildCalendarMonth } from "@/lib/calendar";
import { dbConnect } from "@/lib/db";
import { requireOnboardedProfile } from "@/lib/guards";
import { computePredictions } from "@/lib/predictions";
import { DailyLog } from "@/models/DailyLog";
import { DailyLogSymptom } from "@/models/DailyLogSymptom";
import { Period } from "@/models/Period";

function ymString(year: number, month1: number) {
  return `${year}-${String(month1).padStart(2, "0")}`;
}

function parseYM(value: string | undefined) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}$/.test(value)) return null;
  const [y, m] = value.split("-").map(Number);
  if (m < 1 || m > 12) return null;
  return { y, m };
}

function safeDateParam(date: string | undefined) {
  const parsed = isoDateSchema.safeParse(date);
  return parsed.success ? parsed.data : null;
}

function rangeIsoDaysInclusive(start: Date, end: Date) {
  const days: string[] = [];
  let cur = start;
  while (cur.getTime() <= end.getTime()) {
    days.push(utcDateToISODate(cur));
    cur = addDaysUTC(cur, 1);
  }
  return days;
}

export default async function CalendarPage(props: {
  searchParams?: Promise<{ m?: string; d?: string; view?: string; focus?: string }>;
}) {
  const { userId, profile } = await requireOnboardedProfile();
  await dbConnect();

  const searchParams = await props.searchParams;
  const [todayY, todayM] = todayISODate()
    .split("-")
    .slice(0, 2)
    .map(Number);

  const parsed = parseYM(searchParams?.m);
  const y = parsed?.y ?? todayY;
  const m = parsed?.m ?? todayM;
  const view = searchParams?.view === "cycle" ? "cycle" : "month";
  const monthStart = new Date(Date.UTC(y, m - 1, 1));

  const periods = await Period.find({ userId }).sort({ startDate: -1 }).limit(24).lean();
  const monthLogs = await DailyLog.find({
    userId,
    logDate: {
      $gte: new Date(Date.UTC(y, m - 1, 1)),
      $lte: new Date(Date.UTC(y, m, 0)),
    },
  }).lean();
  const symptomRows =
    monthLogs.length > 0
      ? await DailyLogSymptom.find({
          userId,
          dailyLogId: { $in: monthLogs.map((log) => log._id) },
        })
          .select({ dailyLogId: 1 })
          .lean()
      : [];
  const dailyLogs = monthLogs.map((log) => ({
    logDate: log.logDate,
    bbt: log.bbt,
    mucusType: log.mucusType,
    mood: log.mood,
    flow: log.flow,
  }));
  const predictions = computePredictions(periods, dailyLogs, {
    cycleLengthTypical: profile.cycleLengthTypical ?? 28,
    periodLengthTypical: profile.periodLengthTypical ?? 5,
  });

  const actualPeriodDays = new Set<string>();
  const today = dateOnlyToUTCDate(todayISODate());
  for (const period of periods) {
    const end = period.endDate ? period.endDate : today;
    rangeIsoDaysInclusive(period.startDate, end).forEach((day) => actualPeriodDays.add(day));
  }

  const predictedPeriodWindowDays = new Set<string>();
  if (predictions.nextPeriodWindowStart && predictions.nextPeriodWindowEnd) {
    rangeIsoDaysInclusive(predictions.nextPeriodWindowStart, predictions.nextPeriodWindowEnd).forEach(
      (day) => predictedPeriodWindowDays.add(day)
    );
  }

  const fertileDays = new Set<string>();
  if (predictions.fertileWindowStart && predictions.fertileWindowEnd) {
    rangeIsoDaysInclusive(predictions.fertileWindowStart, predictions.fertileWindowEnd).forEach((day) =>
      fertileDays.add(day)
    );
  }

  const symptomsByLogId = new Set(symptomRows.map((row) => String(row.dailyLogId)));
  const logSignals = Object.fromEntries(
    monthLogs.map((log) => [
      utcDateToISODate(log.logDate),
      {
        hasLog: true,
        hasSymptoms: symptomsByLogId.has(String(log._id)),
        hasNotes: Boolean(log.notes?.trim()),
      },
    ])
  );

  const focusToDate =
    searchParams?.focus === "predicted"
      ? [...predictedPeriodWindowDays].sort()[0]
      : searchParams?.focus === "fertile"
        ? [...fertileDays].sort()[0]
        : searchParams?.focus === "today"
          ? todayISODate()
          : null;
  const selectedIso = focusToDate ?? safeDateParam(searchParams?.d) ?? todayISODate();
  const month = buildCalendarMonth({
    year: y,
    month: m,
    todayIso: todayISODate(),
    selectedIso,
    actualDays: actualPeriodDays,
    predictedDays: predictedPeriodWindowDays,
    fertileDays,
    logSignals,
  });

  const prevMonthDate = new Date(Date.UTC(y, m - 2, 1));
  const nextMonthDate = new Date(Date.UTC(y, m, 1));
  const prevM = ymString(prevMonthDate.getUTCFullYear(), prevMonthDate.getUTCMonth() + 1);
  const nextM = ymString(nextMonthDate.getUTCFullYear(), nextMonthDate.getUTCMonth() + 1);
  const monthParam = ymString(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1);
  const selectedLogDoc =
    monthLogs.find((log) => utcDateToISODate(log.logDate) === selectedIso) ?? null;
  const cycleTimeline = {
    cycleLength: predictions.displayCycleLength,
    cycleDay: predictions.lastPeriodStart
      ? diffDaysUTC(dateOnlyToUTCDate(todayISODate()), predictions.lastPeriodStart) + 1
      : null,
    markers: [
      {
        label: "Period",
        startDay: 1,
        endDay:
          periods[0]?.endDate && predictions.lastPeriodStart
            ? diffDaysUTC(periods[0].endDate, predictions.lastPeriodStart) + 1
            : profile.periodLengthTypical ?? 5,
        tone: "period" as const,
      },
      ...(predictions.fertileWindowStart && predictions.fertileWindowEnd && predictions.lastPeriodStart
        ? [
            {
              label: "Fertile",
              startDay: diffDaysUTC(predictions.fertileWindowStart, predictions.lastPeriodStart) + 1,
              endDay: diffDaysUTC(predictions.fertileWindowEnd, predictions.lastPeriodStart) + 1,
              tone: "fertile" as const,
            },
          ]
        : []),
      ...(predictions.nextPeriodWindowStart && predictions.nextPeriodWindowEnd && predictions.lastPeriodStart
        ? [
            {
              label: "Predicted",
              startDay: diffDaysUTC(predictions.nextPeriodWindowStart, predictions.lastPeriodStart) + 1,
              endDay: diffDaysUTC(predictions.nextPeriodWindowEnd, predictions.lastPeriodStart) + 1,
              tone: "predicted" as const,
            },
          ]
        : []),
    ],
  };

  return (
    <CalendarExperience
      monthLabel={month.monthLabel}
      monthParam={monthParam}
      view={view}
      viewLinks={{
        month: `/calendar?m=${monthParam}&d=${selectedIso}&view=month`,
        cycle: `/calendar?m=${monthParam}&d=${selectedIso}&view=cycle`,
      }}
      cells={month.cells}
      prevHref={`/calendar?m=${prevM}&d=${selectedIso}&view=${view}`}
      todayHref={`/calendar?m=${ymString(todayY, todayM)}&d=${todayISODate()}&view=${view}`}
      nextHref={`/calendar?m=${nextM}&d=${selectedIso}&view=${view}`}
      loggedDaysCount={monthLogs.length}
      monthSummary={{
        periodDays: month.cells.filter((cell) => cell?.isActual).length,
        predictedDays: month.cells.filter((cell) => cell?.isPredicted).length,
        fertileDays: month.cells.filter((cell) => cell?.isFertile).length,
      }}
      cycleTimeline={cycleTimeline}
      selectedLog={
        selectedLogDoc
          ? {
              mood: typeof selectedLogDoc.mood === "number" ? selectedLogDoc.mood : null,
              flow: selectedLogDoc.flow ?? null,
              notes: selectedLogDoc.notes ?? null,
              bbt: typeof selectedLogDoc.bbt === "number" ? selectedLogDoc.bbt : null,
              mucusType: selectedLogDoc.mucusType ?? null,
              sex: Boolean(selectedLogDoc.sex),
              contraception: selectedLogDoc.contraception ?? null,
            }
          : null
      }
      cycleInfo={predictions.lastPeriodStart ? {
        cycleDay: predictions.lastPeriodStart
          ? diffDaysUTC(dateOnlyToUTCDate(todayISODate()), predictions.lastPeriodStart) + 1
          : null,
        phaseLabel: predictions.currentPhase?.phaseLabel ?? null,
        daysUntilNextPeriod: predictions.nextPeriodPredictedStart
          ? diffDaysUTC(predictions.nextPeriodPredictedStart, today)
          : null,
        isInFertileWindow: predictions.fertileWindowStart && predictions.fertileWindowEnd
          ? today >= predictions.fertileWindowStart && today <= predictions.fertileWindowEnd
          : false,
      } : null}
    />
  );
}
