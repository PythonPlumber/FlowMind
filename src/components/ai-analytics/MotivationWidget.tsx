"use client";

import { Flame, Star, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Achievement, StreakData } from "@/types/ai";

const ACHIEVEMENTS: Record<string, Achievement> = {
  first_log: {
    id: "first_log",
    label: "First Step",
    emoji: "01",
    description: "Logged your first day of tracking",
  },
  week_warrior: {
    id: "week_warrior",
    label: "Week Warrior",
    emoji: "07",
    description: "Maintained a 7-day logging streak",
  },
  two_week_streak: {
    id: "two_week_streak",
    label: "Two Week Champion",
    emoji: "14",
    description: "Maintained a 14-day logging streak",
  },
  month_champion: {
    id: "month_champion",
    label: "Month Champion",
    emoji: "30",
    description: "Maintained a 30-day logging streak",
  },
  pattern_finder: {
    id: "pattern_finder",
    label: "Pattern Finder",
    emoji: "3C",
    description: "Logged data for 3 complete cycles",
  },
  body_scientist: {
    id: "body_scientist",
    label: "Body Scientist",
    emoji: "BBT",
    description: "Logged BBT 10 or more times",
  },
  mood_tracker: {
    id: "mood_tracker",
    label: "Mood Master",
    emoji: "MOOD",
    description: "Logged mood 20 or more times",
  },
  consistency_pro: {
    id: "consistency_pro",
    label: "Consistency Pro",
    emoji: "80",
    description: "Maintained 80%+ logging consistency for a month",
  },
  symptom_detective: {
    id: "symptom_detective",
    label: "Symptom Detective",
    emoji: "SYM",
    description: "Logged 50 symptom entries",
  },
  hundred_club: {
    id: "hundred_club",
    label: "100 Club",
    emoji: "100",
    description: "Logged 100 total days",
  },
};

interface MotivationWidgetProps {
  streakData: StreakData;
  achievements: string[];
}

export default function MotivationWidget({
  streakData,
  achievements,
}: MotivationWidgetProps) {
  const streakPercentage = Math.min(
    100,
    (streakData.current / (streakData.best || streakData.current || 1)) * 100
  );

  const allAchievementsArray = Object.values(ACHIEVEMENTS);
  const unlockedCount = achievements.length;
  const totalCount = allAchievementsArray.length;

  const latestAchievements = achievements
    .slice(-3)
    .reverse()
    .map((id) => ACHIEVEMENTS[id])
    .filter(Boolean);

  return (
    <Card variant="panel">
      <CardContent className="space-y-5 pt-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
              Momentum
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)]">
              Keep the rhythm steady
            </h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--ink-soft)]">
              {getMotivationalMessage(streakData)}
            </p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--paper-muted)] text-[color:var(--brand-strong)] [box-shadow:var(--shadow-inset)]">
            <Trophy className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-3 rounded-[24px] bg-[color:var(--paper-muted)] p-4 [box-shadow:var(--shadow-inset)]">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-medium text-[color:var(--foreground)]">Current streak</span>
            </div>
            <span className="text-[color:var(--ink-soft)]">
              {streakData.current} / {streakData.best || streakData.current} days
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/70">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-amber-500 transition-all duration-500 ease-out"
              style={{ width: `${streakPercentage}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-[color:var(--ink-soft)]">
            <span>Best: {streakData.best} days</span>
            <span>Total logs: {streakData.totalLogs}</span>
          </div>
        </div>

        {latestAchievements.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-[color:var(--foreground)]">
                Recent milestones
              </span>
              <Badge variant="muted" className="ml-auto">
                {unlockedCount}/{totalCount}
              </Badge>
            </div>

            <div className="grid gap-3">
              {latestAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 rounded-[22px] bg-[color:var(--paper-muted)] p-3 [box-shadow:var(--shadow-inset)]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--foreground)]">
                    {achievement.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[color:var(--foreground)]">
                      {achievement.label}
                    </p>
                    <p className="truncate text-xs text-[color:var(--ink-soft)]">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {streakData.current === 0 ? (
          <div className="rounded-[22px] border border-white/60 bg-[color:var(--paper-muted)] p-4 text-sm leading-6 text-[color:var(--foreground)]">
            <p className="font-medium">Ready to restart?</p>
            <p className="mt-1 text-[color:var(--ink-soft)]">
              Every day can be a fresh chance to check in with yourself.
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function getMotivationalMessage(streakData: StreakData): string {
  const { current, best } = streakData;

  if (current === 0) {
    return "Start with a single check-in today.";
  }

  if (current >= 30) {
    return `${current} days logged. Your rhythm is very steady.`;
  }

  if (current >= 7) {
    return `${current} days strong. Keep the streak moving.`;
  }

  if (current === best) {
    return `New personal record: ${current} days.`;
  }

  return `${current} day${current !== 1 ? "s" : ""} logged. Good progress.`;
}
