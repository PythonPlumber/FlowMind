import { Card, CardContent } from "@/components/ui/card";

export function InsightsSummary({
  typicalCycle,
  typicalPeriod,
  variability,
  averageMood,
  highlight,
}: {
  typicalCycle: string;
  typicalPeriod: string;
  variability: string;
  averageMood: string;
  highlight: string;
}) {
  return (
    <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card variant="hero">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Typical cycle", value: typicalCycle },
            { label: "Typical period", value: typicalPeriod },
            { label: "Variability", value: variability },
            { label: "Average mood", value: averageMood },
          ].map((metric) => (
            <div
              key={metric.label}
              className="rounded-[24px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]"
            >
              <p className="text-sm text-[color:var(--ink-soft)]">{metric.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                {metric.value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card variant="panel">
        <CardContent className="space-y-3 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
            Interpretation
          </p>
          <p className="text-base leading-7 text-[color:var(--foreground)]">{highlight}</p>
        </CardContent>
      </Card>
    </section>
  );
}
