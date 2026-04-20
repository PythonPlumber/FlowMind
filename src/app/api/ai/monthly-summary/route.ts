import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { addDays } from "date-fns";
import { requireUserId } from "@/lib/guards";
import { dbConnect } from "@/lib/db";
import { AIAnalysisCache } from "@/models/AIAnalysisCache";
import { enforceRateLimit } from "@/lib/ai/rate-limiter";
import { resolveAnalyticsMonth } from "@/lib/ai/monthly-analytics";
import { callNvidiaAI } from "@/lib/ai/nvidia-api";
import { MONTHLY_SUMMARY_PROMPT, buildMonthlySummaryPrompt } from "@/lib/ai/prompt-templates";
import { aggregateUserDataForAI } from "@/lib/ai/data-aggregation";
import { getAIEnv } from "@/lib/env";
import type { AIResponse } from "@/types/ai";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const userId = await requireUserId();

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const monthParam = searchParams.get("month") || "current";

    const env = getAIEnv();
    const dateRange = resolveAnalyticsMonth(monthParam).monthParam
      ? (() => {
          const month = resolveAnalyticsMonth(monthParam);
          return { from: month.from, to: month.to };
        })()
      : null;
    if (!dateRange) {
      return NextResponse.json({ error: "Invalid month parameter" }, { status: 400 });
    }

    // Check rate limit
    try {
      await enforceRateLimit(userId, "ai_analysis");
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Aggregate user data for the month
    const data = await aggregateUserDataForAI(userId, dateRange);

    // Check cache
    const dataHash = createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");

    const cached = await AIAnalysisCache.findOne({
      userId,
      analysisType: "monthly_summary",
      dataHash,
      createdAt: { $gte: dateRange.from },
    });

    if (cached) {
      return NextResponse.json({
        summary: cached.response,
        cached: true,
        cacheAge: cached.createdAt.toISOString(),
      });
    }

    // Call AI (non-streaming for quick summary)
    const response = await callNvidiaAI({
      systemPrompt: MONTHLY_SUMMARY_PROMPT,
      prompt: buildMonthlySummaryPrompt(data),
      stream: false,
      maxTokens: 512, // Short summary
    });

    if (response instanceof ReadableStream) {
      return NextResponse.json(
        { error: "Unexpected streaming response" },
        { status: 500 }
      );
    }

    const aiResponse = response as AIResponse;

    // Save to cache
    await AIAnalysisCache.create({
      userId,
      analysisType: "monthly_summary",
      dataHash,
      response: aiResponse.content,
      metadata: {
        cyclesAnalyzed: data.cycles.count,
        dateRange,
      },
      expiresAt: addDays(new Date(), env.AI_CACHE_TTL_DAYS),
    });

    return NextResponse.json({ summary: aiResponse.content });
  } catch (error) {
    console.error("Error in monthly summary:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
