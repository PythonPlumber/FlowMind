"use client";

import Link from "next/link";
import { useState } from "react";

import { endCurrentPeriodAction, startPeriodAction } from "@/actions/periods";
import { Button } from "@/components/ui/button";

export function CalendarDayActions({ iso, isToday }: { iso: string | null; isToday?: boolean }) {
  const [loading, setLoading] = useState<"start" | "end" | null>(null);

  async function run(which: "start" | "end") {
    if (!iso) return;
    setLoading(which);
    if (which === "start") {
      await startPeriodAction({ date: iso });
    } else {
      await endCurrentPeriodAction({ date: iso });
    }
    setLoading(null);
  }

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {isToday ? (
        <Link
          href="/log"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 text-sm font-medium text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)]"
        >
          Log today
        </Link>
      ) : (
        <Link
          href={iso ? `/log?date=${iso}` : "/log"}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--brand)] px-5 text-sm font-medium text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)]"
        >
          Log this day
        </Link>
      )}
      <Button type="button" variant="secondary" onClick={() => run("start")} disabled={!iso || loading !== null}>
        {loading === "start" ? "Starting..." : "Start period"}
      </Button>
      <Button type="button" variant="secondary" onClick={() => run("end")} disabled={!iso || loading !== null}>
        {loading === "end" ? "Ending..." : "End period"}
      </Button>
      <Link
        href={iso ? `/log?date=${iso}` : "/log"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--paper-muted)] px-4 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-inset)]"
      >
        Edit log
      </Link>
      <Link
        href={iso ? `/insights?date=${iso}` : "/insights"}
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--paper-muted)] px-4 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-inset)]"
      >
        Insights
      </Link>
      <Link
        href="/"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[color:var(--line)] bg-[color:var(--paper-muted)] px-4 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-inset)]"
      >
        Dashboard
      </Link>
    </div>
  );
}
