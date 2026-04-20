"use client";

import { Activity, AlertTriangle, TrendingDown, TrendingUp, Zap } from "lucide-react";

import type { CycleHealthScore, AnomalyDetectionResult, ComfortPrediction, HealthIndicatorFlag, LongTermTrend, TemporalPattern } from "@/lib/advancedAnalytics";

interface HealthScoreCardProps {
  healthScore: CycleHealthScore;
}

export function HealthScoreCard({ healthScore }: HealthScoreCardProps) {
  const gradeColors = {
    excellent: "text-emerald-600",
    good: "text-teal-600",
    fair: "text-amber-600",
    needs_attention: "text-red-600",
  };

  const gradeBgColors = {
    excellent: "bg-emerald-50 border-emerald-200",
    good: "bg-teal-50 border-teal-200",
    fair: "bg-amber-50 border-amber-200",
    needs_attention: "bg-red-50 border-red-200",
  };

  return (
    <div className={`rounded-2xl border p-4 ${gradeBgColors[healthScore.healthGrade]}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
            <span className={`text-xl font-bold ${gradeColors[healthScore.healthGrade]}`}>
              {healthScore.overall}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-[color:var(--foreground)]">Cycle Health Score</p>
            <p className={`text-xs font-semibold uppercase tracking-wider ${gradeColors[healthScore.healthGrade]}`}>
              {healthScore.healthGrade.replace("_", " ")}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-[color:var(--ink-soft)]">Anomalies detected</p>
          <p className={`text-lg font-bold ${healthScore.anomalyCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
            {healthScore.anomalyCount}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/60 p-3">
          <p className="text-xs text-[color:var(--ink-soft)]">Regularity</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-semibold">{healthScore.regularityScore}</span>
            <span className="text-xs text-[color:var(--ink-soft)]">/100</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-[color:var(--paper-muted)]">
            <div
              className="h-1.5 rounded-full bg-[color:var(--accent)]"
              style={{ width: `${healthScore.regularityScore}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-white/60 p-3">
          <p className="text-xs text-[color:var(--ink-soft)]">Flow Normalcy</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-semibold">{healthScore.flowNormalcyScore}</span>
            <span className="text-xs text-[color:var(--ink-soft)]">/100</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-[color:var(--paper-muted)]">
            <div
              className="h-1.5 rounded-full bg-[color:var(--accent)]"
              style={{ width: `${healthScore.flowNormalcyScore}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-white/60 p-3">
          <p className="text-xs text-[color:var(--ink-soft)]">Symptom Consistency</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-semibold">{healthScore.symptomConsistencyScore}</span>
            <span className="text-xs text-[color:var(--ink-soft)]">/100</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-[color:var(--paper-muted)]">
            <div
              className="h-1.5 rounded-full bg-[color:var(--accent)]"
              style={{ width: `${healthScore.symptomConsistencyScore}%` }}
            />
          </div>
        </div>

        <div className="rounded-lg bg-white/60 p-3">
          <p className="text-xs text-[color:var(--ink-soft)]">Data Completeness</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-semibold">{healthScore.dataCompletenessScore}</span>
            <span className="text-xs text-[color:var(--ink-soft)]">/100</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-[color:var(--paper-muted)]">
            <div
              className="h-1.5 rounded-full bg-[color:var(--accent)]"
              style={{ width: `${healthScore.dataCompletenessScore}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface AnomalyAlertCardProps {
  anomalies: AnomalyDetectionResult[];
}

export function AnomalyAlertCard({ anomalies }: AnomalyAlertCardProps) {
  if (anomalies.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-emerald-900">No anomalies detected</p>
            <p className="text-sm text-emerald-700">Your cycle patterns are consistent</p>
          </div>
        </div>
      </div>
    );
  }

  const significantCount = anomalies.filter((a) => a.severity === "significant").length;

  return (
    <div className="space-y-3">
      {significantCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="text-sm font-medium text-red-900">
            {significantCount} significant anomaly{significantCount > 1 ? "s" : ""} require attention
          </span>
        </div>
      )}

      {anomalies.map((anomaly, i) => (
        <div
          key={i}
          className={`rounded-xl border p-4 ${
            anomaly.severity === "significant"
              ? "border-red-200 bg-red-50/50"
              : anomaly.severity === "moderate"
              ? "border-amber-200 bg-amber-50/50"
              : "border-blue-200 bg-blue-50/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                anomaly.severity === "significant"
                  ? "bg-red-100"
                  : anomaly.severity === "moderate"
                  ? "bg-amber-100"
                  : "bg-blue-100"
              }`}
            >
              {anomaly.severity === "significant" ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <Activity className="h-4 w-4 text-amber-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[color:var(--foreground)]">{anomaly.description}</p>
              <p className="mt-1 text-sm text-[color:var(--ink-soft)]">{anomaly.recommendation}</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    anomaly.severity === "significant"
                      ? "bg-red-100 text-red-700"
                      : anomaly.severity === "moderate"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {anomaly.type.replace(/_/g, " ")}
                </span>
                {anomaly.deviation !== 0 && (
                  <span className="text-xs text-[color:var(--ink-soft)]">
                    Deviation: {anomaly.deviation > 0 ? "+" : ""}{anomaly.deviation} days
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface ComfortPredictionCardProps {
  comfort: ComfortPrediction;
}

export function ComfortPredictionCard({ comfort }: ComfortPredictionCardProps) {
  const getColor = (value: number, inverse?: boolean) => {
    const normalized = inverse ? 100 - value : value;
    if (normalized >= 70) return "text-emerald-600 bg-emerald-100";
    if (normalized >= 40) return "text-amber-600 bg-amber-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
      <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Today&apos;s Comfort Prediction</h3>
      
      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[color:var(--ink-soft)]">Energy Level</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`h-6 w-4 rounded-sm ${
                    n <= Math.round(comfort.energyLevel)
                      ? "bg-[color:var(--accent)]"
                      : "bg-[color:var(--paper-muted)]"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{comfort.energyLevel}/5</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[color:var(--ink-soft)]">Bloating Risk</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getColor(comfort.bloatingLikelihood, true)}`}>
            {comfort.bloatingLikelihood}% chance
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[color:var(--ink-soft)]">Cramp Probability</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getColor(comfort.crampProbability, true)}`}>
            {comfort.crampProbability}% chance
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[color:var(--ink-soft)]">Mood Tendency</span>
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`h-6 w-4 rounded-sm ${
                    n <= Math.round(comfort.moodTendency)
                      ? "bg-purple-400"
                      : "bg-[color:var(--paper-muted)]"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{comfort.moodTendency}/5</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-[color:var(--ink-soft)]">Breast Tenderness</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getColor(comfort.breastTendernessRisk, true)}`}>
            {comfort.breastTendernessRisk}% risk
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[color:var(--paper-muted)] p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Discomfort Index</span>
          <span className={`text-lg font-bold ${comfort.overallDiscomfort > 50 ? "text-amber-600" : "text-emerald-600"}`}>
            {comfort.overallDiscomfort}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-[color:var(--paper)]">
          <div
            className={`h-2 rounded-full ${
              comfort.overallDiscomfort > 60
                ? "bg-amber-500"
                : comfort.overallDiscomfort > 30
                ? "bg-teal-500"
                : "bg-emerald-500"
            }`}
            style={{ width: `${comfort.overallDiscomfort}%` }}
          />
        </div>
      </div>

      {comfort.recommendations.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--ink-soft)]">Suggestions</p>
          {comfort.recommendations.map((rec, i) => (
            <p key={i} className="text-sm text-[color:var(--ink-soft)]">• {rec}</p>
          ))}
        </div>
      )}
    </div>
  );
}

interface HealthIndicatorsPanelProps {
  flags: HealthIndicatorFlag[];
}

export function HealthIndicatorsPanel({ flags }: HealthIndicatorsPanelProps) {
  if (flags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Health Insights</h3>
      
      {flags.map((flag, i) => (
        <div
          key={i}
          className={`rounded-xl border p-4 ${
            flag.severity === "alert"
              ? "border-red-200 bg-red-50/50"
              : flag.severity === "warning"
              ? "border-amber-200 bg-amber-50/50"
              : "border-blue-200 bg-blue-50/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                flag.severity === "alert"
                  ? "bg-red-100"
                  : flag.severity === "warning"
                  ? "bg-amber-100"
                  : "bg-blue-100"
              }`}
            >
              {flag.severity === "alert" ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <Zap className="h-4 w-4 text-amber-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-[color:var(--foreground)]">{flag.title}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    flag.severity === "alert"
                      ? "bg-red-100 text-red-700"
                      : flag.severity === "warning"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {flag.severity}
                </span>
              </div>
              <p className="mt-1 text-sm text-[color:var(--ink-soft)]">{flag.description}</p>
              {flag.evidence.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {flag.evidence.map((e, j) => (
                    <li key={j} className="text-xs text-[color:var(--ink-soft)]">• {e}</li>
                  ))}
                </ul>
              )}
              <p className="mt-2 text-xs font-medium text-[color:var(--accent)]">{flag.recommendation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface TrendVisualizationProps {
  trends: LongTermTrend[];
}

export function TrendVisualization({ trends }: TrendVisualizationProps) {
  if (trends.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
        <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Long-Term Trends</h3>
        <p className="mt-4 text-sm text-[color:var(--ink-soft)]">Not enough data for trend analysis yet. Keep logging!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Long-Term Trends</h3>
      
      {trends.map((trend, i) => (
        <div key={i} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
          <div className="flex items-center gap-2">
            {trend.direction === "increasing" ? (
              <TrendingUp className="h-4 w-4 text-amber-600" />
            ) : trend.direction === "decreasing" ? (
              <TrendingDown className="h-4 w-4 text-teal-600" />
            ) : (
              <Activity className="h-4 w-4 text-[color:var(--accent)]" />
            )}
            <span className="text-sm font-medium capitalize">{trend.type.replace(/_/g, " ")}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              trend.direction === "increasing" ? "bg-amber-100 text-amber-700" :
              trend.direction === "decreasing" ? "bg-teal-100 text-teal-700" :
              "bg-blue-100 text-blue-700"
            }`}>
              {trend.direction}
            </span>
          </div>
          
          <p className="mt-2 text-sm text-[color:var(--ink-soft)]">{trend.description}</p>
          
          <div className="mt-3 flex items-center gap-4">
            <div className="text-xs">
              <span className="text-[color:var(--ink-soft)]">Rate: </span>
              <span className="font-medium">{trend.rate > 0 ? "+" : ""}{trend.rate} days/month</span>
            </div>
            <div className="text-xs">
              <span className="text-[color:var(--ink-soft)]">Confidence: </span>
              <span className="font-medium">{Math.round(trend.confidence * 100)}%</span>
            </div>
            <div className="text-xs">
              <span className="text-[color:var(--ink-soft)]">Months: </span>
              <span className="font-medium">{trend.monthsTracked}</span>
            </div>
          </div>
          
          <p className="mt-3 text-xs font-medium text-[color:var(--accent)]">{trend.prediction}</p>
        </div>
      ))}
    </div>
  );
}

interface TemporalPatternChartProps {
  patterns: TemporalPattern[];
}

export function TemporalPatternChart({ patterns }: TemporalPatternChartProps) {
  if (patterns.length === 0) {
    return (
      <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
        <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Symptom Timing Patterns</h3>
        <p className="mt-4 text-sm text-[color:var(--ink-soft)]">Log symptoms consistently to discover patterns</p>
      </div>
    );
  }

  const topPatterns = patterns.slice(0, 8);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[color:var(--foreground)]">Symptom Timing Patterns</h3>
      
      <div className="space-y-3">
        {topPatterns.map((pattern, i) => (
          <div key={i} className="rounded-xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-[color:var(--foreground)]">{pattern.symptomLabel}</p>
                <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                  Typically {pattern.averageDayBeforePeriod} day{pattern.averageDayBeforePeriod !== 1 ? "s" : ""} before period
                </p>
              </div>
              <div className="text-right">
                <div
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    pattern.confidence >= 0.8
                      ? "bg-emerald-100 text-emerald-700"
                      : pattern.confidence >= 0.6
                      ? "bg-teal-100 text-teal-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {Math.round(pattern.confidence * 100)}% confidence
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-24 rounded-full bg-[color:var(--paper-muted)]">
                  <div
                    className="h-2 rounded-full bg-[color:var(--accent)]"
                    style={{ width: `${pattern.occurrenceRate}%` }}
                  />
                </div>
                <span className="text-xs text-[color:var(--ink-soft)]">{pattern.occurrenceRate}% of cycles</span>
              </div>
              
              <div className="text-xs">
                <span className="text-[color:var(--ink-soft)]">Severity: </span>
                <span className="font-medium">{pattern.typicalSeverity}/5</span>
              </div>
              
              <div className="text-xs">
                <span className="text-[color:var(--ink-soft)]">Cycles: </span>
                <span className="font-medium">{pattern.cycleCount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SmartNotificationBannerProps {
  notifications: ReturnType<typeof import("@/lib/advancedAnalytics").generateSmartNotifications>;
}

export function SmartNotificationBanner({ notifications }: SmartNotificationBannerProps) {
  if (notifications.length === 0) return null;

  const highPriority = notifications.filter((n) => n.priority === "high");
  const mediumPriority = notifications.filter((n) => n.priority === "medium");

  const displayNotification = highPriority[0] || mediumPriority[0];
  if (!displayNotification) return null;

  return (
    <div
      className={`rounded-xl p-4 ${
        displayNotification.type === "anomaly_detected"
          ? "bg-red-50 border border-red-200"
          : displayNotification.type === "period_approaching"
          ? "bg-amber-50 border border-amber-200"
          : displayNotification.type === "fertile_window_alert"
          ? "bg-purple-50 border border-purple-200"
          : "bg-blue-50 border border-blue-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            displayNotification.type === "anomaly_detected"
              ? "bg-red-100"
              : displayNotification.type === "period_approaching"
              ? "bg-amber-100"
              : displayNotification.type === "fertile_window_alert"
              ? "bg-purple-100"
              : "bg-blue-100"
          }`}
        >
          <Zap
            className={`h-5 w-5 ${
              displayNotification.type === "anomaly_detected"
                ? "text-red-600"
                : displayNotification.type === "period_approaching"
                ? "text-amber-600"
                : displayNotification.type === "fertile_window_alert"
                ? "text-purple-600"
                : "text-blue-600"
            }`}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[color:var(--foreground)]">{displayNotification.title}</p>
          <p className="mt-1 text-sm text-[color:var(--ink-soft)]">{displayNotification.message}</p>
          {displayNotification.actionRequired && displayNotification.actionLabel && (
            <button
              className={`mt-3 rounded-lg px-4 py-2 text-sm font-medium ${
                displayNotification.type === "anomaly_detected"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-[color:var(--accent)] text-white hover:opacity-90"
              }`}
            >
              {displayNotification.actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface CycleHealthGaugeProps {
  score: number;
  grade: CycleHealthScore["healthGrade"];
}

export function CycleHealthGauge({ score, grade }: CycleHealthGaugeProps) {
  const gradeLabels = {
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    needs_attention: "Needs Attention",
  };

  const colors = {
    excellent: "#10b981",
    good: "#14b8a6",
    fair: "#f59e0b",
    needs_attention: "#ef4444",
  };

  const circumference = 2 * Math.PI * 40;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90 transform" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-[color:var(--paper-muted)]"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={colors[grade]}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: colors[grade] }}>
            {score}
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium" style={{ color: colors[grade] }}>
        {gradeLabels[grade]}
      </p>
      <p className="mt-1 text-xs text-[color:var(--ink-soft)]">Cycle Health</p>
    </div>
  );
}

interface PhaseAnalysisCardProps {
  phase: string;
  symptomCount: number;
  moodAvg: number;
  flowIntensity: number;
  idealFor?: string[];
}

export function PhaseAnalysisCard({ phase, symptomCount, moodAvg, flowIntensity, idealFor }: PhaseAnalysisCardProps) {
  const phaseColors: Record<string, string> = {
    menstruation: "bg-red-100 text-red-700",
    follicular_early: "bg-orange-100 text-orange-700",
    follicular_late: "bg-yellow-100 text-yellow-700",
    ovulation: "bg-green-100 text-green-700",
    fertile: "bg-emerald-100 text-emerald-700",
    luteal_early: "bg-blue-100 text-blue-700",
    luteal_late: "bg-indigo-100 text-indigo-700",
  };

  const phaseLabels: Record<string, string> = {
    menstruation: "Menstruation",
    follicular_early: "Early Follicular",
    follicular_late: "Late Follicular",
    ovulation: "Ovulation",
    fertile: "Fertile Window",
    luteal_early: "Early Luteal",
    luteal_late: "Late Luteal",
  };

  return (
    <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--paper)] p-4">
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-3 py-1 text-sm font-medium ${phaseColors[phase] || "bg-gray-100"}`}>
          {phaseLabels[phase] || phase}
        </span>
        <span className="text-sm text-[color:var(--ink-soft)]">{symptomCount} symptoms avg</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-[color:var(--ink-soft)]">Mood Avg</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`h-5 w-3 rounded-sm ${
                    n <= Math.round(moodAvg) ? "bg-purple-400" : "bg-[color:var(--paper-muted)]"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{moodAvg.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-[color:var(--ink-soft)]">Flow Intensity</p>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`h-5 w-3 rounded-sm ${
                    n <= Math.round(flowIntensity) ? "bg-red-400" : "bg-[color:var(--paper-muted)]"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{flowIntensity.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {idealFor && idealFor.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-[color:var(--ink-soft)]">Great for</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {idealFor.map((item, i) => (
              <span key={i} className="rounded-full bg-[color:var(--paper-muted)] px-2 py-0.5 text-xs">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}