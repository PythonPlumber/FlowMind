import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/guards";
import { dbConnect } from "@/lib/db";
import { DailyLog } from "@/models/DailyLog";
import { Profile } from "@/models/Profile";
import { enforceRateLimit } from "@/lib/ai/rate-limiter";
import { callNvidiaAI } from "@/lib/ai/nvidia-api";
import { SYMPTOM_SUGGESTION_PROMPT, buildSymptomSuggestionPrompt } from "@/lib/ai/prompt-templates";
import { sanitizeNotesForAI } from "@/lib/ai/data-aggregation";
import type { AIResponse } from "@/types/ai";

export async function GET() {
  try {
    await dbConnect();
    const userId = await requireUserId();

    // Check rate limit
    try {
      await enforceRateLimit(userId, "ai_analysis");
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Fetch recent notes (last 30 logs with notes)
    const recentLogs = await DailyLog.find({
      userId,
      notes: { $exists: true, $ne: "" },
    })
      .sort({ logDate: -1 })
      .limit(30)
      .select("notes")
      .lean();

    if (recentLogs.length < 5) {
      return NextResponse.json({
        suggestions: [],
        message: "Not enough notes to analyze. Keep logging to get personalized suggestions!",
      });
    }

    // Get user's privacy mode
    const profile = await Profile.findOne({ userId });
    const privacyMode = profile?.aiPreferences?.privacyMode || "full_analysis";

    if (privacyMode === "patterns_only") {
      return NextResponse.json({
        suggestions: [],
        message: "Symptom suggestions are disabled in privacy mode.",
      });
    }

    // Sanitize notes
    const notes = sanitizeNotesForAI(recentLogs.map((log) => log.notes || ""));

    // Build prompt
    const prompt = buildSymptomSuggestionPrompt(notes);

    // Call AI (non-streaming)
    const response = await callNvidiaAI({
      systemPrompt: SYMPTOM_SUGGESTION_PROMPT,
      prompt,
      stream: false,
      maxTokens: 512,
    });

    if (response instanceof ReadableStream) {
      return NextResponse.json(
        { error: "Unexpected streaming response" },
        { status: 500 }
      );
    }

    const aiResponse = response as AIResponse;

    // Parse JSON response
    let suggestions: string[] = [];
    try {
      // Try to extract JSON array from response (using dotAll via RegExp constructor)
      const jsonMatch = aiResponse.content.match(new RegExp("\\[.*\\]", "s"));
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("Error parsing symptom suggestions:", e);
      // Fallback: split by newlines or commas
      suggestions = aiResponse.content
        .split(/[\n,]/)
        .map((s) => s.trim().replace(/^["'\-\d.\s]+/, ""))
        .filter((s) => s.length > 0 && s.length < 50)
        .slice(0, 5);
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error in symptom suggestions:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
