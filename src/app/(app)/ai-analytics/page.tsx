import { getGamificationStats } from "@/actions/gamification";
import AIAnalyticsExperience from "@/components/ai-analytics/AIAnalyticsExperience";
import { aggregateUserDataForAI } from "@/lib/ai/data-aggregation";
import { resolveAnalyticsMonth } from "@/lib/ai/monthly-analytics";
import { requireOnboardedProfile } from "@/lib/guards";

interface PageProps {
  searchParams?: Promise<{
    month?: string;
  }>;
}

export default async function AIAnalyticsPage({ searchParams }: PageProps) {
  const { userId, profile } = await requireOnboardedProfile();
  const params = searchParams ? await searchParams : {};
  const month = resolveAnalyticsMonth(params?.month);

  const [aggregatedData, gamificationStats] = await Promise.all([
    aggregateUserDataForAI(userId, { from: month.from, to: month.to }),
    getGamificationStats(userId),
  ]);

  return (
    <AIAnalyticsExperience
      initialData={aggregatedData}
      gamificationStats={gamificationStats}
      profile={{
        ageGroup: profile.ageGroup || null,
        aiTonePreference: profile.aiPreferences?.toneStyle || "encouraging",
        emotionalSupportLevel: profile.aiPreferences?.emotionalSupportLevel || "full",
      }}
      monthContext={{
        monthLabel: month.monthLabel,
        monthParam: month.monthParam,
        currentHref: "/ai-analytics?month=current",
        previousHref: `/ai-analytics?month=${month.previousMonthParam}`,
        nextHref: month.nextMonthParam ? `/ai-analytics?month=${month.nextMonthParam}` : null,
      }}
    />
  );
}
