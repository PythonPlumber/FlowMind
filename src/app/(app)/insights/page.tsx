import { subDays } from "date-fns";

import { InsightChartCard } from "@/components/insights/InsightChartCard";
import { InsightsCharts } from "@/components/insights/InsightsCharts";
import { InsightsSummary } from "@/components/insights/InsightsSummary";
import { PageIntro } from "@/components/ui/page-intro";
import { diffDaysUTC, utcDateToISODate } from "@/lib/dateOnly";
import { dbConnect } from "@/lib/db";
import { requireOnboardedProfile } from "@/lib/guards";
import { buildInsightsSummary } from "@/lib/insights";
import {
  calculateCycleHealthScore,
  detectHealthIndicatorFlags,
  analyzeAnomalies,
  analyzeLongTermTrends,
  analyzeTemporalSymptomPatterns,
  buildTrendAnalysis,
  fuseOvulationSignals,
  generateSmartNotifications,
  predictComfortIndex,
  type TemporalPattern,
  type AnomalyDetectionResult,
  type HealthIndicatorFlag,
  type LongTermTrend,
  type SmartNotification,
} from "@/lib/advancedAnalytics";
import { CustomSymptom } from "@/models/CustomSymptom";
import { DailyLog } from "@/models/DailyLog";
import { DailyLogSymptom } from "@/models/DailyLogSymptom";
import { Period } from "@/models/Period";
import { SymptomDefinition } from "@/models/SymptomDefinition";
import { computePredictions } from "@/lib/predictions";
import {
  HealthScoreCard,
  AnomalyAlertCard,
  ComfortPredictionCard,
  HealthIndicatorsPanel,
  TrendVisualization,
  TemporalPatternChart,
  SmartNotificationBanner,
  PhaseAnalysisCard,
  CycleHealthGauge,
} from "@/components/analytics/AdvancedAnalytics";

export default async function InsightsPage() {
  const { userId } = await requireOnboardedProfile();
  await dbConnect();

  const periods = await Period.find({ userId }).sort({ startDate: 1 }).limit(60).lean();

  const cyclePoints: Array<{ date: string; length: number }> = [];
  for (let index = 1; index < periods.length; index++) {
    const prev = periods[index - 1]!;
    const current = periods[index]!;
    const length = diffDaysUTC(current.startDate, prev.startDate);
    if (length > 0 && length <= 120) {
      cyclePoints.push({ date: utcDateToISODate(current.startDate), length });
    }
  }

  const periodPoints: Array<{ date: string; length: number }> = [];
  for (const period of periods) {
    if (!period.endDate) continue;
    const length = diffDaysUTC(period.endDate, period.startDate) + 1;
    if (length > 0 && length <= 30) {
      periodPoints.push({ date: utcDateToISODate(period.startDate), length });
    }
  }

  const cutoff = subDays(new Date(), 180);
  const logs = await DailyLog.find({ userId, logDate: { $gte: cutoff } }).lean();
  const moodLogs = await DailyLog.find({
    userId,
    logDate: { $gte: cutoff },
    mood: { $exists: true },
  })
    .sort({ logDate: 1 })
    .select({ logDate: 1, mood: 1, bbt: 1, mucusType: 1, flow: 1, notes: 1, sex: 1 })
    .lean();
  const logIds = logs.map((log) => log._id);
  const symptomRows =
    logIds.length > 0
      ? await DailyLogSymptom.find({ userId, dailyLogId: { $in: logIds } }).lean()
      : [];

  const definitions = await SymptomDefinition.find({}).lean();
  const definitionMap = new Map(definitions.map((definition) => [definition.key, definition.label]));
  const customSymptoms = await CustomSymptom.find({ userId }).lean();
  const customMap = new Map(customSymptoms.map((symptom) => [String(symptom._id), symptom.label]));

  const counts = new Map<string, number>();
  for (const symptom of symptomRows) {
    let label: string | null = null;
    if (symptom.symptomKey) label = definitionMap.get(symptom.symptomKey) ?? symptom.symptomKey;
    if (symptom.customSymptomId) {
      label = customMap.get(String(symptom.customSymptomId)) ?? "Custom";
    }
    if (!label) continue;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const symptomTop = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([label, count]) => ({ label, count }));

  const moodPoints = moodLogs
    .filter((log) => typeof log.mood === "number")
    .map((log) => ({ date: utcDateToISODate(log.logDate), mood: log.mood as number }));

  const bodySignalCoverage = {
    bbtDays: moodLogs.filter((log) => typeof log.bbt === "number").length,
    mucusDays: moodLogs.filter((log) => typeof log.mucusType === "string").length,
  };

  const summary = buildInsightsSummary({ cyclePoints, periodPoints, moodPoints, symptomTop });

  const dailyLogs = moodLogs.map((log) => ({
    logDate: log.logDate,
    bbt: log.bbt,
    mucusType: log.mucusType,
    mood: log.mood,
    flow: log.flow,
    notes: log.notes,
    sex: log.sex,
    symptoms: [] as Array<{ label: string; severity?: number }>,
  }));

  const predictions = periods.length > 0
    ? computePredictions(periods, dailyLogs, {
        cycleLengthTypical: 28,
        periodLengthTypical: 5,
      })
    : null;

  const cycleLengthTrend = cyclePoints.length >= 3
    ? (() => {
        const recent = cyclePoints.slice(-3).map(p => p.length);
        const older = cyclePoints.slice(-6, -3).map(p => p.length);
        if (older.length === 0) return null;
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        return {
          direction: recentAvg > olderAvg + 1 ? "longer" : recentAvg < olderAvg - 1 ? "shorter" : "stable",
          diff: Math.round(Math.abs(recentAvg - olderAvg) * 10) / 10,
        };
      })()
    : null;

  const mostConsistentSymptoms = symptomTop
    .filter(s => {
      const recentSymptoms = symptomRows.filter(row => {
        const label = definitionMap.get(row.symptomKey ?? "") ?? row.symptomKey ?? "";
        return label === s.label || String(row.customSymptomId) === s.label;
      });
      return recentSymptoms.length >= 3;
    })
    .slice(0, 5);

  const loggingStreak = (() => {
    let streak = 0;
    let cursor = new Date();
    const logDates = new Set(logs.map(l => utcDateToISODate(l.logDate)));
    while (logDates.has(utcDateToISODate(cursor))) {
      streak++;
      cursor = subDays(cursor, 1);
    }
    return streak;
  })();

  const anomalies: AnomalyDetectionResult[] = predictions
    ? analyzeAnomalies(periods, dailyLogs, {
        nextPeriodWindowStart: predictions.nextPeriodWindowStart,
        nextPeriodWindowEnd: predictions.nextPeriodWindowEnd,
        displayCycleLength: predictions.displayCycleLength,
        medianPeriodLength: predictions.medianPeriodLength,
      })
    : [];

  const healthScore = predictions
    ? calculateCycleHealthScore(periods, dailyLogs, anomalies)
    : null;

  const temporalPatterns: TemporalPattern[] = analyzeTemporalSymptomPatterns(periods, dailyLogs);

  const longTermTrends: LongTermTrend[] = analyzeLongTermTrends(periods, dailyLogs);

  const healthFlags: HealthIndicatorFlag[] = healthScore
    ? detectHealthIndicatorFlags(periods, dailyLogs, healthScore)
    : [];

  const trendAnalysis = buildTrendAnalysis(periods, dailyLogs);

  const comfortPrediction = predictions && predictions.currentPhase
    ? predictComfortIndex(dailyLogs, temporalPatterns, predictions.cycleDay ?? 1, predictions.currentPhase.phase)
    : null;

  const notifications: SmartNotification[] = predictions
    ? generateSmartNotifications(
        {
          nextPeriodPredictedStart: predictions.nextPeriodPredictedStart,
          fertileWindowStart: predictions.fertileWindowStart,
          fertileWindowEnd: predictions.fertileWindowEnd,
          currentPhase: predictions.currentPhase?.phase ?? "menstruation",
          cycleDay: predictions.cycleDay,
        },
        dailyLogs,
        anomalies,
        temporalPatterns
      )
    : [];

  const ovulationFusion = periods.length > 0 && dailyLogs.length >= 5
    ? fuseOvulationSignals(dailyLogs, periods[periods.length - 1]!.startDate, 28)
    : null;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Advanced Analysis"
        title="Deep Insights"
        description="Comprehensive cycle intelligence powered by multi-signal analysis and long-term pattern recognition."
        meta={
          <>
            <span>{cyclePoints.length} cycles analyzed</span>
            <span>{dailyLogs.length} days of data</span>
            {healthScore && <span>Health: {healthScore.overall}/100</span>}
            {loggingStreak > 0 && <span>{loggingStreak} day streak</span>}
          </>
        }
      />

      {notifications.length > 0 && (
        <SmartNotificationBanner notifications={notifications} />
      )}

      {healthScore && <HealthScoreCard healthScore={healthScore} />}

      {anomalies.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/30 p-4">
          <h3 className="mb-3 text-sm font-semibold text-[color:var(--foreground)]">Anomaly Detection</h3>
          <AnomalyAlertCard anomalies={anomalies} />
        </div>
      )}

      {predictions && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-5 [box-shadow:var(--shadow-inset)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
              Prediction Confidence
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
              {predictions.confidenceScore}%
            </p>
            <p className="mt-1 text-xs text-[color:var(--ink-soft)]">
              {predictions.confidenceBreakdown.bbtSignalBonus > 0 && <span className="text-emerald-600">+BBT </span>}
              {predictions.confidenceBreakdown.mucusSignalBonus > 0 && <span className="text-teal-600">+Mucus </span>}
              {predictions.confidenceBreakdown.discrepancyPenalty > 0 && <span className="text-amber-600">-Adjust </span>}
            </p>
          </div>

          <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-5 [box-shadow:var(--shadow-inset)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
              Cycle Health
            </p>
            <div className="mt-2 flex items-center gap-3">
              <CycleHealthGauge score={healthScore?.overall ?? 0} grade={healthScore?.healthGrade ?? "fair"} />
            </div>
          </div>

          <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-5 [box-shadow:var(--shadow-inset)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
              Cycle variability
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
              ±{predictions.variabilityDays}
            </p>
            <p className="mt-1 text-xs text-[color:var(--ink-soft)]">
              days swing
            </p>
          </div>

          <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-5 [box-shadow:var(--shadow-inset)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
              Cycle trend
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
              {cycleLengthTrend?.direction ?? "—"}
            </p>
            <p className="mt-1 text-xs text-[color:var(--ink-soft)]">
              {cycleLengthTrend ? `${cycleLengthTrend.diff} days vs prior` : "Not enough data"}
            </p>
          </div>
        </div>
      )}

      {comfortPrediction && <ComfortPredictionCard comfort={comfortPrediction} />}

      {ovulationFusion && ovulationFusion.detected && (
        <div className="rounded-2xl border border-purple-200 bg-purple-50/30 p-4">
          <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Multi-Signal Ovulation Detection</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-white/60 p-4">
              <p className="text-xs text-[color:var(--ink-soft)]">Bayesian Confidence</p>
              <p className="mt-1 text-2xl font-bold text-purple-600">
                {Math.round(ovulationFusion.bayesianProbability * 100)}%
              </p>
            </div>
            {ovulationFusion.actualLutealPhase && (
              <div className="rounded-xl bg-white/60 p-4">
                <p className="text-xs text-[color:var(--ink-soft)]">Actual Luteal Phase</p>
                <p className="mt-1 text-2xl font-bold text-purple-600">
                  {ovulationFusion.actualLutealPhase} days
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 space-y-2">
            {ovulationFusion.signals.map((signal, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-lg p-3 ${signal.detected ? "bg-white/60" : "bg-gray-100/50"}`}>
                <div className={`h-2 w-2 rounded-full ${signal.detected ? "bg-emerald-500" : "bg-gray-300"}`} />
                <span className="text-sm font-medium capitalize">{signal.type.replace(/_/g, " ")}</span>
                <span className="ml-auto text-xs text-[color:var(--ink-soft)]">
                  {signal.detected ? `${Math.round(signal.contribution * 100)}% contribution` : "Not detected"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {temporalPatterns.length > 0 && <TemporalPatternChart patterns={temporalPatterns} />}

      {longTermTrends.length > 0 && <TrendVisualization trends={longTermTrends} />}

      {healthFlags.length > 0 && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/30 p-4">
          <HealthIndicatorsPanel flags={healthFlags} />
        </div>
      )}

      {trendAnalysis.seasonalPatterns && (
        <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
          <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Seasonal Patterns</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-[color:var(--paper-muted)] p-4">
              <p className="text-sm font-medium text-amber-600">❄️ Winter</p>
              <p className="mt-2 text-2xl font-semibold">
                {trendAnalysis.seasonalPatterns.winter.avgCycleLength} days
              </p>
              <p className="text-xs text-[color:var(--ink-soft)]">avg cycle length</p>
            </div>
            <div className="rounded-xl bg-[color:var(--paper-muted)] p-4">
              <p className="text-sm font-medium text-orange-600">☀️ Summer</p>
              <p className="mt-2 text-2xl font-semibold">
                {trendAnalysis.seasonalPatterns.summer.avgCycleLength} days
              </p>
              <p className="text-xs text-[color:var(--ink-soft)]">avg cycle length</p>
            </div>
          </div>
        </div>
      )}

      {trendAnalysis.driftAnalysis.direction !== "stable" && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/30 p-4">
          <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Cycle Length Drift</h3>
          <div className="mt-3 flex items-center gap-4">
            <div className={`rounded-full px-3 py-1 text-sm font-medium ${
              trendAnalysis.driftAnalysis.direction === "lengthening" 
                ? "bg-amber-100 text-amber-700" 
                : "bg-teal-100 text-teal-700"
            }`}>
              {trendAnalysis.driftAnalysis.direction === "lengthening" ? "Lengthening ↑" : "Shortening ↓"}
            </div>
            <span className="text-sm">
              {Math.abs(trendAnalysis.driftAnalysis.ratePerMonth)} days/month
            </span>
            <span className="text-xs text-[color:var(--ink-soft)]">
              {Math.round(trendAnalysis.driftAnalysis.confidence * 100)}% confidence
            </span>
          </div>
        </div>
      )}

      <InsightsSummary
        typicalCycle={summary.typicalCycle}
        typicalPeriod={summary.typicalPeriod}
        variability={summary.variability}
        averageMood={summary.averageMood}
        highlight={summary.highlight}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <InsightChartCard title="Cycle length trend" description="Days between period starts.">
          <InsightsCharts kind="cycle" data={cyclePoints} />
        </InsightChartCard>

        <InsightChartCard title="Period length" description="Duration of completed periods.">
          <InsightsCharts kind="period" data={periodPoints} />
        </InsightChartCard>

        <InsightChartCard
          title="Mood trend"
          description="How your logged mood shifts over time."
        >
          <InsightsCharts kind="mood" data={moodPoints} />
        </InsightChartCard>

        <InsightChartCard
          title="Body signal coverage"
          description="How often advanced fertility cues are being captured."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-5 [box-shadow:var(--shadow-inset)]">
              <p className="text-sm text-[color:var(--ink-soft)]">BBT days</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                {bodySignalCoverage.bbtDays}
              </p>
              <p className="mt-1 text-xs text-[color:var(--ink-soft)]">
                {moodLogs.length > 0 
                  ? `${Math.round((bodySignalCoverage.bbtDays / moodLogs.length) * 100)}% of logged days`
                  : "No data"}
              </p>
            </div>
            <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-5 [box-shadow:var(--shadow-inset)]">
              <p className="text-sm text-[color:var(--ink-soft)]">Mucus days</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                {bodySignalCoverage.mucusDays}
              </p>
              <p className="mt-1 text-xs text-[color:var(--ink-soft)]">
                {moodLogs.length > 0 
                  ? `${Math.round((bodySignalCoverage.mucusDays / moodLogs.length) * 100)}% of logged days`
                  : "No data"}
              </p>
            </div>
          </div>
        </InsightChartCard>

        <div className="lg:col-span-2">
          <InsightChartCard
            title="Most common symptoms"
            description="Count of days each symptom was logged in the last six months."
          >
            <InsightsCharts kind="symptoms" data={symptomTop} />
          </InsightChartCard>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(trendAnalysis.symptomFrequencyByPhase).map(([phase, count]) => (
          count > 0 && (
            <PhaseAnalysisCard
              key={phase}
              phase={phase}
              symptomCount={Math.round(count)}
              moodAvg={trendAnalysis.moodAveragesByPhase[phase] || 3}
              flowIntensity={phase === "menstruation" ? trendAnalysis.flowIntensityByPhase[phase] || 2.5 : 0.5}
              idealFor={
                phase === "follicular_late" ? ["New projects", "Social events", "Exercise"] :
                phase === "ovulation" ? ["Important conversations", "Date night", "High energy"] :
                phase === "luteal_early" ? ["Focused work", "Routine", "Planning"] :
                phase === "luteal_late" ? ["Self-care", "Rest", "Gentle movement"] :
                phase === "menstruation" ? ["Rest", "Introspection", "Hydration"] :
                undefined
              }
            />
          )
        ))}
      </div>

      {mostConsistentSymptoms.length > 0 && (
        <div className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper-muted)] p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
            Consistently tracked
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
            Symptoms to watch
          </h3>
          <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
            These symptoms appear regularly and may show meaningful patterns.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {mostConsistentSymptoms.map((symptom) => (
              <span
                key={symptom.label}
                className="rounded-full bg-[color:var(--brand)]/10 px-4 py-2 text-sm font-medium text-[color:var(--brand)]"
              >
                {symptom.label} ({symptom.count}x)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}