import { cn } from "@/lib/utils";

type TimelineMarker = {
  label: string;
  startDay: number;
  endDay: number;
  tone: "period" | "fertile" | "predicted";
};

const toneClasses: Record<TimelineMarker["tone"], string> = {
  period: "bg-amber-400",
  fertile: "bg-emerald-500",
  predicted: "bg-[color:var(--brand)]",
};

export function CalendarCycleView({
  cycleLength,
  cycleDay,
  markers,
}: {
  cycleLength: number;
  cycleDay: number | null;
  markers: TimelineMarker[];
}) {
  return (
    <div className="mt-6 rounded-[28px] border border-[color:var(--line)] bg-[color:var(--paper-muted)] p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand)]">
            Current cycle view
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
            {cycleDay ? `Day ${cycleDay} of ${cycleLength}` : `${cycleLength} day timeline`}
          </h3>
        </div>
        <p className="text-sm text-[color:var(--ink-soft)]">
          Follow the current cycle as a single adaptive sequence.
        </p>
      </div>

      <div className="relative mt-6 rounded-full bg-white px-4 py-5 shadow-[inset_0_4px_12px_rgba(61,28,35,0.06)]">
        <div className="relative h-4 rounded-full bg-[rgba(111,89,96,0.12)]">
          {markers.map((marker) => {
            const startDay = Math.max(1, Math.min(cycleLength, marker.startDay));
            const endDay = Math.max(startDay, Math.min(cycleLength, marker.endDay));
            const left = ((startDay - 1) / cycleLength) * 100;
            const width = ((endDay - startDay + 1) / cycleLength) * 100;
            return (
              <div
                key={`${marker.label}-${marker.startDay}-${marker.endDay}`}
                className={cn("absolute top-0 h-full rounded-full", toneClasses[marker.tone])}
                style={{ left: `${left}%`, width: `${Math.max(width, 3)}%` }}
              />
            );
          })}
          {cycleDay ? (
            <div
              className="absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full border-4 border-white bg-[color:var(--foreground)] shadow-[0_10px_18px_rgba(35,24,26,0.16)]"
              style={{ left: `calc(${((cycleDay - 1) / cycleLength) * 100}% - 0.75rem)` }}
            />
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-soft)]">
          {markers.map((marker) => (
            <span
              key={marker.label}
              className="rounded-full border border-[color:var(--line)] bg-white px-3 py-1.5"
            >
              {marker.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
