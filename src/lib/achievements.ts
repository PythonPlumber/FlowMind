import type { Achievement } from "@/types/ai";

export const ACHIEVEMENTS: Record<string, Achievement> = {
  first_log: {
    id: "first_log",
    label: "First Step",
    emoji: "🌱",
    description: "Logged your first day of tracking",
  },
  week_warrior: {
    id: "week_warrior",
    label: "Week Warrior",
    emoji: "⭐",
    description: "Maintained a 7-day logging streak",
  },
  two_week_streak: {
    id: "two_week_streak",
    label: "Two Week Champion",
    emoji: "🔥",
    description: "Maintained a 14-day logging streak",
  },
  month_champion: {
    id: "month_champion",
    label: "Month Champion",
    emoji: "🏆",
    description: "Maintained a 30-day logging streak",
  },
  pattern_finder: {
    id: "pattern_finder",
    label: "Pattern Finder",
    emoji: "🔍",
    description: "Logged data for 3 complete cycles",
  },
  body_scientist: {
    id: "body_scientist",
    label: "Body Scientist",
    emoji: "🌡️",
    description: "Logged BBT 10 or more times",
  },
  mood_tracker: {
    id: "mood_tracker",
    label: "Mood Master",
    emoji: "💜",
    description: "Logged mood 20 or more times",
  },
  consistency_pro: {
    id: "consistency_pro",
    label: "Consistency Pro",
    emoji: "✨",
    description: "Maintained 80%+ logging consistency for a month",
  },
  symptom_detective: {
    id: "symptom_detective",
    label: "Symptom Detective",
    emoji: "🕵️",
    description: "Logged 50 symptom entries",
  },
  hundred_club: {
    id: "hundred_club",
    label: "100 Club",
    emoji: "💯",
    description: "Logged 100 total days",
  },
};

export async function checkAndAwardAchievements(
  userId: string
): Promise<string[]> {
  // Import models only in server context
  const { Profile } = await import("@/models/Profile");
  const { DailyLog } = await import("@/models/DailyLog");
  const { DailyLogSymptom } = await import("@/models/DailyLogSymptom");
  const { Period } = await import("@/models/Period");

  const profile = await Profile.findOne({ userId });
  if (!profile) return [];

  const currentAchievements = profile.gamification?.achievements || [];
  const newAchievements: string[] = [];

  const stats = {
    currentStreak: profile.gamification?.currentStreak || 0,
    totalLogs: profile.gamification?.totalLogs || 0,
  };

  // Count specific log types
  const allLogs = await DailyLog.find({ userId });
  const moodLogs = allLogs.filter((log) => log.mood !== undefined).length;
  const bbtLogs = allLogs.filter((log) => log.bbt !== undefined).length;

  // Count symptom entries
  const symptomCount = await DailyLogSymptom.countDocuments({ userId });

  // Count cycles (simplified - count periods)
  const cycleCount = await Period.countDocuments({ userId });

  // Calculate monthly consistency (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentLogs = await DailyLog.countDocuments({
    userId,
    logDate: { $gte: thirtyDaysAgo },
  });
  const consistency = (recentLogs / 30) * 100;

  // Check each achievement
  const checks: Array<{ id: string; condition: boolean }> = [
    { id: "first_log", condition: stats.totalLogs >= 1 },
    { id: "week_warrior", condition: stats.currentStreak >= 7 },
    { id: "two_week_streak", condition: stats.currentStreak >= 14 },
    { id: "month_champion", condition: stats.currentStreak >= 30 },
    { id: "pattern_finder", condition: cycleCount >= 3 },
    { id: "body_scientist", condition: bbtLogs >= 10 },
    { id: "mood_tracker", condition: moodLogs >= 20 },
    { id: "consistency_pro", condition: consistency >= 80 },
    { id: "symptom_detective", condition: symptomCount >= 50 },
    { id: "hundred_club", condition: stats.totalLogs >= 100 },
  ];

  for (const check of checks) {
    if (check.condition && !currentAchievements.includes(check.id)) {
      newAchievements.push(check.id);
    }
  }

  return newAchievements;
}

export function getAchievementDetails(achievementId: string): Achievement | null {
  return ACHIEVEMENTS[achievementId] || null;
}

export function getAllAchievements(): Achievement[] {
  return Object.values(ACHIEVEMENTS);
}
