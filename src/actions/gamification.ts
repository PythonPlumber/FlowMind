"use server";

import { checkAndAwardAchievements } from "@/lib/achievements";
import { calculateStreakMetrics } from "@/lib/gamification/streaks";
import { DailyLog } from "@/models/DailyLog";
import { Profile } from "@/models/Profile";

export async function updateLoggingStreak(
  userId: string,
  _logDate: Date,
  options?: {
    isNewLog?: boolean;
  }
): Promise<{
  newStreak: number;
  newBestStreak: number;
  newAchievements: string[];
  motivationalMessage?: string;
}> {
  const profile = await Profile.findOne({ userId });

  if (!profile) {
    throw new Error("Profile not found");
  }

  const logs = await DailyLog.find({ userId }).select({ logDate: 1 }).lean();
  const metrics = calculateStreakMetrics(logs.map((log) => new Date(log.logDate)));

  await Profile.updateOne(
    { userId },
    {
      $set: {
        "gamification.currentStreak": metrics.currentStreak,
        "gamification.bestStreak": metrics.bestStreak,
        "gamification.totalLogs": metrics.totalLogs,
      },
    }
  );

  const newAchievements = await checkAndAwardAchievements(userId);

  if (newAchievements.length > 0) {
    await Profile.updateOne(
      { userId },
      {
        $addToSet: {
          "gamification.achievements": { $each: newAchievements },
        },
      }
    );
  }

  const motivationalMessage = generateMotivationalMessage(
    metrics.currentStreak,
    newAchievements,
    options?.isNewLog ?? true
  );

  return {
    newStreak: metrics.currentStreak,
    newBestStreak: metrics.bestStreak,
    newAchievements,
    motivationalMessage,
  };
}

export async function getGamificationStats(userId: string) {
  const profile = await Profile.findOne({ userId });

  if (!profile) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      totalLogs: 0,
      achievements: [],
    };
  }

  return {
    currentStreak: profile.gamification?.currentStreak || 0,
    bestStreak: profile.gamification?.bestStreak || 0,
    totalLogs: profile.gamification?.totalLogs || 0,
    achievements: profile.gamification?.achievements || [],
  };
}

export async function checkStreakIntegrity(userId: string): Promise<void> {
  const profile = await Profile.findOne({ userId });
  if (!profile) return;

  const logs = await DailyLog.find({ userId }).select({ logDate: 1 }).lean();
  const metrics = calculateStreakMetrics(logs.map((log) => new Date(log.logDate)));

  if (
    metrics.currentStreak !== (profile.gamification?.currentStreak || 0) ||
    metrics.bestStreak !== (profile.gamification?.bestStreak || 0) ||
    metrics.totalLogs !== (profile.gamification?.totalLogs || 0)
  ) {
    await Profile.updateOne(
      { userId },
      {
        $set: {
          "gamification.currentStreak": metrics.currentStreak,
          "gamification.bestStreak": metrics.bestStreak,
          "gamification.totalLogs": metrics.totalLogs,
        },
      }
    );
  }
}

function generateMotivationalMessage(
  streak: number,
  newAchievements: string[],
  isNewLog: boolean
): string | undefined {
  if (newAchievements.length > 0) {
    return "Achievement unlocked! Keep up the great tracking!";
  }

  if (!isNewLog) {
    return undefined;
  }

  if (streak === 1) {
    return "Great start! Every journey begins with a single step.";
  }

  if (streak === 7) {
    return "One week strong! Your future self thanks you.";
  }

  if (streak === 14) {
    return "Two weeks! Patterns are starting to emerge.";
  }

  if (streak === 30) {
    return "30 days! You're building powerful self-knowledge.";
  }

  if (streak % 10 === 0) {
    return `${streak} days tracked! Consistency is your superpower.`;
  }

  return undefined;
}
