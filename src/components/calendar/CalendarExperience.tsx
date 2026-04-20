import Link from "next/link";

import { CalendarCycleView } from "@/components/calendar/CalendarCycleView";
import { CalendarDayDetail } from "@/components/calendar/CalendarDayDetail";
import { CalendarLegend } from "@/components/calendar/CalendarLegend";
import { CalendarMonthGrid } from "@/components/calendar/CalendarMonthGrid";
import { ActionMenu } from "@/components/ui/action-menu";
import { Card, CardContent } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";
import { CalendarCell } from "@/lib/calendar";

export function CalendarExperience(props: {
  monthLabel: string;
  monthParam: string;
  view: "month" | "cycle";
  viewLinks: { month: string; cycle: string };
  cells: Array<CalendarCell | null>;
  prevHref: string;
  todayHref: string;
  nextHref: string;
  loggedDaysCount: number;
  monthSummary: { periodDays: number; predictedDays: number; fertileDays: number };
  cycleTimeline: {
    cycleLength: number;
    cycleDay: number | null;
    markers: Array<{
      label: string;
      startDay: number;
      endDay: number;
      tone: "period" | "fertile" | "predicted";
    }>;
  };
  selectedLog:
    | {
        mood: number | null;
        flow: string | null;
        notes: string | null;
        bbt: number | null;
        mucusType: string | null;
        sex: boolean;
        contraception: string | null;
      }
    | null;
  cycleInfo?: {
    cycleDay: number | null;
    phaseLabel: string | null;
    daysUntilNextPeriod: number | null;
    isInFertileWindow: boolean;
  } | null;
}) {
  const selected = props.cells.find((cell) => cell?.isSelected) ?? null;
  const navButtonClass =
    "inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--paper-muted)] px-4 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]";

  const nextPeriodDays = props.monthSummary.periodDays > 0
    ? props.monthSummary.periodDays
    : null;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Timeline"
        title="Cycle calendar"
        description="Actual days, forecasts, fertile estimates, and logged detail in one quieter workspace."
        meta={
          <>
            <span>{props.monthLabel}</span>
            <span>
              {props.loggedDaysCount} logged day
              {props.loggedDaysCount === 1 ? "" : "s"}
            </span>
            <span>{selected?.iso ?? "Pick a day"}</span>
          </>
        }
        actions={
          <>
            <Link href={props.prevHref} className={navButtonClass}>
              Previous
            </Link>
            <Link href={props.todayHref} className={navButtonClass}>
              Today
            </Link>
            <Link
              href={props.nextHref}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--brand)] px-4 text-sm font-medium text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)]"
            >
              Next
            </Link>
            <ActionMenu
              label="Open calendar actions"
              items={[
                {
                  label: "Jump to predicted window",
                  href: `${props.viewLinks[props.view]}&focus=predicted`,
                },
                {
                  label: "Jump to fertile window",
                  href: `${props.viewLinks[props.view]}&focus=fertile`,
                },
                { label: "Reset focus", href: props.viewLinks[props.view] },
                { label: "Download next period ICS", href: "/api/calendar/next-period.ics" },
                { label: "Download fertile window ICS", href: "/api/calendar/fertile-window.ics" },
              ]}
            />
          </>
        }
      />

      <Card variant="hero">
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                Calendar
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[color:var(--foreground)]">
                {props.monthLabel}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[color:var(--ink-soft)]">
                Select a day to inspect its combined state. Switch between the month grid and the broader cycle timeline whenever you need more context.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={props.viewLinks.month}
                aria-current={props.view === "month" ? "page" : undefined}
                className={
                  props.view === "month"
                    ? "inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--brand)] px-4 text-sm font-medium text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)]"
                    : navButtonClass
                }
              >
                Month view
              </Link>
              <Link
                href={props.viewLinks.cycle}
                aria-current={props.view === "cycle" ? "page" : undefined}
                className={
                  props.view === "cycle"
                    ? "inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--brand)] px-4 text-sm font-medium text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)]"
                    : navButtonClass
                }
              >
                Cycle view
              </Link>
            </div>
          </div>

          <CalendarLegend />

          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-[22px] bg-amber-50/75 px-4 py-3 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-900/75">
                Period days
              </p>
              <p className="mt-2 text-lg font-semibold text-amber-950">
                {props.monthSummary.periodDays}
              </p>
            </div>
            <div className="rounded-[22px] bg-[color:var(--brand-soft)] px-4 py-3 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-strong)]/75">
                Predicted days
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--brand-strong)]">
                {props.monthSummary.predictedDays}
              </p>
            </div>
            <div className="rounded-[22px] bg-emerald-50/75 px-4 py-3 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-900/75">
                Fertile days
              </p>
              <p className="mt-2 text-lg font-semibold text-emerald-950">
                {props.monthSummary.fertileDays}
              </p>
            </div>
            <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
                Log coverage
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                {props.loggedDaysCount}
              </p>
            </div>
          </div>

          {props.cycleInfo?.cycleDay && (
            <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
                Current cycle
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                Day {props.cycleInfo.cycleDay}
                {props.cycleInfo.phaseLabel && ` · ${props.cycleInfo.phaseLabel}`}
              </p>
            </div>
          )}

          {props.view === "cycle" ? (
            <CalendarCycleView
              cycleLength={props.cycleTimeline.cycleLength}
              cycleDay={props.cycleTimeline.cycleDay}
              markers={props.cycleTimeline.markers}
            />
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.95fr]">
        <Card variant="panel">
          <CardContent className="pt-6">
            {props.view === "month" ? (
              <CalendarMonthGrid monthParam={props.monthParam} cells={props.cells} />
            ) : (
              <>
                <h3 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                  Month snapshot
                </h3>
                <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                  Keep the month close at hand while you inspect the broader cycle view.
                </p>
                <CalendarMonthGrid monthParam={props.monthParam} cells={props.cells} />
              </>
            )}
          </CardContent>
        </Card>

        <CalendarDayDetail 
          selected={selected} 
          logDetails={props.selectedLog}
          cycleInfo={props.cycleInfo}
        />
      </div>
    </div>
  );
}
