import Link from "next/link";
import { CalendarDayActions } from "@/components/calendar/CalendarDayActions";
import { Badge } from "@/components/ui/badge";
import { CalendarCell } from "@/lib/calendar";

const MOOD_LABELS = ["", "Struggling", "Low", "Okay", "Good", "Great"];
const FLOW_LABELS: Record<string, { label: string; color: string }> = {
  spotting: { label: "Spotting", color: "text-amber-600" },
  light: { label: "Light", color: "text-amber-700" },
  medium: { label: "Medium", color: "text-orange-700" },
  heavy: { label: "Heavy", color: "text-red-700" },
};
const MUCUS_LABELS: Record<string, string> = {
  dry: "Dry",
  sticky: "Sticky",
  creamy: "Creamy",
  watery: "Watery",
  eggwhite: "Egg white",
};

export function CalendarDayDetail({
  selected,
  logDetails,
  cycleInfo,
}: {
  selected: CalendarCell | null;
  logDetails:
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
  if (!selected) {
    return (
      <aside className="rounded-[32px] border border-white/60 bg-[color:var(--paper-strong)] p-6 [box-shadow:var(--shadow-soft),var(--shadow-inset)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
          Selected day
        </p>
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
          No day selected
        </h3>
        <p className="mt-4 text-sm text-[color:var(--ink-soft)]">
          Select a day from the calendar to view its details and logged information.
        </p>
      </aside>
    );
  }

  const getDayContext = () => {
    if (selected.isActual) return { main: "Period day", sub: "You logged this as a period day" };
    if (selected.isPredicted && selected.isFertile) return { main: "Predicted & fertile", sub: "This day is in both windows" };
    if (selected.isPredicted) return { main: "Predicted period", sub: "Expected period window" };
    if (selected.isFertile) return { main: "Fertile window", sub: "Conception is possible" };
    if (selected.isToday) return { main: "Today", sub: "Current day in your cycle" };
    if (cycleInfo?.isInFertileWindow) return { main: "Follicular phase", sub: "Outside fertile window" };
    return { main: "Luteal phase", sub: "After ovulation" };
  };

  const dayContext = getDayContext();

  return (
    <aside className="rounded-[32px] border border-white/60 bg-[color:var(--paper-strong)] p-6 [box-shadow:var(--shadow-soft),var(--shadow-inset)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
        Selected day
      </p>
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
        {selected.iso}
      </h3>
      
      <div className="mt-2">
        <p className="text-lg font-semibold text-[color:var(--foreground)]">
          {dayContext.main}
        </p>
        <p className="text-sm text-[color:var(--ink-soft)]">
          {dayContext.sub}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {selected.isActual ? <Badge variant="period">Logged period</Badge> : null}
        {selected.isPredicted ? <Badge variant="warning">Predicted window</Badge> : null}
        {selected.isFertile ? <Badge variant="fertile">Fertile estimate</Badge> : null}
        {selected.isToday ? <Badge variant="muted">Today</Badge> : null}
        {selected.hasLog ? <Badge variant="muted">Has log</Badge> : null}
        {selected.hasSymptoms ? <Badge variant="muted">Symptoms</Badge> : null}
        {selected.hasNotes ? <Badge variant="muted">Has notes</Badge> : null}
      </div>

      {cycleInfo && (
        <div className="mt-5 grid gap-3">
          {cycleInfo.cycleDay && (
            <div className="rounded-[22px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
                Cycle day
              </p>
              <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">
                Day {cycleInfo.cycleDay}
                {cycleInfo.phaseLabel && ` · ${cycleInfo.phaseLabel}`}
              </p>
            </div>
          )}
          {cycleInfo.daysUntilNextPeriod !== null && cycleInfo.daysUntilNextPeriod > 0 && (
            <div className="rounded-[22px] bg-amber-50/70 p-4 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
                Next period
              </p>
              <p className="mt-2 text-lg font-semibold text-amber-900">
                In {cycleInfo.daysUntilNextPeriod} days
              </p>
            </div>
          )}
          {cycleInfo.isInFertileWindow && (
            <div className="rounded-[22px] bg-emerald-50/70 p-4 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Fertility status
              </p>
              <p className="mt-2 text-lg font-semibold text-emerald-900">
                Peak fertile window
              </p>
            </div>
          )}
        </div>
      )}

      {logDetails ? (
        <div className="mt-6 rounded-[26px] bg-[color:var(--paper-muted)] p-5 [box-shadow:var(--shadow-inset)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
            Logged details
          </p>
          
          <div className="mt-4 space-y-3">
            {logDetails.flow ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--ink-soft)]">Flow</span>
                <span className={`font-semibold ${FLOW_LABELS[logDetails.flow]?.color ?? ""}`}>
                  {FLOW_LABELS[logDetails.flow]?.label ?? logDetails.flow}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--ink-soft)]">Flow</span>
                <span className="text-sm text-[color:var(--ink-soft)]">Not set</span>
              </div>
            )}
            
            {logDetails.mood ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--ink-soft)]">Mood</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {MOOD_LABELS[logDetails.mood] ?? logDetails.mood} ({logDetails.mood}/5)
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--ink-soft)]">Mood</span>
                <span className="text-sm text-[color:var(--ink-soft)]">Not set</span>
              </div>
            )}
            
            {logDetails.bbt ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--ink-soft)]">BBT</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {logDetails.bbt.toFixed(2)}°C
                </span>
              </div>
            ) : null}
            
            {logDetails.mucusType ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--ink-soft)]">Mucus</span>
                <span className="font-semibold text-[color:var(--foreground)]">
                  {MUCUS_LABELS[logDetails.mucusType] ?? logDetails.mucusType}
                </span>
              </div>
            ) : null}
            
            {logDetails.sex !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-[color:var(--ink-soft)]">Intimacy</span>
                <span className={`font-semibold ${logDetails.sex ? "text-emerald-700" : "text-[color:var(--ink-soft)]"}`}>
                  {logDetails.sex ? "Had sex" : "No sex"}
                  {logDetails.contraception && ` · ${logDetails.contraception}`}
                </span>
              </div>
            )}
          </div>
          
          {logDetails.notes && (
            <div className="mt-4 border-t border-[color:var(--line)] pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
                Notes
              </p>
              <p className="mt-2 text-sm text-[color:var(--foreground)]">
                {logDetails.notes}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-[26px] bg-[color:var(--paper-muted)] p-5 [box-shadow:var(--shadow-inset)]">
          <p className="text-sm text-[color:var(--ink-soft)]">
            No log entry for this day. Start tracking to build your history.
          </p>
        </div>
      )}

      <CalendarDayActions iso={selected?.iso ?? null} isToday={selected?.isToday ?? false} />
      
      {selected.isToday && (
        <div className="mt-4">
          <Link
            href="/log"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 text-sm font-medium text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)]"
          >
            Log today
          </Link>
        </div>
      )}
    </aside>
  );
}
