import { ensureDefaultSymptomsSeeded } from "@/lib/symptoms";
import { dbConnect } from "@/lib/db";
import { requireOnboardedProfile } from "@/lib/guards";
import { dateOnlyToUTCDate, diffDaysUTC, isoDateSchema, todayISODate, utcDateToISODate } from "@/lib/dateOnly";
import { DailyLog } from "@/models/DailyLog";
import { DailyLogSymptom } from "@/models/DailyLogSymptom";
import { SymptomDefinition } from "@/models/SymptomDefinition";
import { CustomSymptom } from "@/models/CustomSymptom";
import { Period } from "@/models/Period";
import { Profile } from "@/models/Profile";
import { DailyLogForm } from "@/components/log/DailyLogForm";
import { PageIntro } from "@/components/ui/page-intro";
import { computePredictions } from "@/lib/predictions";

function safeDateParam(date: string | undefined) {
  const parsed = isoDateSchema.safeParse(date);
  return parsed.success ? parsed.data : null;
}

export default async function LogPage(props: {
  searchParams?: Promise<{ date?: string }>;
}) {
  const params = props.searchParams ? await props.searchParams : {};
  const { userId } = await requireOnboardedProfile();
  await dbConnect();
  await ensureDefaultSymptomsSeeded();

  const selectedIso = safeDateParam(params?.date) ?? todayISODate();
  const logDate = dateOnlyToUTCDate(selectedIso);

  const [definitions, customSymptoms, dailyLog, profile, periods, recentLogs] = await Promise.all([
    SymptomDefinition.find({}).sort({ category: 1, label: 1 }).lean(),
    CustomSymptom.find({ userId }).sort({ label: 1 }).lean(),
    DailyLog.findOne({ userId, logDate }).lean(),
    Profile.findOne({ userId }).lean(),
    Period.find({ userId }).sort({ startDate: -1 }).limit(24).lean(),
    DailyLog.find({ userId }).sort({ logDate: -1 }).limit(60).lean(),
  ]);

  const symptomRows = dailyLog?._id
    ? await DailyLogSymptom.find({ userId, dailyLogId: dailyLog._id }).lean()
    : [];

  const customMap = new Map(customSymptoms.map((c) => [String(c._id), c.label]));

  const selectedPredefined: Record<string, number> = {};
  const selectedCustom: Record<string, number> = {};

  for (const s of symptomRows) {
    if (s.symptomKey) selectedPredefined[s.symptomKey] = s.severity ?? 1;
    if (s.customSymptomId) {
      const id = String(s.customSymptomId);
      const label = customMap.get(id);
      if (label) selectedCustom[label] = s.severity ?? 1;
    }
  }

  type Flow = "" | "spotting" | "light" | "medium" | "heavy";
  const initialFlow: Flow =
    dailyLog?.flow === "spotting" ||
    dailyLog?.flow === "light" ||
    dailyLog?.flow === "medium" ||
    dailyLog?.flow === "heavy"
      ? dailyLog.flow
      : "";
  const initialMood: "" | number =
    typeof dailyLog?.mood === "number" ? dailyLog.mood : "";

  const dailyLogs = recentLogs.map((log) => ({
    logDate: log.logDate,
    bbt: log.bbt,
    mucusType: log.mucusType,
    mood: log.mood,
    flow: log.flow,
  }));

  const predictions = profile && periods.length > 0
    ? computePredictions(periods, dailyLogs, {
        cycleLengthTypical: profile.cycleLengthTypical ?? 28,
        periodLengthTypical: profile.periodLengthTypical ?? 5,
      })
    : null;

  const today = dateOnlyToUTCDate(todayISODate());
  const cycleContext = predictions?.lastPeriodStart
    ? {
        phaseLabel: predictions.currentPhase?.phaseLabel ?? "Unknown",
        cycleDay: predictions.lastPeriodStart
          ? diffDaysUTC(today, predictions.lastPeriodStart) + 1
          : null,
        daysUntilNextPeriod: predictions.nextPeriodPredictedStart
          ? diffDaysUTC(predictions.nextPeriodPredictedStart, today)
          : null,
        isInFertileWindow: predictions.fertileWindowStart && predictions.fertileWindowEnd
          ? today >= predictions.fertileWindowStart && today <= predictions.fertileWindowEnd
          : false,
      }
    : null;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Check-in"
        title="Daily check-in"
        description="A calmer daily capture for flow, body cues, symptoms, and notes."
        meta={<span>{utcDateToISODate(logDate)}</span>}
      />

      <DailyLogForm
        initial={{
          date: selectedIso,
          flow: initialFlow,
          mood: initialMood,
          notes: dailyLog?.notes ?? "",
          bbt: typeof dailyLog?.bbt === "number" ? dailyLog.bbt : "",
          mucusType:
            dailyLog?.mucusType === "dry" ||
            dailyLog?.mucusType === "sticky" ||
            dailyLog?.mucusType === "creamy" ||
            dailyLog?.mucusType === "watery" ||
            dailyLog?.mucusType === "eggwhite"
              ? dailyLog.mucusType
              : "",
          sex: typeof dailyLog?.sex === "boolean" ? dailyLog.sex : null,
          contraception: dailyLog?.contraception ?? "",
          selectedPredefined,
          selectedCustom,
        }}
        definitions={definitions.map((d) => ({
          key: d.key,
          label: d.label,
          category: d.category,
        }))}
        existingCustomSymptoms={customSymptoms.map((c) => c.label)}
        cycleContext={cycleContext}
      />
    </div>
  );
}
