import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type LatestLog = {
  date: string;
  mood: number | null;
  flow: string | null;
  bbt: number | null;
  mucusType: string | null;
  sex: boolean;
  contraception: string | null;
  notes: string | null;
};

export function DashboardSnapshotRail(props: {
  cycleHealth: Array<{ label: string; value: string }>;
  latestLog: LatestLog | null;
  trackingStreak: number;
  fertileWindow: { start: string; end: string } | null;
}) {
  return (
    <div className="space-y-4">
      <Card variant="panel">
        <CardContent className="space-y-3 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
            Snapshot
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {props.cycleHealth.slice(0, 4).map((item) => (
              <div key={item.label} className="rounded-[24px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
                <p className="text-sm text-[color:var(--ink-soft)]">{item.label}</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card variant="panel">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                Latest check-in
              </p>
              <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                {props.latestLog?.date ?? "No recent log"}
              </p>
            </div>
            <Badge variant="muted">{props.trackingStreak} day streak</Badge>
          </div>

          <div className="grid gap-3">
            <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
              <p className="text-sm text-[color:var(--ink-soft)]">Body cues</p>
              <p className="mt-2 text-base font-medium text-[color:var(--foreground)]">
                {props.latestLog
                  ? `${props.latestLog.flow ?? "No flow"} | Mood ${props.latestLog.mood ?? "not set"} | ${
                      props.latestLog.mucusType ?? "No mucus note"
                    }`
                  : "Add a daily log to unlock a cleaner body-cue snapshot."}
              </p>
            </div>

            <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
              <p className="text-sm text-[color:var(--ink-soft)]">Notes</p>
              <p className="mt-2 text-base font-medium text-[color:var(--foreground)]">
                {props.latestLog?.notes ?? "No note saved yet."}
              </p>
            </div>

            <div className="rounded-[24px] border border-emerald-200/70 bg-emerald-50/75 p-4">
              <p className="text-sm text-emerald-950/70">Fertile estimate</p>
              <p className="mt-2 text-base font-medium text-emerald-950">
                {props.fertileWindow
                  ? `${props.fertileWindow.start} to ${props.fertileWindow.end}`
                  : "Available after enough cycle history exists."}
              </p>
              <p className="mt-3 text-xs leading-5 text-emerald-950/75">
                Estimates only. Not medical advice and not birth control.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
