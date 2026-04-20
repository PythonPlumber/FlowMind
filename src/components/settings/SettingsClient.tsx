"use client";

import { useMemo, useState, useRef, ChangeEvent } from "react";
import { signOut } from "next-auth/react";
import { Download, Upload } from "lucide-react";

import { deleteAccountAction } from "@/actions/account";
import { deleteCustomSymptomAction } from "@/actions/customSymptoms";
import { updateProfileAction } from "@/actions/profile";
import { exportAllDataAction, importDataAction } from "@/actions/dataManagement";
import { ChoicePillGroup } from "@/components/log/ChoicePillGroup";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type GoalMode = "track" | "conceive" | "avoid";
type ToneStyle = "gentle" | "encouraging" | "celebratory";
type PrivacyMode = "full_analysis" | "patterns_only";
type EmotionalSupportLevel = "minimal" | "moderate" | "full";
type AgeGroup = "teen" | "adult" | null;

export function SettingsClient(props: {
  initialProfile: {
    birthYear: number | "";
    cycleLengthTypical: number;
    periodLengthTypical: number;
    goalMode: GoalMode;
    ageGroup?: AgeGroup;
    aiPreferences?: {
      toneStyle: ToneStyle;
      privacyMode: PrivacyMode;
      emotionalSupportLevel: EmotionalSupportLevel;
    };
  };
  customSymptoms: string[];
}) {
  const initialAIPreferences = props.initialProfile.aiPreferences ?? {
    toneStyle: "encouraging" as ToneStyle,
    privacyMode: "full_analysis" as PrivacyMode,
    emotionalSupportLevel: "full" as EmotionalSupportLevel,
  };
  const [birthYear, setBirthYear] = useState<number | "">(props.initialProfile.birthYear);
  const [cycleLengthTypical, setCycleLengthTypical] = useState(
    props.initialProfile.cycleLengthTypical
  );
  const [periodLengthTypical, setPeriodLengthTypical] = useState(
    props.initialProfile.periodLengthTypical
  );
  const [goalMode, setGoalMode] = useState<GoalMode>(props.initialProfile.goalMode);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(props.initialProfile.ageGroup ?? null);
  const [toneStyle, setToneStyle] = useState<ToneStyle>(initialAIPreferences.toneStyle);
  const [privacyMode, setPrivacyMode] = useState<PrivacyMode>(initialAIPreferences.privacyMode);
  const [emotionalSupportLevel, setEmotionalSupportLevel] = useState<EmotionalSupportLevel>(
    initialAIPreferences.emotionalSupportLevel
  );

  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState(props.customSymptoms);
  const [deletingSymptom, setDeletingSymptom] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    ok: boolean;
    error?: string;
    summary?: { periods: number; logs: number; customSymptoms: number };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const age = useMemo(() => {
    if (birthYear === "") return null;
    return new Date().getUTCFullYear() - Number(birthYear);
  }, [birthYear]);

  async function onSave() {
    setStatus(null);
    if (birthYear === "") {
      setStatus("Birth year is required.");
      return;
    }

    setSaving(true);
    const result = await updateProfileAction({
      birthYear: Number(birthYear),
      cycleLengthTypical: Number(cycleLengthTypical),
      periodLengthTypical: Number(periodLengthTypical),
      goalMode,
      ageGroup,
      aiPreferences: {
        toneStyle,
        privacyMode,
        emotionalSupportLevel,
      },
    });
    setSaving(false);

    setStatus(result.ok ? "Saved." : result.error);
  }

  async function onDeleteSymptom(label: string) {
    if (!confirm(`Delete custom symptom "${label}"?`)) return;
    setDeletingSymptom(label);
    const result = await deleteCustomSymptomAction({ label });
    setDeletingSymptom(null);

    if (!result.ok) {
      setStatus(result.error);
      return;
    }

    setSymptoms((prev) => prev.filter((symptom) => symptom !== label));
    setStatus("Custom symptom deleted.");
  }

  async function onDeleteAccount() {
    if (!confirm("Delete your account and all data? This cannot be undone.")) return;

    setStatus(null);
    const result = await deleteAccountAction();
    if (!result.ok) {
      setStatus("Failed to delete account.");
      return;
    }

    await signOut({ callbackUrl: "/auth/sign-in" });
  }

  async function handleExport() {
    setExporting(true);
    const result = await exportAllDataAction();
    setExporting(false);

    if (!result.ok) {
      setStatus("Export failed: " + result.error);
      return;
    }

    const blob = new Blob([result.data ?? "{}"], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `period-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus("Data exported successfully.");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setImportResult(null);
  }

  async function handleImport() {
    if (!selectedFile) return;

    setImporting(true);
    setImportResult(null);

    try {
      const text = await selectedFile.text();
      const result = await importDataAction({ jsonData: text });

      setImportResult(result);

      if (result.ok) {
        setStatus("Data imported successfully.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setSelectedFile(null);
      }
    } catch {
      setImportResult({ ok: false, error: "Failed to read file." });
    }

    setImporting(false);
  }

  return (
    <div className="space-y-6 pb-32">
      <Card variant="hero">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                Settings snapshot
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                Keep your tracker tuned to your real rhythm
              </h2>
              <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
                Update cycle defaults, goal mode, and privacy controls from one mobile-friendly workspace.
              </p>
            </div>
            {status ? (
              <div className="rounded-full bg-[color:var(--paper-muted)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-inset)]">
                {status}
              </div>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
                Goal
              </p>
              <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
                {goalMode === "track"
                  ? "Track periods"
                  : goalMode === "conceive"
                    ? "Trying to conceive"
                    : "Avoid pregnancy"}
              </p>
            </div>
            <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
                Cycle defaults
              </p>
              <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
                {cycleLengthTypical} day cycle | {periodLengthTypical} day period
              </p>
            </div>
            <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3 [box-shadow:var(--shadow-inset)]">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">
                Custom symptoms
              </p>
              <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">
                {symptoms.length} saved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <SettingsSection
        title="Profile"
        description="Personal details kept intentionally light for privacy."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birthYear">Birth year</Label>
            <Input
              id="birthYear"
              type="number"
              inputMode="numeric"
              value={birthYear}
              onChange={(event) =>
                setBirthYear(event.target.value === "" ? "" : Number(event.target.value))
              }
            />
            {age !== null ? <p className="text-xs text-[color:var(--ink-soft)]">Age {age}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="goalMode">Goal</Label>
            <ChoicePillGroup
              value={goalMode}
              onChange={(next) => setGoalMode(next as GoalMode)}
              options={[
                { label: "Track periods", value: "track" },
                { label: "Trying to conceive", value: "conceive" },
                { label: "Avoid pregnancy", value: "avoid" },
              ]}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Cycle preferences"
        description="Keep default cycle assumptions aligned with your current experience."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cycleLen">Typical cycle length (days)</Label>
            <Input
              id="cycleLen"
              type="number"
              min={15}
              max={60}
              value={cycleLengthTypical}
              onChange={(event) => setCycleLengthTypical(Number(event.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="periodLen">Typical period length (days)</Label>
            <Input
              id="periodLen"
              type="number"
              min={1}
              max={14}
              value={periodLengthTypical}
              onChange={(event) => setPeriodLengthTypical(Number(event.target.value))}
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Custom symptoms"
        description="Manage the custom symptom labels that appear in your daily log."
      >
        {symptoms.length === 0 ? (
          <div className="rounded-[22px] bg-[color:var(--paper-muted)] p-4 text-sm text-[color:var(--ink-soft)] [box-shadow:var(--shadow-inset)]">
            You do not have any custom symptoms yet. Add them from the Log page.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {symptoms.map((symptom) => (
              <button
                key={symptom}
                type="button"
                onClick={() => onDeleteSymptom(symptom)}
                disabled={deletingSymptom === symptom}
                className="rounded-[22px] border border-white/70 bg-[color:var(--paper-strong)] px-4 py-2.5 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]"
              >
                {deletingSymptom === symptom ? "Deleting..." : symptom}
              </button>
            ))}
          </div>
        )}
      </SettingsSection>

      <SettingsSection
        title="Data Management"
        description="Export your data for backup or transfer to another device."
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleExport}
              disabled={exporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {exporting ? "Exporting..." : "Export all data"}
            </Button>
            <p className="text-sm text-[color:var(--ink-soft)]">
              Download your periods, logs, and custom symptoms as JSON
            </p>
          </div>

          <div className="border-t border-[color:var(--line)] pt-4">
            <div className="space-y-2">
              <Label htmlFor="importFile">Import from backup</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="importFile"
                  type="file"
                  accept=".json"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="max-w-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleImport}
                  disabled={importing || !selectedFile}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {importing ? "Importing..." : "Import"}
                </Button>
              </div>
              <p className="text-xs text-[color:var(--ink-soft)]">
                Import periods, daily logs, and custom symptoms from a backup file. Existing data will not be overwritten.
              </p>
            </div>
          </div>

          {importResult && (
            <div
              className={`rounded-[22px] p-4 text-sm ${
                importResult.ok
                  ? "bg-emerald-50/80 text-emerald-900"
                  : "bg-red-50/80 text-red-900"
              }`}
            >
              {importResult.ok
                ? `Imported ${importResult.summary?.periods ?? 0} periods, ${importResult.summary?.logs ?? 0} logs, ${importResult.summary?.customSymptoms ?? 0} custom symptoms`
                : `Import failed: ${importResult.error}`}
            </div>
          )}
        </div>
      </SettingsSection>

      <SettingsSection
        title="AI Preferences"
        description="Customize how AI speaks to you and what data is used for analysis."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="ageGroup">Age Group (optional)</Label>
            <ChoicePillGroup
              value={ageGroup ?? ""}
              onChange={(next) => setAgeGroup(next === "" ? null : (next as AgeGroup))}
              options={[
                { label: "Teen (13-19)", value: "teen" },
                { label: "Adult (20+)", value: "adult" },
                { label: "Prefer not to say", value: "" },
              ]}
            />
            <p className="text-xs text-[color:var(--ink-soft)]">
              Helps AI use age-appropriate language
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="toneStyle">AI Tone</Label>
            <ChoicePillGroup
              value={toneStyle}
              onChange={(next) => setToneStyle(next as ToneStyle)}
              options={[
                { label: "Gentle & Soft", value: "gentle" },
                { label: "Encouraging & Supportive", value: "encouraging" },
                { label: "Celebratory & Energetic", value: "celebratory" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emotionalSupportLevel">Emotional Support Level</Label>
            <ChoicePillGroup
              value={emotionalSupportLevel}
              onChange={(next) => setEmotionalSupportLevel(next as EmotionalSupportLevel)}
              options={[
                { label: "Minimal", value: "minimal" },
                { label: "Moderate", value: "moderate" },
                { label: "Full", value: "full" },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacyMode">Privacy Mode</Label>
            <ChoicePillGroup
              value={privacyMode}
              onChange={(next) => setPrivacyMode(next as PrivacyMode)}
              options={[
                { label: "Full Analysis", value: "full_analysis" },
                { label: "Patterns Only (no notes)", value: "patterns_only" },
              ]}
            />
            <p className="text-xs text-[color:var(--ink-soft)]">
              In &quot;Patterns Only&quot; mode, your notes are not sent to AI
            </p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Privacy"
        description="Delete your account and every stored record if you no longer want to use the tracker."
        danger
      >
        <Button type="button" variant="destructive" onClick={onDeleteAccount}>
          Delete account
        </Button>
      </SettingsSection>

      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 pt-3">
        <div className="mx-auto max-w-6xl">
          <Card variant="panel" className="bg-[rgba(246,249,255,0.92)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[color:var(--foreground)]">
                  Profile and cycle defaults
                </p>
                <p className="text-sm text-[color:var(--ink-soft)]">
                  {status ?? "Save after updating your preferred cycle assumptions."}
                </p>
              </div>
              <Button type="button" onClick={onSave} disabled={saving}>
                {saving ? "Saving..." : "Save settings"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}