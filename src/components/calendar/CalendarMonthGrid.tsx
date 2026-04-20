import Link from "next/link";

import { CalendarCell } from "@/lib/calendar";
import { cn } from "@/lib/utils";

export function CalendarMonthGrid({
  monthParam,
  cells,
}: {
  monthParam: string;
  cells: Array<CalendarCell | null>;
}) {
  return (
    <div className="mt-6">
      <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
          <div
            key={label}
            className="rounded-full bg-[color:var(--paper-muted)] px-1 py-2 [box-shadow:var(--shadow-inset)]"
          >
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label.slice(0, 1)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {cells.map((cell, index) =>
          cell ? (
            <Link
              key={cell.iso}
              href={`/calendar?m=${monthParam}&d=${cell.iso}`}
              aria-current={cell.isSelected ? "date" : undefined}
              className={cn(
                "group flex min-h-24 flex-col justify-between rounded-[24px] border p-2.5 transition hover:-translate-y-0.5 sm:min-h-28 sm:p-3",
                cell.isSelected
                  ? "border-[color:var(--brand)]/40 bg-[linear-gradient(180deg,rgba(230,236,255,0.98),rgba(221,229,255,0.9))] [box-shadow:0_20px_40px_rgba(118,139,255,0.16),var(--shadow-inset)]"
                  : "border-white/60 bg-[color:var(--paper-strong)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] hover:border-[color:var(--brand)]/25 hover:bg-white",
                cell.isActual && "ring-1 ring-amber-300/80",
                cell.isPredicted && "outline outline-1 outline-[color:var(--brand)]/40",
                cell.isFertile && "shadow-[inset_0_0_0_1px_rgba(89,124,102,0.28)]"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-semibold text-[color:var(--foreground)] sm:text-base">
                  {cell.day}
                </span>
                {cell.isToday ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-[color:var(--brand)] sm:h-3 sm:w-3" />
                ) : null}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {cell.isActual ? (
                    <span className="h-2.5 min-w-6 rounded-full bg-amber-400/85 sm:min-w-8" />
                  ) : null}
                  {cell.isPredicted ? (
                    <span className="h-2.5 min-w-6 rounded-full bg-[color:var(--brand)]/55 sm:min-w-8" />
                  ) : null}
                  {cell.isFertile ? (
                    <span className="h-2.5 min-w-6 rounded-full bg-emerald-400/85 sm:min-w-8" />
                  ) : null}
                  {cell.isToday ? (
                    <span className="h-2.5 min-w-6 rounded-full bg-[color:var(--paper-muted)] ring-1 ring-[color:var(--brand)]/35 sm:min-w-8" />
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  {cell.hasLog ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--foreground)]" />
                  ) : null}
                  {cell.hasSymptoms ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                  ) : null}
                  {cell.hasNotes ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--brand)]" />
                  ) : null}
                </div>
                <span className="hidden flex-wrap gap-1 text-[10px] font-medium uppercase tracking-[0.14em] text-[color:var(--ink-soft)] sm:flex">
                  {cell.isActual ? <span>Period</span> : null}
                  {cell.isPredicted ? <span>Forecast</span> : null}
                  {cell.isFertile ? <span>Fertile</span> : null}
                  {cell.isToday ? <span>Today</span> : null}
                  {cell.hasSymptoms ? <span>Symptoms</span> : null}
                  {cell.hasNotes ? <span>Notes</span> : null}
                  {!cell.isActual && !cell.isPredicted && !cell.isFertile && !cell.isToday ? (
                    <span className="opacity-0 group-hover:opacity-100">Open</span>
                  ) : null}
                </span>
              </div>
            </Link>
          ) : (
            <div key={`empty-${index}`} className="min-h-24 rounded-[24px]" />
          )
        )}
      </div>
    </div>
  );
}
