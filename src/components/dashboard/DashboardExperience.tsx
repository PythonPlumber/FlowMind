import Link from "next/link";
import { Sparkles } from "lucide-react";

import { DashboardHeroSurface } from "@/components/dashboard/DashboardHeroSurface";
import { DashboardSnapshotRail } from "@/components/dashboard/DashboardSnapshotRail";
import { PeriodQuickActions } from "@/components/dashboard/PeriodQuickActions";
import { Card, CardContent } from "@/components/ui/card";
import { ActionMenu } from "@/components/ui/action-menu";
import { PageIntro } from "@/components/ui/page-intro";
import type { CycleVisualizationModel } from "@/lib/cycleVisualization";
import type { PredictionResult } from "@/lib/predictions";

export function DashboardExperience(props: {
  todayLabel: string;
  age: number | null;
  goalMode: "track" | "conceive" | "avoid";
  phaseLabel: string;
  phaseDescription: string;
  cycleRing: CycleVisualizationModel;
  predictions: PredictionResult;
  cycleHealth: Array<{ label: string; value: string }>;
  nextPeriodWindow: {
    start: string;
    end: string;
    variabilityLabel: string;
    daysAway: number;
  } | null;
  fertileWindow: { start: string; end: string; daysAway: number | null } | null;
  latestLog: {
    date: string;
    mood: number | null;
    flow: string | null;
    bbt: number | null;
    mucusType: string | null;
    sex: boolean;
    contraception: string | null;
    notes: string | null;
  } | null;
  trackingStreak: number;
  confidenceLabel: string;
  rhythmLabel: string;
}) {
  const goalLabel =
    props.goalMode === "conceive"
      ? "Trying to conceive"
      : props.goalMode === "avoid"
        ? "Avoid pregnancy"
        : "Track periods";

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Today"
        title="Quiet cycle dashboard"
        description="Focused on now, next, and the few signals that matter most."
        meta={
          <>
            <span>{props.todayLabel}</span>
            {props.age !== null ? <span>Age {props.age}</span> : null}
            <span>{goalLabel}</span>
          </>
        }
        actions={
          <>
            <Link
              href="/log"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 text-sm font-medium text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)]"
            >
              Log today
              <Sparkles className="h-4 w-4" />
            </Link>
            <Link
              href="/ai-analytics?month=current"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[color:var(--paper-muted)] px-5 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]"
            >
              Month analytics
            </Link>
            <ActionMenu
              label="Open dashboard actions"
              items={[
                { label: "Jump to today", href: "/" },
                { label: "Open calendar", href: "/calendar" },
                { label: "View cycle history", href: "/calendar?view=cycle" },
                { label: "Download next-period calendar", href: "/api/calendar/next-period.ics" },
                { label: "Open reports", href: "/reports" },
              ]}
            />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardHeroSurface
          phaseLabel={props.phaseLabel}
          phaseDescription={props.phaseDescription}
          cycleRing={props.cycleRing}
          todayLabel={props.todayLabel}
          nextPeriodWindow={props.nextPeriodWindow}
          fertileWindow={props.fertileWindow}
          predictions={props.predictions}
          confidenceLabel={props.confidenceLabel}
          goalLabel={goalLabel}
          rhythmLabel={props.rhythmLabel}
        />

        <DashboardSnapshotRail
          cycleHealth={props.cycleHealth}
          latestLog={props.latestLog}
          trackingStreak={props.trackingStreak}
          fertileWindow={props.fertileWindow}
        />
      </div>

      <Card variant="panel">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                Actions
              </p>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)]">
                Keep the tracker current
              </h3>
            </div>
            <ActionMenu
              label="Open quick actions menu"
              items={[
                { label: "Open insights", href: "/insights" },
                { label: "View reports", href: "/reports" },
                { label: "Edit settings", href: "/settings" },
              ]}
            />
          </div>
          <PeriodQuickActions />
        </CardContent>
      </Card>
    </div>
  );
}
