export type CalendarCell = {
  iso: string;
  day: number;
  isActual: boolean;
  isPredicted: boolean;
  isFertile: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasLog: boolean;
  hasSymptoms: boolean;
  hasNotes: boolean;
  statePriority: "period" | "predicted" | "fertile" | "logged" | "default";
};

export function buildCalendarMonth(args: {
  year: number;
  month: number;
  todayIso: string;
  selectedIso: string;
  actualDays: Set<string>;
  predictedDays: Set<string>;
  fertileDays: Set<string>;
  logSignals?: Record<string, { hasLog: boolean; hasSymptoms: boolean; hasNotes: boolean }>;
}) {
  const monthStart = new Date(Date.UTC(args.year, args.month - 1, 1));
  const monthEnd = new Date(Date.UTC(args.year, args.month, 0));
  const totalDays = monthEnd.getUTCDate();
  const offset = (monthStart.getUTCDay() + 6) % 7;

  const cells: Array<CalendarCell | null> = Array.from(
    { length: offset + totalDays },
    (_, index) => {
      if (index < offset) return null;
      const day = index - offset + 1;
      const iso = `${args.year}-${String(args.month).padStart(2, "0")}-${String(day).padStart(
        2,
        "0"
      )}`;
      const signals = args.logSignals?.[iso];
      const isActual = args.actualDays.has(iso);
      const isPredicted = args.predictedDays.has(iso);
      const isFertile = args.fertileDays.has(iso);

      return {
        iso,
        day,
        isActual,
        isPredicted,
        isFertile,
        isToday: iso === args.todayIso,
        isSelected: iso === args.selectedIso,
        hasLog: Boolean(signals?.hasLog),
        hasSymptoms: Boolean(signals?.hasSymptoms),
        hasNotes: Boolean(signals?.hasNotes),
        statePriority: isActual
          ? "period"
          : isPredicted
            ? "predicted"
            : isFertile
              ? "fertile"
              : signals?.hasLog
                ? "logged"
                : "default",
      };
    }
  );

  return {
    monthLabel: monthStart.toLocaleString("en-US", {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
    cells,
  };
}
