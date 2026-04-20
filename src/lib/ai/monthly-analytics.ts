import { format } from "date-fns";

import type { AggregatedUserData } from "@/types/ai";

export type AnalysisReadinessLevel = "early" | "growing" | "ready";

export function resolveAnalyticsMonth(monthParam: string | undefined, referenceDate = new Date()) {
  const normalized = normalizeMonthParam(monthParam);
  const target = shiftUtcMonth(referenceDate, normalized === "current" ? 0 : Number(normalized));
  const year = target.getUTCFullYear();
  const monthIndex = target.getUTCMonth();

  return {
    monthParam: normalized,
    monthLabel: format(target, "MMMM yyyy"),
    from: new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0)),
    to: new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999)),
    previousMonthParam: normalized === "current" ? "1" : String(Number(normalized) + 1),
    nextMonthParam:
      normalized === "current" ? null : Number(normalized) <= 1 ? "current" : String(Number(normalized) - 1),
  };
}

export function buildAnalysisReadiness(data: AggregatedUserData): {
  level: AnalysisReadinessLevel;
  summary: string;
  coverageLabel: string;
  supportingPoints: string[];
} {
  const loggedDays = data.logging.loggedDays;
  const daysInRange = Math.max(1, data.logging.daysInRange);
  const coverageLabel = `${loggedDays} of ${daysInRange} days logged`;
  const cycleSignals = data.cycles.lengths.length;
  const symptomSignals = data.symptoms.topSymptoms.length;
  const bodySignals = data.bodySignals.bbtLogged + data.bodySignals.mucusLogged;

  let level: AnalysisReadinessLevel = "early";
  if (loggedDays >= 12 && (cycleSignals >= 2 || symptomSignals >= 1 || bodySignals >= 3)) {
    level = "ready";
  } else if (loggedDays >= 5 || cycleSignals >= 1 || symptomSignals >= 1) {
    level = "growing";
  }

  const supportingPoints: string[] = [];

  if (cycleSignals >= 2) {
    supportingPoints.push("Cycle history is strong enough for adaptive interpretation.");
  } else {
    supportingPoints.push("More period starts will sharpen the cycle-level AI interpretation.");
  }

  if (data.symptoms.trackedDays > 0) {
    supportingPoints.push(`Symptoms were tracked on ${data.symptoms.trackedDays} day${data.symptoms.trackedDays === 1 ? "" : "s"}.`);
  }

  if (data.bodySignals.coverage > 0) {
    supportingPoints.push(`Body cues were captured on ${Math.round(data.bodySignals.coverage)}% of logged days.`);
  }

  const summary =
    level === "ready"
      ? "This month has enough real data for a fuller AI read across timing, symptoms, and consistency."
      : level === "growing"
        ? "This month can support directional AI guidance, with better accuracy as you log more days."
        : "This month is still building. AI can point out early signals, but it should stay conservative.";

  return {
    level,
    summary,
    coverageLabel,
    supportingPoints,
  };
}

function normalizeMonthParam(monthParam: string | undefined) {
  if (!monthParam || monthParam === "current") return "current";
  const parsed = Number.parseInt(monthParam, 10);
  if (!Number.isFinite(parsed) || parsed < 0) return "current";
  return parsed === 0 ? "current" : String(parsed);
}

function shiftUtcMonth(referenceDate: Date, monthsAgo: number) {
  return new Date(
    Date.UTC(
      referenceDate.getUTCFullYear(),
      referenceDate.getUTCMonth() - monthsAgo,
      1,
      12,
      0,
      0,
      0
    )
  );
}
