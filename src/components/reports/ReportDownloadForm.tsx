"use client";

import { useMemo, useState } from "react";

import { RangePresetPills } from "@/components/reports/RangePresetPills";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addDaysUTC,
  dateOnlyToUTCDate,
  diffDaysUTC,
  todayISODate,
  utcDateToISODate,
} from "@/lib/dateOnly";

export function ReportDownloadForm({ todayOverride }: { todayOverride?: string }) {
  const today = todayOverride ?? todayISODate();
  const defaultFrom = useMemo(
    () => utcDateToISODate(addDaysUTC(dateOnlyToUTCDate(today), -90)),
    [today]
  );

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(today);

  const href = useMemo(() => {
    const params = new URLSearchParams({ from, to });
    return `/api/reports/pdf?${params.toString()}`;
  }, [from, to]);
  const rangeDays = useMemo(() => {
    if (!from || !to) return null;
    const difference = diffDaysUTC(dateOnlyToUTCDate(to), dateOnlyToUTCDate(from));
    return difference >= 0 ? difference + 1 : null;
  }, [from, to]);
  const invalidRange = rangeDays === null;

  return (
    <Card variant="hero">
      <CardContent className="space-y-5 pt-6">
        <RangePresetPills
          today={today}
          onApply={({ from: nextFrom, to: nextTo }) => {
            setFrom(nextFrom);
            setTo(nextTo);
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="from">From</Label>
            <Input id="from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="to">To</Label>
            <Input id="to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3 [box-shadow:var(--shadow-inset)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
              Range span
            </p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
              {rangeDays !== null ? `${rangeDays} days` : "Invalid range"}
            </p>
          </div>
          <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3 [box-shadow:var(--shadow-inset)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
              Includes
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--foreground)]">
              Cycle stats, period history, symptoms, notes
            </p>
          </div>
          <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3 [box-shadow:var(--shadow-inset)]">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
              Best for
            </p>
            <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--foreground)]">
              Self-review, appointments, and monthly snapshots
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={invalidRange ? undefined : href}
            aria-disabled={invalidRange}
            className={`inline-flex h-11 items-center justify-center rounded-full px-5 text-sm font-medium ${
              invalidRange
                ? "pointer-events-none bg-[color:var(--paper-muted)] text-[color:var(--ink-soft)]"
                : "bg-[color:var(--brand)] text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)]"
            }`}
          >
            Download PDF
          </a>
          <a
            href={invalidRange ? undefined : href}
            target="_blank"
            rel="noreferrer"
            aria-disabled={invalidRange}
            className={`text-sm font-medium ${
              invalidRange ? "pointer-events-none text-[color:var(--ink-soft)]" : "text-[color:var(--brand)]"
            }`}
          >
            Open in new tab
          </a>
        </div>
        {invalidRange ? (
          <p className="text-sm text-[color:var(--danger)]">
            Choose a start date that comes before the end date.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
