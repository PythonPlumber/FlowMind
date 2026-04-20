import { cn } from "@/lib/utils";

type Option = { label: string; value: string | number };

export function ChoicePillGroup({
  value,
  onChange,
  options,
  allowClear = false,
}: {
  value: string | number | "";
  onChange: (next: string | number) => void;
  options: Option[];
  allowClear?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={String(option.value)}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active && allowClear ? "" : option.value)}
            className={cn(
              "rounded-[22px] border px-4 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "border-transparent bg-[linear-gradient(180deg,#8ea0ff,#7387ff)] text-white shadow-[0_18px_34px_rgba(118,139,255,0.32)]"
                : "border-white/70 bg-[color:var(--paper-strong)] text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] hover:bg-white/90"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
