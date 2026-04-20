"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart, Sparkles, TrendingUp, Zap } from "lucide-react";

import AIQuestionCard from "@/components/ai-analytics/AIQuestionCard";
import AIStreamingCard from "@/components/ai-analytics/AIStreamingCard";
import MonthlySummaryCard from "@/components/ai-analytics/MonthlySummaryCard";
import MotivationWidget from "@/components/ai-analytics/MotivationWidget";
import { ActionMenu } from "@/components/ui/action-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageIntro } from "@/components/ui/page-intro";
import { buildAnalysisReadiness } from "@/lib/ai/monthly-analytics";
import type {
  AggregatedUserData,
  AgeGroup,
  EmotionalSupportLevel,
  ToneStyle,
} from "@/types/ai";

interface AIAnalyticsExperienceProps {
  initialData: AggregatedUserData;
  gamificationStats: {
    currentStreak: number;
    bestStreak: number;
    totalLogs: number;
    achievements: string[];
  };
  profile: {
    ageGroup: AgeGroup;
    aiTonePreference: ToneStyle;
    emotionalSupportLevel: EmotionalSupportLevel;
  };
  monthContext: {
    monthLabel: string;
    monthParam: string;
    currentHref: string;
    previousHref: string;
    nextHref: string | null;
  };
}

export default function AIAnalyticsExperience({
  initialData,
  gamificationStats,
  profile,
  monthContext,
}: AIAnalyticsExperienceProps) {
  const [analysisTriggered, setAnalysisTriggered] = useState(false);
  const readiness = useMemo(() => buildAnalysisReadiness(initialData), [initialData]);
  const readinessBadgeVariant =
    readiness.level === "ready"
      ? "success"
      : readiness.level === "growing"
        ? "warning"
        : "muted";

  const insightCards = [
    {
      label: "Cycle rhythm",
      value: initialData.cycles.recentRange
        ? `${initialData.cycles.recentRange.min}-${initialData.cycles.recentRange.max} days`
        : `${initialData.cycles.medianLength} day baseline`,
      note:
        initialData.cycles.variability === "high"
          ? "Timing is moving, so ranges matter more than exact dates."
          : initialData.cycles.variability === "moderate"
            ? "Some movement is present across recent cycles."
            : "Recent cycle timing is comparatively steady.",
    },
    {
      label: "Logging depth",
      value: readiness.coverageLabel,
      note: `${initialData.logging.consistency.toFixed(0)}% consistency across the selected month.`,
    },
    {
      label: "Mood picture",
      value:
        initialData.moods.averageRating > 0
          ? `${initialData.moods.averageRating.toFixed(1)} / 5`
          : "Not enough mood data",
      note: `Mood trend looks ${initialData.moods.trend.replace("_", " ")}.`,
    },
    {
      label: "Symptom focus",
      value: initialData.symptoms.topSymptoms[0]?.name ?? "Still building",
      note:
        initialData.symptoms.topSymptoms[0]
          ? `${initialData.symptoms.topSymptoms[0].frequency} logged entries this month.`
          : "Track symptoms on more days to surface stronger month patterns.",
    },
  ];

  const actionLinkClass =
    "inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--paper-muted)] px-4 text-sm font-medium text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]";

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="AI Analyst"
        title={monthContext.monthLabel}
        description="A quieter monthly read grounded in your actual logs."
        meta={
          <>
            <span>
              {initialData.logging.loggedDays} logged day
              {initialData.logging.loggedDays === 1 ? "" : "s"}
            </span>
            <span>
              {initialData.cycles.count} cycle event
              {initialData.cycles.count === 1 ? "" : "s"}
            </span>
            <span>{Math.round(initialData.logging.consistency)}% consistency</span>
          </>
        }
        actions={
          <>
            <Link href={monthContext.currentHref} className={actionLinkClass}>
              Current month
            </Link>
            <Link href={monthContext.previousHref} className={actionLinkClass}>
              Earlier month
            </Link>
            {monthContext.nextHref ? (
              <Link href={monthContext.nextHref} className={actionLinkClass}>
                Newer month
              </Link>
            ) : null}
            <ActionMenu
              label="Open AI analytics actions"
              items={[
                { label: "Open insights", href: "/insights" },
                { label: "Open reports", href: "/reports" },
                { label: "Open settings", href: "/settings" },
              ]}
            />
          </>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <MonthlySummaryCard
          active={analysisTriggered}
          monthParam={monthContext.monthParam}
          monthLabel={monthContext.monthLabel}
        />

        <div className="space-y-6">
          <Card variant="panel">
            <CardContent className="space-y-5 pt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={readinessBadgeVariant}>
                  {readiness.level === "ready"
                    ? "AI ready"
                    : readiness.level === "growing"
                      ? "AI growing"
                      : "Early signal"}
                </Badge>
                <Badge variant="muted">{profile.aiTonePreference} tone</Badge>
                <Badge variant="muted">{profile.emotionalSupportLevel} support</Badge>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                  Month readiness
                </p>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)]">
                  Monthly read, sized to your data
                </h2>
                <p className="text-sm leading-6 text-[color:var(--ink-soft)]">
                  {readiness.summary}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
                  <p className="text-sm text-[color:var(--ink-soft)]">Coverage</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                    {readiness.coverageLabel}
                  </p>
                </div>
                <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
                  <p className="text-sm text-[color:var(--ink-soft)]">Consistency</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                    {initialData.logging.consistency.toFixed(0)}%
                  </p>
                </div>
                <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
                  <p className="text-sm text-[color:var(--ink-soft)]">Current cycle day</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                    {initialData.cycles.currentCycleDay ?? "Unknown"}
                  </p>
                </div>
                <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
                  <p className="text-sm text-[color:var(--ink-soft)]">Body cue coverage</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
                    {Math.round(initialData.bodySignals.coverage)}%
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {readiness.supportingPoints.map((point) => (
                  <div
                    key={point}
                    className="rounded-[22px] bg-[color:var(--paper-muted)] p-4 text-sm leading-6 text-[color:var(--foreground)] [box-shadow:var(--shadow-inset)]"
                  >
                    {point}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" onClick={() => setAnalysisTriggered(true)}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Run monthly AI analysis
                </Button>
                <Link href="/calendar?view=cycle" className={actionLinkClass}>
                  Open cycle timeline
                </Link>
              </div>
            </CardContent>
          </Card>

          <MotivationWidget
            streakData={{
              current: gamificationStats.currentStreak,
              best: gamificationStats.bestStreak,
              totalLogs: gamificationStats.totalLogs,
            }}
            achievements={gamificationStats.achievements}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {insightCards.map((card) => (
          <Card key={card.label} variant="panel">
            <CardContent className="space-y-3 pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--ink-soft)]">
                {card.label}
              </p>
              <p className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)]">
                {card.value}
              </p>
              <p className="text-sm leading-6 text-[color:var(--ink-soft)]">{card.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {analysisTriggered ? (
        <>
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <AIStreamingCard
              title="Pattern insights"
              analysisType="pattern_detection"
              icon={<TrendingUp className="h-5 w-5" />}
              color="teal"
              aggregatedData={initialData}
            />
            <AIStreamingCard
              title="Wellness coaching"
              analysisType="health_coaching"
              icon={<Zap className="h-5 w-5" />}
              color="purple"
              aggregatedData={initialData}
            />
            {profile.emotionalSupportLevel !== "minimal" ? (
              <AIStreamingCard
                title="Emotional support"
                analysisType="emotional_support"
                icon={<Heart className="h-5 w-5" />}
                color="rose"
                aggregatedData={initialData}
              />
            ) : null}
          </div>

          <AIQuestionCard
            monthLabel={monthContext.monthLabel}
            monthParam={monthContext.monthParam}
          />
        </>
      ) : (
        <Card variant="panel">
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
                What unlocks next
              </p>
              <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)]">
                Run the analysis to open focused insight blocks
              </h3>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-4 text-sm leading-6 text-[color:var(--foreground)] [box-shadow:var(--shadow-inset)]">
                Pattern insights look for timing shifts, clusters, and phase-level rhythm.
              </div>
              <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-4 text-sm leading-6 text-[color:var(--foreground)] [box-shadow:var(--shadow-inset)]">
                Wellness coaching turns the strongest signals into conservative next steps.
              </div>
              <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-4 text-sm leading-6 text-[color:var(--foreground)] [box-shadow:var(--shadow-inset)]">
                The question box opens after analysis so follow-ups stay tied to the same month.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card variant="panel" className="border-amber-200/80 bg-amber-50/80">
        <CardContent className="space-y-2 pt-6 text-sm leading-6 text-amber-950">
          <p className="font-medium">Important notice</p>
          <p className="text-amber-900/85">
            These AI insights support reflection and tracking. They are not medical advice, not diagnosis, and not birth control.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
