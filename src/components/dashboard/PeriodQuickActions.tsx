"use client";

import { useState } from "react";
import Link from "next/link";

import { endCurrentPeriodAction, startPeriodAction } from "@/actions/periods";
import { Button } from "@/components/ui/button";

export function PeriodQuickActions() {
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<"start" | "end" | null>(null);

  async function run(which: "start" | "end") {
    setMsg(null);
    setLoading(which);
    const res =
      which === "start"
        ? await startPeriodAction()
        : await endCurrentPeriodAction();
    setLoading(null);
    if (!res.ok) {
      setMsg(res.error);
      return;
    }
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Button
          type="button"
          className="justify-center"
          onClick={() => run("start")}
          disabled={loading !== null}
        >
          {loading === "start" ? "Starting..." : "Start period today"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="justify-center"
          onClick={() => run("end")}
          disabled={loading !== null}
        >
          {loading === "end" ? "Ending..." : "End period today"}
        </Button>
        <Link
          href="/log"
          className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full border border-white/70 bg-[color:var(--paper-strong)] px-5 py-2 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/35"
        >
          Log symptoms
        </Link>
        <Link
          href="/calendar"
          className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full border border-white/70 bg-[color:var(--paper-strong)] px-5 py-2 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/35"
        >
          Open calendar
        </Link>
      </div>
      {msg ? (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {msg}
        </p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <a
          href="/api/calendar/next-period.ics"
          className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full border border-white/70 bg-[color:var(--paper-strong)] px-4 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/35"
        >
          Add next period to calendar
        </a>
        <a
          href="/api/calendar/fertile-window.ics"
          className="inline-flex h-11 items-center justify-center whitespace-nowrap rounded-full border border-white/70 bg-[color:var(--paper-strong)] px-4 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/35"
        >
          Add fertile window to calendar
        </a>
      </div>
    </div>
  );
}
