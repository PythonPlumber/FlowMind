import { SeverityPillGroup } from "@/components/log/SeverityPillGroup";
import { cn } from "@/lib/utils";

export function SymptomCard({
  label,
  checked,
  severity,
  onToggle,
  onSeverityChange,
}: {
  label: string;
  checked: boolean;
  severity: number;
  onToggle: (checked: boolean) => void;
  onSeverityChange: (value: number) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border p-4 transition-all duration-200",
        checked
          ? "border-[color:var(--brand)]/45 bg-[linear-gradient(180deg,rgba(233,239,255,0.98),rgba(224,232,255,0.92))] [box-shadow:0_24px_48px_rgba(118,139,255,0.16),var(--shadow-inset)]"
          : "border-white/60 bg-[color:var(--paper-strong)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <button
          type="button"
          aria-pressed={checked}
          aria-label={label}
          onClick={() => onToggle(!checked)}
          className="w-full text-left"
        >
          <span className="block text-base font-semibold tracking-[-0.02em] text-[color:var(--foreground)]">
            {label}
          </span>
          <span className="mt-1 block text-sm text-[color:var(--ink-soft)]">
            {checked ? "Included in today's check-in" : "Tap to include"}
          </span>
        </button>
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
            checked
              ? "bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]"
              : "bg-[color:var(--paper-muted)] text-[color:var(--ink-soft)]"
          )}
        >
          {checked ? "On" : "Off"}
        </span>
      </div>
      <div className="mt-4 rounded-[22px] bg-white/60 p-3 [box-shadow:var(--shadow-inset)]">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
          Severity
        </p>
        <SeverityPillGroup value={severity} onChange={onSeverityChange} disabled={!checked} />
      </div>
    </div>
  );
}
