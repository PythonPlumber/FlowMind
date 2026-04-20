import { NextResponse } from "next/server";
import { requireUserId } from "@/lib/guards";
import { dbConnect } from "@/lib/db";
import { Profile } from "@/models/Profile";
import { enforceRateLimit } from "@/lib/ai/rate-limiter";
import { resolveAnalyticsMonth } from "@/lib/ai/monthly-analytics";
import { callNvidiaAI } from "@/lib/ai/nvidia-api";
import { CHAT_SYSTEM_PROMPT } from "@/lib/ai/prompt-templates";
import { aggregateUserDataForAI } from "@/lib/ai/data-aggregation";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const userId = await requireUserId();

    // Parse request body
    const body = await req.json();
    const { message, monthParam } = body as {
      message?: string;
      monthParam?: string;
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid message" },
        { status: 400 }
      );
    }

    // Check rate limit (higher for chat)
    try {
      await enforceRateLimit(userId, "ai_chat");
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Fetch user data context for the selected analytics month.
    const month = resolveAnalyticsMonth(monthParam);
    const userData = await aggregateUserDataForAI(userId, {
      from: month.from,
      to: month.to,
    });

    // Build chat prompt with user data context
    const systemPrompt = `${CHAT_SYSTEM_PROMPT}

User data context (${month.monthLabel}):
\`\`\`json
${JSON.stringify(userData, null, 2)}
\`\`\``;

    // Call AI
    const response = await callNvidiaAI({
      systemPrompt,
      prompt: message,
      stream: true,
      temperature: 0.8, // Slightly higher for conversational feel
    });

    if (!(response instanceof ReadableStream)) {
      return NextResponse.json(
        { error: "Expected streaming response" },
        { status: 500 }
      );
    }

    // Update last AI interaction
    await Profile.updateOne(
      { userId },
      { "aiPreferences.lastAIInteraction": new Date() }
    );

    return new Response(response, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in AI chat:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
