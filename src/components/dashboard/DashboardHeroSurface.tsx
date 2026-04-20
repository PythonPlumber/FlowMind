import { CycleRing } from "@/components/dashboard/CycleRing";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { CycleVisualizationModel } from "@/lib/cycleVisualization";
import type { PredictionResult } from "@/lib/predictions";
import { diffDaysUTC } from "@/lib/dateOnly";
import { todayISODate, dateOnlyToUTCDate } from "@/lib/dateOnly";

export function DashboardHeroSurface(props: {
  phaseLabel: string;
  phaseDescription: string;
  cycleRing: CycleVisualizationModel;
  todayLabel: string;
  nextPeriodWindow: {
    start: string;
    end: string;
    variabilityLabel: string;
    daysAway: number;
  } | null;
  fertileWindow: { start: string; end: string; daysAway: number | null } | null;
  predictions: PredictionResult;
  confidenceLabel: string;
  goalLabel: string;
  rhythmLabel: string;
}) {
  const ovulationProgress = props.predictions.ovulationEstimate
    ? props.predictions.lastPeriodStart
      ? Math.round(((diffDaysUTC(dateOnlyToUTCDate(todayISODate()), props.predictions.lastPeriodStart) + 1) / props.predictions.displayCycleLength) * 100)
      : 0
    : null;

  return (
    <Card variant="hero">
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-wrap items-center justify-center gap-2 xl:justify-start">
          <Badge variant="muted">{props.todayLabel}</Badge>
          <Badge variant="default">{props.goalLabel}</Badge>
          <Badge variant={props.confidenceLabel === "High confidence" ? "success" : "warning"}>
            {props.confidenceLabel}
          </Badge>
          {props.predictions.currentPhase && (
            <Badge 
              variant="default"
              className="border-0"
              style={{ 
                backgroundColor: `var(--brand-soft)`,
                color: `var(--brand-strong)`
              }}
            >
              {props.phaseLabel}
            </Badge>
          )}
        </div>

        <div className="space-y-2 text-center xl:text-left">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
            Current phase
          </p>
          <h2 className="text-4xl font-semibold tracking-[-0.06em] text-[color:var(--foreground)]">
            {props.phaseLabel}
          </h2>
          <p className="text-sm leading-6 text-[color:var(--ink-soft)]">
            {props.phaseDescription}
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div className="mx-auto max-w-md">
            <CycleRing model={props.cycleRing} />
          </div>

          <div className="grid gap-3">
            {props.nextPeriodWindow ? (
              <div className="rounded-[26px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">
                  Next period
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                  {props.nextPeriodWindow.start} to {props.nextPeriodWindow.end}
                </p>
                <p className="mt-1 text-xs text-[color:var(--ink-soft)]">
                  ~{props.nextPeriodWindow.daysAway} days away · {props.nextPeriodWindow.variabilityLabel}
                </p>
              </div>
            ) : null}

            {props.fertileWindow ? (
              <div className="rounded-[26px] bg-emerald-50/60 p-4 [box-shadow:var(--shadow-inset)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                  Fertile window
                </p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-emerald-900">
                  {props.fertileWindow.start} to {props.fertileWindow.end}
                </p>
                <p className="mt-1 text-xs text-emerald-700/80">
                  {props.fertileWindow.daysAway !== null 
                    ? `${props.fertileWindow.daysAway} days away`
                    : "Current window"
                  }
                </p>
              </div>
            ) : null}

            {ovulationProgress !== null && ovulationProgress >= 0 && ovulationProgress <= 100 && (
              <div className="rounded-[26px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">
                  Cycle progress
                </p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[color:var(--line)] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${ovulationProgress}%`,
                        backgroundColor: props.predictions.irregularityLevel === "stable" ? "#5f8f72" : "#7387ff"
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-[color:var(--foreground)]">
                    {ovulationProgress}%
                  </span>
                </div>
              </div>
            )}

            <div className="rounded-[26px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">
                Rhythm
              </p>
              <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                {props.rhythmLabel}
              </p>
              {props.predictions.predictionMode === "range" && (
                <p className="mt-1 text-xs text-amber-700/80">
                  Variable cycle · Predictions shown as range
                </p>
              )}
            </div>

            {props.predictions.irregularityLevel !== "stable" && props.predictions.irregularityLevel !== "building" && (
              <div className="rounded-[26px] bg-amber-50/60 p-4 [box-shadow:var(--shadow-inset)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Pattern insight
                </p>
                <p className="mt-2 text-sm text-amber-900">
                  {props.predictions.irregularityLevel === "high_variability" 
                    ? "Your cycle varies more than average. Using a range for predictions increases accuracy."
                    : props.predictions.irregularityLevel === "shifting"
                    ? "Your cycle is gradually settling into a new rhythm. Keep logging for better predictions."
                    : "Your cycles tend to be longer than typical. Predictions account for this pattern."
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
