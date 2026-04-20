import { addDaysUTC, dateOnlyToUTCDate, utcDateToISODate } from "@/lib/dateOnly";

const presets = [
  { label: "Last 30 days", offset: -30 },
  { label: "Last 90 days", offset: -90 },
  { label: "Last 6 months", offset: -180 },
] as const;

export function RangePresetPills({
  today,
  onApply,
}: {
  today: string;
  onApply: (range: { from: string; to: string }) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => {
            const start = addDaysUTC(dateOnlyToUTCDate(today), preset.offset);
            onApply({ from: utcDateToISODate(start), to: today });
          }}
          className="rounded-[22px] border border-white/70 bg-[color:var(--paper-strong)] px-4 py-2.5 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] transition hover:bg-white/90"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
