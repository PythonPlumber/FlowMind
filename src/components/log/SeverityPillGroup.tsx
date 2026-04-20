import { ChoicePillGroup } from "@/components/log/ChoicePillGroup";

export function SeverityPillGroup({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className={disabled ? "pointer-events-none opacity-50" : undefined}>
      <ChoicePillGroup
        value={value}
        onChange={(next) => onChange(Number(next))}
        options={[
          { label: "0", value: 0 },
          { label: "1", value: 1 },
          { label: "2", value: 2 },
          { label: "3", value: 3 },
        ]}
      />
    </div>
  );
}
