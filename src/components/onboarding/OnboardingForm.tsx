"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { completeOnboardingAction } from "@/actions/profile";
import { ChoicePillGroup } from "@/components/log/ChoicePillGroup";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  initial: {
    birthYear: number | "";
    cycleLengthTypical: number;
    periodLengthTypical: number;
    goalMode: "track" | "conceive" | "avoid";
  };
};

export function OnboardingForm({ initial }: Props) {
  const router = useRouter();
  const [birthYear, setBirthYear] = useState<number | "">(initial.birthYear);
  const [cycleLengthTypical, setCycleLengthTypical] = useState(initial.cycleLengthTypical);
  const [periodLengthTypical, setPeriodLengthTypical] = useState(initial.periodLengthTypical);
  const [goalMode, setGoalMode] = useState<Props["initial"]["goalMode"]>(initial.goalMode);
  const [lastPeriodStart, setLastPeriodStart] = useState<string>("");
  const [u13Permission, setU13Permission] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const age = useMemo(() => {
    if (birthYear === "") return null;
    const year = new Date().getUTCFullYear();
    return year - Number(birthYear);
  }, [birthYear]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (birthYear === "") {
      setError("Birth year is required.");
      return;
    }

    setLoading(true);
    const result = await completeOnboardingAction({
      birthYear: Number(birthYear),
      cycleLengthTypical: Number(cycleLengthTypical),
      periodLengthTypical: Number(periodLengthTypical),
      goalMode,
      lastPeriodStart: lastPeriodStart || undefined,
      u13Permission: age !== null && age < 13 ? u13Permission : undefined,
    });
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-[30px] border border-white/55 bg-white/82 p-6 shadow-[0_18px_44px_rgba(83,37,48,0.08)]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birthYear">Birth year</Label>
            <Input
              id="birthYear"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 2010"
              required
              value={birthYear}
              onChange={(e) =>
                setBirthYear(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Goal</Label>
            <ChoicePillGroup
              value={goalMode}
              onChange={(next) => setGoalMode(next as Props["initial"]["goalMode"])}
              options={[
                { label: "Track periods", value: "track" },
                { label: "Trying to conceive", value: "conceive" },
                { label: "Avoid pregnancy", value: "avoid" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycleLen">Typical cycle length (days)</Label>
            <Input
              id="cycleLen"
              type="number"
              inputMode="numeric"
              min={15}
              max={60}
              value={cycleLengthTypical}
              onChange={(e) => setCycleLengthTypical(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="periodLen">Typical period length (days)</Label>
            <Input
              id="periodLen"
              type="number"
              inputMode="numeric"
              min={1}
              max={14}
              value={periodLengthTypical}
              onChange={(e) => setPeriodLengthTypical(Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[30px] border border-white/55 bg-white/82 p-6 shadow-[0_18px_44px_rgba(83,37,48,0.08)]">
        <div className="space-y-2">
          <Label htmlFor="lastStart">Last period start date (optional)</Label>
          <Input
            id="lastStart"
            type="date"
            value={lastPeriodStart}
            onChange={(e) => setLastPeriodStart(e.target.value)}
          />
          <p className="text-xs text-[color:var(--ink-soft)]">
            If you add this, you&apos;ll immediately get next-period and fertile-window
            estimates.
          </p>
        </div>
      </section>

      {age !== null && age < 13 ? (
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="flex items-start gap-2">
            <Checkbox
              id="u13Permission"
              checked={u13Permission}
              onChange={(e) => setU13Permission(e.currentTarget.checked)}
              required
            />
            <div className="space-y-1">
              <Label htmlFor="u13Permission">
                I have parent/guardian permission to use this app.
              </Label>
              <p className="text-xs text-amber-800">
                This is a lightweight check for a private friend app. Not legal advice.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Finish setup"}
      </Button>
    </form>
  );
}
