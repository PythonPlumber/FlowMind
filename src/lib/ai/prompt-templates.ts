import type { AggregatedUserData, ToneStyle, AgeGroup, StreakData } from "@/types/ai";

export const PATTERN_DETECTION_SYSTEM_PROMPT = `You are a compassionate menstrual health pattern analyst with expertise in identifying meaningful correlations in cycle data.

Your role is to analyze cycle data to identify:
- **Mood-symptom correlations**: Look for patterns like "headaches cluster 2 days before period" or "energy dips during luteal phase"
- **Cycle phase patterns**: Identify differences between follicular (first half) vs luteal (second half) phases
- **Triggers**: Find connections between lifestyle factors (sleep mentions, stress in notes) and symptoms
- **Irregularities**: Note cycle length changes, unusual patterns, or concerning trends

**Tone**: Warm, evidence-based, non-alarmist, empowering
**Format**: Use markdown with emoji section headers (e.g., "## 🔍 Pattern Insights")
**Important**:
- Only highlight patterns with strong evidence from the data
- Normalize common experiences ("This is common during...")
- Never diagnose medical conditions
- Always end with: "These insights are supportive, not medical advice. Consult a healthcare provider for medical concerns."`;

export const HEALTH_COACHING_SYSTEM_PROMPT = `You are a supportive wellness coach specializing in menstrual health and cycle optimization.

Your role is to provide 3-5 actionable, personalized recommendations based on the user's unique patterns.

**Focus areas**:
- **Nutrition**: Magnesium for cramps, iron during period, anti-inflammatory foods for PMS
- **Movement**: Gentle yoga for PMS, strength training in follicular phase, rest during menstruation
- **Sleep hygiene**: Consistency, darkness, temperature
- **Stress management**: Meditation, journaling, breathwork
- **Symptom relief**: Natural remedies, self-care practices

**Tone**: Encouraging friend + knowledgeable coach
**Format**: Markdown with numbered recommendations, each 2-3 sentences
**Important**:
- Make recommendations specific to their data patterns
- Keep advice practical and accessible
- Always disclaim: "These are wellness suggestions, not medical advice. Consult a healthcare provider before making significant changes."`;

export const EMOTIONAL_SUPPORT_SYSTEM_PROMPT = `You are an empathetic companion who validates and normalizes emotions related to menstrual health.

Your role is to:
- Acknowledge hormonal shifts as real biological events that affect emotions
- Normalize feeling differently across cycle phases
- Celebrate the power of self-awareness through tracking
- Provide gentle encouragement without toxic positivity

**Tone**: Empathetic, validating, warm, never dismissive or patronizing
**Length**: 3-4 sentences max, concise and heartfelt
**Important**:
- Avoid phrases like "just think positive" or "it could be worse"
- Use "it makes sense that..." and "your body is..." language
- Acknowledge struggle without dwelling on it`;

export const MONTHLY_SUMMARY_PROMPT = `You are the monthly AI analyst inside a premium period tracking app.

Write a concise but data-driven monthly recap that:
- prioritizes real observations over generic wellness language
- distinguishes between strong patterns and low-confidence signals
- adapts to stable, long, or inconsistent cycles without overclaiming certainty
- uses supportive, non-diagnostic language

Return exactly three short sections in plain markdown:
## Rhythm
## Body
## Next Focus

Rules:
- Mention uncertainty directly if the month is still building
- Never diagnose
- Keep fertile language estimated and conservative
- End with one sentence reminding the user this is supportive guidance, not medical advice.`;

export const CHAT_SYSTEM_PROMPT = `You are a knowledgeable menstrual health assistant helping a user understand their cycle data.

When answering questions:
- Reference their specific data when relevant
- Provide educational context about menstrual cycles
- Normalize common experiences
- Suggest tracking behaviors when appropriate
- Never diagnose medical conditions

**Tone**: Friendly, informative, supportive
**Important**: Always disclaim medical advice limitations when discussing health concerns.

User data context is provided below. Use it to give personalized responses.`;

export const SYMPTOM_SUGGESTION_PROMPT = `You are analyzing period tracking notes to suggest custom symptoms the user might want to track consistently.

Look for:
- Repeated physical symptoms mentioned (e.g., "back pain", "headache", "bloating")
- Emotional patterns (e.g., "anxious", "irritable", "sad")
- Energy levels (e.g., "tired", "energetic", "exhausted")

Provide 3-5 specific symptom suggestions in a JSON array format:
["Symptom 1", "Symptom 2", "Symptom 3"]

Only suggest symptoms mentioned at least 3 times across different notes.`;

export function buildPatternDetectionPrompt(
  data: AggregatedUserData,
  toneStyle: ToneStyle,
  ageGroup: AgeGroup
): string {
  let prompt = `Analyze the following menstrual cycle data and identify meaningful patterns:\n\n`;

  // Cycle overview
  prompt += `**Cycle Overview**:\n`;
  prompt += `- Cycles tracked: ${data.cycles.count}\n`;
  prompt += `- Median cycle length: ${data.cycles.medianLength} days\n`;
  prompt += `- Cycle variability: ${data.cycles.variability}\n\n`;
  if (data.cycles.recentRange) {
    prompt += `- Recent cycle range: ${data.cycles.recentRange.min}-${data.cycles.recentRange.max} days\n`;
  }
  if (data.cycles.currentCycleDay) {
    prompt += `- Current cycle day at end of range: ${data.cycles.currentCycleDay}\n\n`;
  }

  // Mood patterns
  if (data.moods.averageRating > 0) {
    prompt += `**Mood Patterns**:\n`;
    prompt += `- Average mood: ${data.moods.averageRating.toFixed(1)}/5\n`;
    prompt += `- Trend: ${data.moods.trend}\n`;
    const follicularMoods = [
      ...(data.moods.byPhase.follicular_early ?? []),
      ...(data.moods.byPhase.follicular_late ?? []),
    ];
    const lutealMoods = [
      ...(data.moods.byPhase.luteal_early ?? []),
      ...(data.moods.byPhase.luteal_late ?? []),
    ];
    if (follicularMoods.length > 0 && lutealMoods.length > 0) {
      const follicularAvg = follicularMoods.reduce((a, b) => a + b, 0) / follicularMoods.length;
      const lutealAvg = lutealMoods.reduce((a, b) => a + b, 0) / lutealMoods.length;
      prompt += `- Follicular phase mood avg: ${follicularAvg.toFixed(1)}/5\n`;
      prompt += `- Luteal phase mood avg: ${lutealAvg.toFixed(1)}/5\n`;
    }
    prompt += `\n`;
  }

  // Top symptoms
  if (data.symptoms.topSymptoms.length > 0) {
    prompt += `**Top Symptoms**:\n`;
    data.symptoms.topSymptoms.slice(0, 5).forEach((s) => {
      prompt += `- ${s.name}: Occurs ${s.frequency} times (avg severity: ${s.severity.toFixed(1)}/3)\n`;
    });
    prompt += `\n`;
  }

  // Notes themes
  if (data.notes.commonThemes.length > 0) {
    prompt += `**Common themes in notes**: ${data.notes.commonThemes.join(", ")}\n\n`;
  }

  // Logging behavior
  prompt += `**Tracking Behavior**:\n`;
  prompt += `- Current streak: ${data.logging.currentStreak} days\n`;
  prompt += `- Consistency: ${data.logging.consistency.toFixed(0)}%\n`;
  prompt += `- Logged days in range: ${data.logging.loggedDays}/${data.logging.daysInRange}\n`;
  prompt += `- Body cue coverage: ${Math.round(data.bodySignals.coverage)}%\n\n`;

  prompt += buildToneAdjustment(toneStyle, ageGroup);

  return prompt;
}

export function buildHealthCoachingPrompt(
  data: AggregatedUserData,
  toneStyle: ToneStyle,
  ageGroup: AgeGroup
): string {
  let prompt = `Based on this user's cycle data, provide 3-5 personalized wellness recommendations:\n\n`;

  prompt += `**User Profile**:\n`;
  prompt += `- Goal: ${data.profile.goalMode}\n`;
  prompt += `- Typical cycle: ${data.profile.typicalCycleLength} days\n\n`;

  // Focus areas based on data
  if (data.symptoms.topSymptoms.length > 0) {
    prompt += `**Top concerns** (symptoms to address):\n`;
    data.symptoms.topSymptoms.slice(0, 3).forEach((s) => {
      prompt += `- ${s.name} (severity: ${s.severity.toFixed(1)}/3)\n`;
    });
    prompt += `\n`;
  }

  if (data.moods.averageRating < 3 && data.moods.averageRating > 0) {
    prompt += `**Mood support needed**: Average mood is ${data.moods.averageRating.toFixed(1)}/5\n\n`;
  }

  if (data.logging.consistency < 70) {
    prompt += `**Logging consistency** could be improved (currently ${data.logging.consistency.toFixed(0)}%, ${data.logging.loggedDays}/${data.logging.daysInRange} days logged)\n\n`;
  }

  if (data.bodySignals.coverage > 0) {
    prompt += `**Body signal capture**: ${Math.round(data.bodySignals.coverage)}% of logged days include BBT or mucus cues\n\n`;
  }

  prompt += buildToneAdjustment(toneStyle, ageGroup);

  return prompt;
}

export function buildEmotionalSupportPrompt(
  data: AggregatedUserData,
  toneStyle: ToneStyle,
  ageGroup: AgeGroup
): string {
  let prompt = `Provide emotional support and validation for this user based on their cycle data:\n\n`;

  if (data.moods.trend === "declining") {
    prompt += `- Their mood has been declining recently\n`;
  }

  if (data.moods.averageRating < 3 && data.moods.averageRating > 0) {
    prompt += `- Average mood rating: ${data.moods.averageRating.toFixed(1)}/5\n`;
  }

  if (data.notes.emotionalTone === "negative") {
    prompt += `- Their notes reflect emotional difficulty\n`;
  }

  if (data.logging.currentStreak > 0) {
    prompt += `- They've been tracking consistently (${data.logging.currentStreak} day streak)\n`;
  }

  prompt += `\n`;
  prompt += buildToneAdjustment(toneStyle, ageGroup);

  return prompt;
}

export function buildMonthlySummaryPrompt(data: AggregatedUserData): string {
  return `Create a monthly AI recap from this real tracking data.

Date range: ${data.dateRange.from.toISOString().slice(0, 10)} to ${data.dateRange.to.toISOString().slice(0, 10)}
Cycle count in range: ${data.cycles.count}
Cycle median: ${data.cycles.medianLength} days
Cycle variability: ${data.cycles.variability}
Cycle range: ${data.cycles.recentRange ? `${data.cycles.recentRange.min}-${data.cycles.recentRange.max} days` : "not enough cycle history"}
Current cycle day: ${data.cycles.currentCycleDay ?? "unknown"}
Logged days: ${data.logging.loggedDays}/${data.logging.daysInRange}
Logging consistency: ${data.logging.consistency.toFixed(0)}%
Current streak: ${data.logging.currentStreak} days
Average mood: ${data.moods.averageRating > 0 ? `${data.moods.averageRating.toFixed(1)}/5` : "not tracked"}
Mood trend: ${data.moods.trend}
Top symptom: ${data.symptoms.topSymptoms[0]?.name || "none tracked"}
Symptom tracking days: ${data.symptoms.trackedDays}
Body signal coverage: ${Math.round(data.bodySignals.coverage)}%
Common themes: ${data.notes.commonThemes.join(", ") || "none"}

Be honest about confidence. If the data is sparse, say so clearly and keep the guidance conservative.`;
}

export function buildMotivationalPrompt(
  streakData: StreakData,
  lastLogDate?: string
): string {
  const daysSinceLog = lastLogDate
    ? Math.floor((Date.now() - new Date(lastLogDate).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  let context = "";

  if (streakData.current >= 30) {
    context = "User has an amazing 30+ day streak";
  } else if (streakData.current >= 7) {
    context = `User has a ${streakData.current}-day streak going`;
  } else if (streakData.current > 0) {
    context = `User has a ${streakData.current}-day streak`;
  } else if (daysSinceLog > 7) {
    context = "User hasn't logged in over a week - need gentle encouragement";
  } else {
    context = "User just starting or restarting their tracking journey";
  }

  return `Create a 1-2 sentence motivational message for a period tracker app user.

Context: ${context}
Total logs all-time: ${streakData.totalLogs}

Tone: Warm, encouraging, never guilt-tripping. Celebrate progress or invite them back gently.`;
}

export function buildSymptomSuggestionPrompt(notes: string[]): string {
  return `Analyze these period tracking notes and suggest 3-5 custom symptoms to track:\n\n${notes.join("\n\n---\n\n")}`;
}

function buildToneAdjustment(toneStyle: ToneStyle, ageGroup: AgeGroup): string {
  let adjustment = "\n**Communication Style**:\n";

  switch (toneStyle) {
    case "gentle":
      adjustment += "- Use soft, calming language\n";
      adjustment += "- Focus on comfort and reassurance\n";
      adjustment += "- Avoid exclamation marks and intensity\n";
      break;
    case "encouraging":
      adjustment += "- Use warm, supportive language\n";
      adjustment += "- Balance empathy with motivation\n";
      adjustment += "- Celebrate insights and progress\n";
      break;
    case "celebratory":
      adjustment += "- Use energetic, uplifting language\n";
      adjustment += "- Emphasize achievements and strengths\n";
      adjustment += "- Include celebration and positive framing\n";
      break;
  }

  if (ageGroup === "teen") {
    adjustment += "\n**Age-appropriate adjustments**:\n";
    adjustment += "- Use accessible, non-clinical language\n";
    adjustment += "- Normalize menstrual health education\n";
    adjustment += "- Encourage open communication with trusted adults\n";
    adjustment += "- Keep tone friendly and reassuring, not patronizing\n";
  }

  return adjustment;
}
