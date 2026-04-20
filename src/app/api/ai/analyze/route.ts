import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { subHours, addDays } from "date-fns";
import { requireUserId } from "@/lib/guards";
import { dbConnect } from "@/lib/db";
import { AIAnalysisCache } from "@/models/AIAnalysisCache";
import { Profile } from "@/models/Profile";
import { enforceRateLimit } from "@/lib/ai/rate-limiter";
import { callNvidiaAI, streamNvidiaResponse } from "@/lib/ai/nvidia-api";
import { getAIEnv } from "@/lib/env";
import {
  PATTERN_DETECTION_SYSTEM_PROMPT,
  HEALTH_COACHING_SYSTEM_PROMPT,
  EMOTIONAL_SUPPORT_SYSTEM_PROMPT,
  buildPatternDetectionPrompt,
  buildHealthCoachingPrompt,
  buildEmotionalSupportPrompt,
} from "@/lib/ai/prompt-templates";
import type { AggregatedUserData, AnalysisType } from "@/types/ai";

export async function POST(req: Request) {
  try {
    const env = getAIEnv();
    await dbConnect();
    const userId = await requireUserId();

    // Parse request body
    const body = await req.json();
    const { analysisType, data } = body as {
      analysisType: AnalysisType;
      data: AggregatedUserData;
    };

    if (!analysisType || !data) {
      return NextResponse.json(
        { error: "Missing analysisType or data" },
        { status: 400 }
      );
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

    // Check cache
    const dataHash = createHash("sha256")
      .update(JSON.stringify(data))
      .digest("hex");

    const cached = await AIAnalysisCache.findOne({
      userId,
      analysisType,
      dataHash,
      createdAt: { $gte: subHours(new Date(), 24) },
    });

    if (cached) {
      return NextResponse.json({
        content: cached.response,
        cached: true,
        cacheAge: cached.createdAt.toISOString(),
      });
    }

    // Fetch user profile for preferences
    const profile = await Profile.findOne({ userId });
    const toneStyle = profile?.aiPreferences?.toneStyle || "encouraging";
    const ageGroup = profile?.ageGroup || null;

    // Build prompts based on analysis type
    let systemPrompt: string;
    let userPrompt: string;

    switch (analysisType) {
      case "pattern_detection":
        systemPrompt = PATTERN_DETECTION_SYSTEM_PROMPT;
        userPrompt = buildPatternDetectionPrompt(data, toneStyle, ageGroup);
        break;
      case "health_coaching":
        systemPrompt = HEALTH_COACHING_SYSTEM_PROMPT;
        userPrompt = buildHealthCoachingPrompt(data, toneStyle, ageGroup);
        break;
      case "emotional_support":
        systemPrompt = EMOTIONAL_SUPPORT_SYSTEM_PROMPT;
        userPrompt = buildEmotionalSupportPrompt(data, toneStyle, ageGroup);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid analysis type" },
          { status: 400 }
        );
    }

    // Call AI with streaming
    const stream = await callNvidiaAI({
      systemPrompt,
      prompt: userPrompt,
      stream: true,
      temperature: 0.7,
      maxTokens: 4096,
    });

    if (!(stream instanceof ReadableStream)) {
      return NextResponse.json(
        { error: "Expected streaming response" },
        { status: 500 }
      );
    }

    let fullResponse = "";
    const [clientStream, cacheStream] = stream.tee();

    // Process the stream and cache it
    const processAndCache = async () => {
      try {
        for await (const content of streamNvidiaResponse(cacheStream)) {
          fullResponse += content;
        }

        // Save to cache when done
        await AIAnalysisCache.create({
          userId,
          analysisType,
          dataHash,
          response: fullResponse,
          metadata: {
            cyclesAnalyzed: data.cycles.count,
            dateRange: {
              from: data.dateRange.from,
              to: data.dateRange.to,
            },
          },
          expiresAt: addDays(new Date(), env.AI_CACHE_TTL_DAYS),
        });

        // Update last AI interaction
        await Profile.updateOne(
          { userId },
          { "aiPreferences.lastAIInteraction": new Date() }
        );
      } catch (error) {
        console.error("Error caching AI response:", error);
      }
    };

    // Start processing in background
    processAndCache();

    // Return streaming response
    return new Response(clientStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in AI analysis:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
