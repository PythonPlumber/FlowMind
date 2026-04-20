import { dbConnect } from "@/lib/db";
import { getAIEnv } from "@/lib/env";
import { AIRateLimit } from "@/models/AIRateLimit";
import type { RateLimitInfo } from "@/types/ai";

type RateLimitAction = "ai_analysis" | "ai_chat";

function getRateLimits() {
  const env = getAIEnv();
  return {
    ai_analysis: env.AI_RATE_LIMIT_PER_USER_PER_HOUR,
    ai_chat: env.AI_CHAT_RATE_LIMIT_PER_USER_PER_HOUR,
  } as const;
}

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 11000
  );
}

export function getCurrentRateLimitWindow(now = new Date()) {
  const windowStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      now.getUTCHours(),
      0,
      0,
      0
    )
  );

  return {
    windowStart,
    resetAt: new Date(windowStart.getTime() + 60 * 60 * 1000),
  };
}

function buildRateLimitError(action: RateLimitAction, limit: number, resetAt: Date) {
  const minutesUntilReset = Math.ceil((resetAt.getTime() - Date.now()) / (1000 * 60));
  return new Error(
    `Rate limit exceeded. You can make ${limit} ${action.replace("_", " ")} requests per hour. Please try again in ${minutesUntilReset} minute${minutesUntilReset === 1 ? "" : "s"}.`
  );
}

export async function checkRateLimit(
  userId: string,
  action: RateLimitAction
): Promise<RateLimitInfo> {
  await dbConnect();
  const limit = getRateLimits()[action];
  const { windowStart, resetAt } = getCurrentRateLimitWindow();
  const entry = await AIRateLimit.findOne({ userId, action, windowStart }).lean();
  const count = entry?.count ?? 0;

  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count),
    resetAt: entry?.resetAt ?? resetAt,
  };
}

export async function enforceRateLimit(
  userId: string,
  action: RateLimitAction
): Promise<void> {
  await dbConnect();
  const limits = getRateLimits();
  const limit = limits[action];
  const { windowStart, resetAt } = getCurrentRateLimitWindow();

  try {
    const updated = await AIRateLimit.findOneAndUpdate(
      {
        userId,
        action,
        windowStart,
        count: { $lt: limit },
      },
      {
        $setOnInsert: {
          userId,
          action,
          windowStart,
          resetAt,
          count: 0,
        },
        $inc: { count: 1 },
      },
      {
        upsert: true,
        new: true,
      }
    );

    if (updated) {
      return;
    }
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }
  }

  const existing = await AIRateLimit.findOne({ userId, action, windowStart }).lean();
  if (existing?.count && existing.count >= limit) {
    throw buildRateLimitError(action, limit, existing.resetAt);
  }

  const retried = await AIRateLimit.findOneAndUpdate(
    {
      userId,
      action,
      windowStart,
      count: { $lt: limit },
    },
    { $inc: { count: 1 } },
    { new: true }
  ).lean();

  if (!retried) {
    throw buildRateLimitError(action, limit, existing?.resetAt ?? resetAt);
  }
}
