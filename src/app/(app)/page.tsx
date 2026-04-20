import { DashboardExperience } from "@/components/dashboard/DashboardExperience";
import {
  currentYearInTimeZone,
  dateOnlyToUTCDate,
  diffDaysUTC,
  todayISODate,
  utcDateToISODate,
} from "@/lib/dateOnly";
import { buildCycleVisualizationModel } from "@/lib/cycleVisualization";
import { dbConnect } from "@/lib/db";
import { requireOnboardedProfile } from "@/lib/guards";
import { computePredictions } from "@/lib/predictions";
import { DailyLog } from "@/models/DailyLog";
import { Period } from "@/models/Period";

function relativeDay(target: Date | null, origin: Date | null) {
  if (!target || !origin) return null;
  return diffDaysUTC(target, origin) + 1;
}

export default async function DashboardPage() {
  const { userId, profile } = await requireOnboardedProfile();
  await dbConnect();

  const periods = await Period.find({ userId }).sort({ startDate: -1 }).limit(24).lean();
  const recentLogs = await DailyLog.find({ userId })
    .sort({ logDate: -1 })
    .limit(14)
    .lean();

  const defaults = {
    cycleLengthTypical: profile.cycleLengthTypical ?? 28,
    periodLengthTypical: profile.periodLengthTypical ?? 5,
  };

  const dailyLogs = recentLogs.map((log) => ({
    logDate: log.logDate,
    bbt: log.bbt,
    mucusType: log.mucusType,
    mood: log.mood,
    flow: log.flow,
  }));

  const predictions = computePredictions(periods, dailyLogs, defaults);
  const todayIso = todayISODate();
  const todayUtc = dateOnlyToUTCDate(todayIso);
  const cycleDay =
    predictions.lastPeriodStart ? diffDaysUTC(todayUtc, predictions.lastPeriodStart) + 1 : null;
  const age =
    typeof profile.birthYear === "number" ? currentYearInTimeZone() - profile.birthYear : null;
  const latestPeriod = periods[0];

  const nextPeriodLeadDays = predictions.nextPeriodPredictedStart
    ? diffDaysUTC(predictions.nextPeriodPredictedStart, todayUtc)
    : null;

  const inFertileWindow =
    predictions.fertileWindowStart &&
    predictions.fertileWindowEnd &&
    todayUtc >= predictions.fertileWindowStart &&
    todayUtc <= predictions.fertileWindowEnd;

  const isPeriodActive = latestPeriod && 
    (!latestPeriod.endDate || latestPeriod.endDate >= todayUtc);

  const phaseLabel = predictions.currentPhase?.phaseLabel 
    ?? (isPeriodActive 
      ? "Period in progress" 
      : nextPeriodLeadDays !== null && nextPeriodLeadDays <= 4 && nextPeriodLeadDays >= 0
        ? "Late luteal phase"
        : inFertileWindow
          ? "Fertile phase"
          : cycleDay
            ? predictions.irregularityLevel === "high_variability"
              ? "Adaptive range tracking"
              : predictions.irregularityLevel === "long_cycle"
                ? "Long-cycle rhythm"
                : "Steady cycle rhythm"
            : "Waiting for first cycle");

  const phaseDescription = predictions.currentPhase?.phaseDescription 
    ?? (isPeriodActive
      ? "Your period has started. Take care of yourself during this time."
      : nextPeriodLeadDays !== null && nextPeriodLeadDays <= 4 && nextPeriodLeadDays >= 0
        ? "Your body is preparing for menstruation. Symptoms may intensify."
        : inFertileWindow
          ? "You are in your fertile window. Conception is most likely during this time."
          : "Keep logging daily to maintain accurate predictions.");

  const currentCyclePeriodLength = predictions.lastPeriodStart
    ? Math.max(
        0,
        diffDaysUTC(
          latestPeriod?.endDate && latestPeriod.endDate < todayUtc ? latestPeriod.endDate : todayUtc,
          predictions.lastPeriodStart
        ) + 1
      )
    : 0;

  const daysUntilNextPeriod = predictions.nextPeriodPredictedStart
    ? diffDaysUTC(predictions.nextPeriodPredictedStart, todayUtc)
    : null;

  const cycleRing = buildCycleVisualizationModel({
    cycleLength: predictions.displayCycleLength,
    cycleDay,
    actualPeriodLength: currentCyclePeriodLength,
    fertileWindowStartDay: relativeDay(predictions.fertileWindowStart, predictions.lastPeriodStart),
    fertileWindowEndDay: relativeDay(predictions.fertileWindowEnd, predictions.lastPeriodStart),
    predictedWindowStartDay: relativeDay(predictions.nextPeriodWindowStart, predictions.lastPeriodStart),
    predictedWindowEndDay: relativeDay(predictions.nextPeriodWindowEnd, predictions.lastPeriodStart),
    confidenceScore: predictions.confidenceScore,
    irregularityLevel: predictions.irregularityLevel,
    cycleLengthRange: predictions.cycleLengthRange,
    ovulationEstimateDay: predictions.lastPeriodStart ? predictions.displayCycleLength - 14 : null,
    currentPhase: predictions.currentPhase?.phase,
    daysUntilNextPeriod,
    ovulationProbability: predictions.ovulationProbability,
  });

  const fertileWindowDaysAway = predictions.fertileWindowStart
    ? diffDaysUTC(predictions.fertileWindowStart, todayUtc)
    : null;

  const guidanceByGoal = {
    track:
      predictions.irregularityLevel === "high_variability"
        ? "Focus on logging starts and symptoms so the range tightens over time."
        : "Keep checking in so the rhythm stays well-defined.",
    conceive:
      predictions.fertileWindowStart && predictions.fertileWindowEnd
        ? `Fertile estimate runs ${utcDateToISODate(predictions.fertileWindowStart)} to ${utcDateToISODate(predictions.fertileWindowEnd)}.`
        : "Log more cycle starts to improve fertile estimates.",
    avoid:
      "Treat fertile estimates conservatively. This tracker is not birth control.",
  } as const;

  const confidenceLabel = predictions.confidenceScore >= 75
    ? "High confidence"
    : predictions.confidenceScore >= 50
      ? "Medium confidence"
      : "Building confidence";

  const rhythmLabel = predictions.irregularityLevel === "stable"
    ? `${predictions.displayCycleLength} day rhythm`
    : predictions.irregularityLevel === "high_variability"
      ? `${predictions.cycleLengthRange.min}-${predictions.cycleLengthRange.max} day range`
      : predictions.irregularityLevel === "long_cycle"
        ? `${predictions.displayCycleLength}+ day cycles`
        : predictions.irregularityLevel === "shifting"
          ? "Shifting rhythm"
          : "Building rhythm";

  return (
    <DashboardExperience
      todayLabel={todayIso}
      age={age}
      goalMode={profile.goalMode ?? "track"}
      phaseLabel={phaseLabel}
      cycleRing={cycleRing}
      predictions={predictions}
      cycleHealth={[
        { label: "Current cycle day", value: cycleDay ? String(cycleDay) : "Waiting" },
        {
          label: "Usual range",
          value:
            predictions.cycleLengthRange.min === predictions.cycleLengthRange.max
              ? `${predictions.cycleLengthRange.min} days`
              : `${predictions.cycleLengthRange.min}-${predictions.cycleLengthRange.max} days`,
        },
        { label: "Current confidence", value: `${predictions.confidenceScore}%` },
        {
          label: "Pattern",
          value:
            predictions.irregularityLevel === "high_variability"
              ? "High variability"
              : predictions.irregularityLevel === "long_cycle"
                ? "Long-cycle pattern observed"
                : predictions.irregularityLevel === "shifting"
                  ? "Shifting rhythm"
                  : predictions.irregularityLevel === "stable"
                    ? "Stable rhythm"
                    : "Building history",
        },
        {
          label: "Last period",
          value: predictions.lastPeriodStart ? utcDateToISODate(predictions.lastPeriodStart) : "Not logged",
        },
        {
          label: "Goal-aware note",
          value: guidanceByGoal[(profile.goalMode ?? "track") as keyof typeof guidanceByGoal],
        },
        ...(predictions.currentPhase ? [
          { label: "Phase", value: predictions.currentPhase.phaseLabel },
          { label: "Phase day", value: String(predictions.currentPhase.daysIntoPhase + 1) },
        ] : []),
      ]}
      nextPeriodWindow={
        predictions.nextPeriodWindowStart && predictions.nextPeriodWindowEnd
          ? {
              start: utcDateToISODate(predictions.nextPeriodWindowStart),
              end: utcDateToISODate(predictions.nextPeriodWindowEnd),
              variabilityLabel:
                predictions.irregularityLevel === "high_variability"
                  ? "Wider range detected. Treat this as an expected window, not a precise day."
                  : predictions.irregularityLevel === "long_cycle"
                    ? "Longer cycles are consistent lately, so timing stays adaptive but focused."
                    : predictions.variabilityDays <= 2
                      ? "Low swing across recent cycles."
                      : "Moderate movement in recent cycle timing.",
              daysAway: daysUntilNextPeriod ?? 0,
            }
          : null
      }
      fertileWindow={
        predictions.fertileWindowStart && predictions.fertileWindowEnd
          ? {
              start: utcDateToISODate(predictions.fertileWindowStart),
              end: utcDateToISODate(predictions.fertileWindowEnd),
              daysAway: fertileWindowDaysAway !== null && fertileWindowDaysAway > 0 ? fertileWindowDaysAway : null,
            }
          : null
      }
      latestLog={
        recentLogs[0]
          ? {
              date: utcDateToISODate(recentLogs[0].logDate),
              mood: typeof recentLogs[0].mood === "number" ? recentLogs[0].mood : null,
              flow: recentLogs[0].flow ?? null,
              bbt: typeof recentLogs[0].bbt === "number" ? recentLogs[0].bbt : null,
              mucusType: recentLogs[0].mucusType ?? null,
              sex: Boolean(recentLogs[0].sex),
              contraception: recentLogs[0].contraception ?? null,
              notes: recentLogs[0].notes ?? null,
            }
          : null
      }
      trackingStreak={(() => {
        let streak = 0;
        let cursor = todayUtc;
        const recentLogDays = new Set(recentLogs.map((log) => utcDateToISODate(log.logDate)));
        while (recentLogDays.has(utcDateToISODate(cursor))) {
          streak += 1;
          cursor = new Date(cursor.getTime());
          cursor.setUTCDate(cursor.getUTCDate() - 1);
        }
        return streak;
      })()}
      confidenceLabel={confidenceLabel}
      rhythmLabel={rhythmLabel}
      phaseDescription={phaseDescription}
    />
  );
}
