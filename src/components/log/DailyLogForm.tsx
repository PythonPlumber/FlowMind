"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

import { saveDailyLogAction } from "@/actions/dailyLog";
import { ChoicePillGroup } from "@/components/log/ChoicePillGroup";
import { LogSection } from "@/components/log/LogSection";
import { SymptomCard } from "@/components/log/SymptomCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Definition = { key: string; label: string; category: string };

type Props = {
  initial: {
    date: string;
    flow: "" | "spotting" | "light" | "medium" | "heavy";
    mood: "" | number;
    notes: string;
    bbt: "" | number;
    mucusType: "" | "dry" | "sticky" | "creamy" | "watery" | "eggwhite";
    sex: boolean | null;
    contraception: string;
    selectedPredefined: Record<string, number>;
    selectedCustom: Record<string, number>;
  };
  definitions: Definition[];
  existingCustomSymptoms: string[];
  cycleContext?: {
    phaseLabel: string;
    cycleDay: number | null;
    daysUntilNextPeriod: number | null;
    isInFertileWindow: boolean;
  } | null;
};

const QUICK_ADD_SYMPTOMS = [
  { key: "cramps", label: "Cramps" },
  { key: "bloating", label: "Bloating" },
  { key: "fatigue", label: "Fatigue" },
  { key: "headache", label: "Headache" },
];

const PHASE_HINTS: Record<string, { title: string; suggestions: string[] }> = {
  menstruation: {
    title: "During your period",
    suggestions: ["Rest is important", "Stay hydrated", "Track flow changes"],
  },
  follicular_early: {
    title: "Early follicular phase",
    suggestions: ["Energy returning", "Good for new habits", "Light exercise helps"],
  },
  follicular_late: {
    title: "Late follicular phase",
    suggestions: ["Rising energy", "Peak communication", "Social activities favored"],
  },
  ovulation: {
    title: "Ovulation",
    suggestions: ["Peak fertility", "Note any ovulation pain", "Stay aware of timing"],
  },
  fertile: {
    title: "Fertile window",
    suggestions: ["Conception possible", "Track mucus changes", "Note any sensations"],
  },
  luteal_early: {
    title: "Early luteal phase",
    suggestions: ["Progesterone rising", "Focus on routine", "Moderate activity helps"],
  },
  luteal_late: {
    title: "Late luteal phase",
    suggestions: ["PMS possible", "Extra self-care", "Reduce caffeine and salt"],
  },
};

export function DailyLogForm({ initial, definitions, existingCustomSymptoms, cycleContext }: Props) {
  const router = useRouter();

  const [date, setDate] = useState(initial.date);
  const [flow, setFlow] = useState(initial.flow);
  const [mood, setMood] = useState<Props["initial"]["mood"]>(initial.mood);
  const [notes, setNotes] = useState(initial.notes);
  const [bbt, setBbt] = useState<Props["initial"]["bbt"]>(initial.bbt);
  const [mucusType, setMucusType] = useState<Props["initial"]["mucusType"]>(initial.mucusType);
  const [sex, setSex] = useState(initial.sex);
  const [contraception, setContraception] = useState(initial.contraception);
  const [predefined, setPredefined] = useState<Record<string, number>>(initial.selectedPredefined);
  const [custom, setCustom] = useState<Record<string, number>>(initial.selectedCustom);
  const [customInput, setCustomInput] = useState("");
  const [status, setStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(true);

  const grouped = useMemo(() => {
    const map = new Map<string, Definition[]>();
    for (const definition of definitions) {
      const entries = map.get(definition.category) ?? [];
      entries.push(definition);
      map.set(definition.category, entries);
    }
    return [...map.entries()];
  }, [definitions]);

  function togglePredefined(key: string, checked: boolean) {
    setPredefined((prev) => {
      const next = { ...prev };
      if (!checked) delete next[key];
      else next[key] = next[key] ?? 1;
      return next;
    });
  }

  function setPredefinedSeverity(key: string, severity: number) {
    setPredefined((prev) => ({ ...prev, [key]: severity }));
  }

  function toggleCustom(label: string, checked: boolean) {
    setCustom((prev) => {
      const next = { ...prev };
      if (!checked) delete next[label];
      else next[label] = next[label] ?? 1;
      return next;
    });
  }

  function setCustomSeverity(label: string, severity: number) {
    setCustom((prev) => ({ ...prev, [label]: severity }));
  }

  function addCustomLabel() {
    const label = customInput.trim();
    if (!label) return;
    setCustom((prev) => ({ ...prev, [label]: prev[label] ?? 1 }));
    setCustomInput("");
  }

  function quickAddSymptom(key: string) {
    setPredefined((prev) => ({ ...prev, [key]: prev[key] ?? 1 }));
  }

  async function onSave() {
    setStatus(null);
    setSaving(true);
    const result = await saveDailyLogAction({
      date,
      flow: flow || undefined,
      mood: mood === "" ? undefined : Number(mood),
      notes: notes || undefined,
      bbt: bbt === "" ? undefined : Number(bbt),
      mucusType: mucusType || undefined,
      sex: sex === null ? undefined : sex,
      contraception: contraception || undefined,
      predefinedSymptoms: Object.entries(predefined).map(([key, severity]) => ({
        key,
        severity,
      })),
      customSymptoms: Object.entries(custom).map(([label, severity]) => ({
        label,
        severity,
      })),
    });
    setSaving(false);

    if (!result.ok) {
      setStatus({ type: "error", message: result.error });
      return;
    }

    setStatus({
      type: "success",
      message: result.motivationalMessage ?? "Saved successfully!",
    });
    
    setTimeout(() => {
      setStatus(null);
    }, 3000);
  }

  function onDateChange(nextDate: string) {
    setDate(nextDate);
    router.push(`/log?date=${encodeURIComponent(nextDate)}`);
  }

  const trackedSymptomCount = Object.keys(predefined).length + Object.keys(custom).length;
  
  const trackedSymptomLabels = useMemo(() => {
    const labels: string[] = [];
    for (const def of definitions) {
      if (Object.prototype.hasOwnProperty.call(predefined, def.key)) {
        labels.push(def.label);
      }
    }
    for (const label of Object.keys(custom)) {
      labels.push(label);
    }
    return labels;
  }, [predefined, custom, definitions]);

  const progressItems = [
    {
      label: "Flow",
      done: Boolean(flow),
      hint: flow ? `Logged as ${flow}` : "Choose spotting to heavy",
      color: flow ? "bg-amber-400" : "bg-gray-200",
    },
    {
      label: "Mood",
      done: mood !== "",
      hint: mood !== "" ? `Mood ${mood}/5` : "Pick a 1 to 5 rating",
      color: mood !== "" ? "bg-emerald-400" : "bg-gray-200",
    },
    {
      label: "Body signals",
      done: bbt !== "" || Boolean(mucusType) || Boolean(contraception) || sex !== null,
      hint:
        bbt !== "" || Boolean(mucusType) || Boolean(contraception) || sex !== null
          ? "Advanced cues captured"
          : "Optional but useful",
      color:
        bbt !== "" || Boolean(mucusType) || Boolean(contraception) || sex !== null
          ? "bg-blue-400"
          : "bg-gray-200",
    },
    {
      label: "Symptoms",
      done: trackedSymptomCount > 0,
      hint:
        trackedSymptomCount > 0
          ? `${trackedSymptomCount} symptom${trackedSymptomCount === 1 ? "" : "s"} selected`
          : "Tap symptoms you felt today",
      color: trackedSymptomCount > 0 ? "bg-purple-400" : "bg-gray-200",
    },
    {
      label: "Notes",
      done: notes.trim().length > 0,
      hint: notes.trim().length > 0 ? "Notes saved in draft" : "Add context for later",
      color: notes.trim().length > 0 ? "bg-rose-400" : "bg-gray-200",
    },
  ] as const;
  
  const completedSections = progressItems.filter((item) => item.done).length;
  const completionPercent = Math.round((completedSections / progressItems.length) * 100);
  
  const isFullyComplete = completedSections === progressItems.length;
  const signalSurfaceClass =
    "space-y-2 rounded-[24px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]";
  
  const phaseHint = cycleContext?.phaseLabel 
    ? PHASE_HINTS[cycleContext.phaseLabel.toLowerCase().replace(/ /g, "_")] ?? null
    : null;

  const stickyMessage = status?.message ?? (isFullyComplete 
    ? "Your log is complete. Save when ready." 
    : `${completedSections} of ${progressItems.length} sections ready. Save anytime.`
  );

  return (
    <div className="space-y-5 pb-32">
      <Card variant="hero">
        <CardContent className="space-y-5 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                Check-in progress
              </p>
              <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[color:var(--foreground)]">
                {isFullyComplete ? "Log complete" : "Today at a glance"}
              </h2>
              <p className="text-sm leading-6 text-[color:var(--ink-soft)]">
                {isFullyComplete 
                  ? "All areas captured. Your log is ready to save."
                  : `${completedSections} of ${progressItems.length} areas captured. Start with the essentials, then add deeper cues.`
                }
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="muted">{date}</Badge>
              {cycleContext?.cycleDay && (
                <Badge variant="default">Day {cycleContext.cycleDay}</Badge>
              )}
              {cycleContext?.isInFertileWindow && (
                <Badge variant="fertile">Fertile</Badge>
              )}
              <Badge variant={isFullyComplete ? "success" : "default"}>
                {completedSections} / {progressItems.length}
              </Badge>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-[color:var(--foreground)]">
                Completion
              </span>
              <span className="font-semibold text-[color:var(--foreground)]">
                {completionPercent}%
              </span>
            </div>
            <div className="h-3 w-full rounded-full bg-[color:var(--paper-muted)] [box-shadow:var(--shadow-inset)]">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${completionPercent}%`,
                  backgroundColor: isFullyComplete ? "#5f8f72" : "var(--brand)",
                }}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {progressItems.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] bg-[color:var(--paper-muted)] px-4 py-4 [box-shadow:var(--shadow-inset)]"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-2.5 w-2.5 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
                    {item.label}
                  </p>
                </div>
                <p className="mt-2 text-sm font-medium leading-6 text-[color:var(--foreground)]">
                  {item.done ? item.hint : "Open"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {phaseHint && cycleContext?.cycleDay && (
        <Card variant="panel" className="border-[color:var(--brand)]/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-[color:var(--brand-soft)] p-2">
                <Sparkles className="h-4 w-4 text-[color:var(--brand)]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--brand)]">
                  {phaseHint.title}
                </p>
                <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
                  {cycleContext.daysUntilNextPeriod !== null && cycleContext.daysUntilNextPeriod > 0
                    ? `${cycleContext.daysUntilNextPeriod} days until next period`
                    : cycleContext.isInFertileWindow
                    ? "You are in your fertile window"
                    : null
                  }
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {phaseHint.suggestions.map((suggestion) => (
                    <span
                      key={suggestion}
                      className="rounded-full bg-[color:var(--paper-muted)] px-3 py-1 text-xs font-medium text-[color:var(--foreground)]"
                    >
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showQuickAdd && !isFullyComplete && (
        <Card variant="panel" className="border-[color:var(--brand)]/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
                  Quick add
                </p>
                <p className="mt-1 text-sm text-[color:var(--foreground)]">
                  Common symptoms for this phase
                </p>
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setShowQuickAdd(false)}
                className="text-xs"
              >
                Hide
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_ADD_SYMPTOMS.map((symptom) => (
                <button
                  key={symptom.key}
                  type="button"
                  onClick={() => quickAddSymptom(symptom.key)}
                  disabled={Object.prototype.hasOwnProperty.call(predefined, symptom.key)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    Object.prototype.hasOwnProperty.call(predefined, symptom.key)
                      ? "bg-[color:var(--brand)]/20 text-[color:var(--brand)]"
                      : "bg-[color:var(--paper-muted)] text-[color:var(--foreground)] hover:bg-[color:var(--brand)]/10"
                  }`}
                >
                  {Object.prototype.hasOwnProperty.call(predefined, symptom.key) && (
                    <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                  )}
                  {symptom.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <LogSection title="Flow" description="Choose the intensity that best fits today.">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)]">
          <div className={signalSurfaceClass}>
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(event) => onDateChange(event.target.value)} />
          </div>
          <div className={signalSurfaceClass}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
              Flow level
            </p>
            <ChoicePillGroup
              value={flow}
              onChange={(next) =>
                setFlow(next as "" | "spotting" | "light" | "medium" | "heavy")
              }
              options={[
                { label: "Spotting", value: "spotting" },
                { label: "Light", value: "light" },
                { label: "Medium", value: "medium" },
                { label: "Heavy", value: "heavy" },
              ]}
            />
          </div>
        </div>
      </LogSection>

      <LogSection title="Mood" description="Capture the overall tone of the day.">
        <div className={signalSurfaceClass}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
            Mood rating
          </p>
          <ChoicePillGroup
            value={mood}
            onChange={(next) => setMood(Number(next))}
            options={[
              { label: "1", value: 1 },
              { label: "2", value: 2 },
              { label: "3", value: 3 },
              { label: "4", value: 4 },
              { label: "5", value: 5 },
            ]}
          />
        </div>
      </LogSection>

      <LogSection
        title="Body signals"
        description="Track advanced fertility and body cues when you want a deeper daily record."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className={signalSurfaceClass}>
            <Label htmlFor="bbt">BBT (°C)</Label>
            <Input
              id="bbt"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="e.g. 36.70"
              value={bbt}
              onChange={(event) =>
                setBbt(event.target.value === "" ? "" : Number(event.target.value))
              }
            />
          </div>
          <div className={signalSurfaceClass}>
            <Label>Mucus type</Label>
            <ChoicePillGroup
              value={mucusType}
              onChange={(next) =>
                setMucusType(
                  next as "" | "dry" | "sticky" | "creamy" | "watery" | "eggwhite"
                )
              }
              allowClear
              options={[
                { label: "Dry", value: "dry" },
                { label: "Sticky", value: "sticky" },
                { label: "Creamy", value: "creamy" },
                { label: "Watery", value: "watery" },
                { label: "Egg white", value: "eggwhite" },
              ]}
            />
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className={signalSurfaceClass}>
            <Label>Intimacy</Label>
            <ChoicePillGroup
              value={sex === true ? "yes" : sex === false ? "no" : ""}
              onChange={(next) =>
                setSex(next === "yes" ? true : next === "no" ? false : null)
              }
              options={[
                { label: "Not logged", value: "" },
                { label: "Had sex", value: "yes" },
                { label: "No sex", value: "no" },
              ]}
            />
          </div>
          <div className={signalSurfaceClass}>
            <Label htmlFor="contraception">Contraception</Label>
            <Input
              id="contraception"
              value={contraception}
              onChange={(event) => setContraception(event.target.value)}
              placeholder="e.g. Condom, pill, none"
            />
          </div>
        </div>
      </LogSection>

      <LogSection title="Symptoms" description="Tap a symptom to include it, then set the severity.">
        <div className="space-y-5">
          {grouped.map(([category, defs]) => (
            <div key={category} className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
                {category}
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                {defs.map((definition) => (
                  <SymptomCard
                    key={definition.key}
                    label={definition.label}
                    checked={Object.prototype.hasOwnProperty.call(predefined, definition.key)}
                    severity={predefined[definition.key] ?? 1}
                    onToggle={(checked) => togglePredefined(definition.key, checked)}
                    onSeverityChange={(value) => setPredefinedSeverity(definition.key, value)}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
              Custom
            </p>
            <div className="rounded-[28px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
              <div className="flex flex-wrap items-end gap-3">
                <div className="min-w-52 flex-1 space-y-2">
                  <Label htmlFor="customInput">Add a custom symptom</Label>
                  <Input
                    id="customInput"
                    value={customInput}
                    onChange={(event) => setCustomInput(event.target.value)}
                    placeholder="e.g. cravings"
                  />
                </div>
                <Button type="button" variant="secondary" onClick={addCustomLabel}>
                  Add
                </Button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[...new Set([...existingCustomSymptoms, ...Object.keys(custom)])]
                .sort((a, b) => a.localeCompare(b))
                .map((label) => (
                  <SymptomCard
                    key={label}
                    label={label}
                    checked={Object.prototype.hasOwnProperty.call(custom, label)}
                    severity={custom[label] ?? 1}
                    onToggle={(checked) => toggleCustom(label, checked)}
                    onSeverityChange={(value) => setCustomSeverity(label, value)}
                  />
                ))}
            </div>
          </div>
        </div>
      </LogSection>

      <LogSection title="Notes" description="Capture anything that will matter later.">
        <div className={signalSurfaceClass}>
          <Textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Symptoms, energy, medication, or anything else you want to remember."
          />
        </div>
      </LogSection>

      <div
        data-testid="sticky-log-actions"
        className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-3"
      >
        <div className="mx-auto max-w-6xl">
          <Card 
            variant="panel" 
            className={`transition-all duration-300 ${
              status?.type === "success" 
                ? "bg-emerald-50/95 backdrop-blur-xl border-emerald-200/50" 
                : status?.type === "error"
                ? "bg-red-50/95 backdrop-blur-xl border-red-200/50"
                : "bg-[rgba(246,249,255,0.92)] backdrop-blur-xl"
            }`}
          >
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {status?.type === "success" && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  {status?.type === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <p className="text-sm font-semibold text-[color:var(--foreground)]">
                    {completedSections} of {progressItems.length} sections ready
                  </p>
                </div>
                <p aria-live="polite" className="mt-1 text-sm text-[color:var(--ink-soft)]">
                  {stickyMessage}
                </p>
                {trackedSymptomLabels.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {trackedSymptomLabels.slice(0, 5).map((label) => (
                      <span
                        key={label}
                        className="rounded-full bg-[color:var(--brand)]/10 px-2 py-0.5 text-xs text-[color:var(--brand)]"
                      >
                        {label}
                      </span>
                    ))}
                    {trackedSymptomLabels.length > 5 && (
                      <span className="text-xs text-[color:var(--ink-soft)]">
                        +{trackedSymptomLabels.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button type="button" variant="ghost" onClick={() => router.push("/")}>
                  Back
                </Button>
                <Button 
                  type="button" 
                  className="min-w-[8.5rem]" 
                  onClick={onSave} 
                  disabled={saving}
                >
                  {saving ? "Saving..." : isFullyComplete ? "Save complete" : "Save log"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
