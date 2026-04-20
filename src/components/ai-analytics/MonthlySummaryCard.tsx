"use client";

import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function MonthlySummaryCard({
  active,
  monthParam,
  monthLabel,
}: {
  active: boolean;
  monthParam: string;
  monthLabel: string;
}) {
  const [summary, setSummary] = useState("");
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    let ignore = false;

    async function loadSummary() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/ai/monthly-summary?month=${monthParam}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Monthly summary failed");
        }

        if (!ignore) {
          setSummary(data.summary || "");
          setCached(Boolean(data.cached));
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Monthly summary failed");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadSummary();

    return () => {
      ignore = true;
    };
  }, [active, monthParam]);

  return (
    <Card variant="hero">
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
              Month recap
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)]">
              AI summary
            </h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
              Built from your logs in {monthLabel}.
            </p>
          </div>
          {cached ? <Badge variant="muted">Cached</Badge> : <Badge variant="muted">{monthLabel}</Badge>}
        </div>

        {loading ? (
          <div className="rounded-[26px] bg-[color:var(--paper-muted)] p-5 [box-shadow:var(--shadow-inset)]">
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-white/70" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-white/70" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-white/70" />
            </div>
          </div>
        ) : error ? (
          <div className="rounded-[24px] border border-red-200 bg-red-50/85 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : (
          <div className="rounded-[26px] bg-[color:var(--paper-muted)] p-5 text-sm leading-7 text-[color:var(--foreground)] whitespace-pre-wrap [box-shadow:var(--shadow-inset)]">
            {summary || `Run the analysis to generate a fresh monthly recap for ${monthLabel}.`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
