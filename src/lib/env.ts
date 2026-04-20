import { z } from "zod";

const serverEnvSchema = z.object({
  MONGODB_URI: z.string().min(1, "Missing MONGODB_URI"),
  NEXTAUTH_SECRET: z.string().min(1, "Missing NEXTAUTH_SECRET"),
  NEXTAUTH_URL: z.string().optional(),
});

const aiEnvSchema = z.object({
  NVIDIA_API_KEY: z.string().min(1, "Missing NVIDIA_API_KEY"),
  NVIDIA_API_URL: z.string().url("Invalid NVIDIA_API_URL"),
  NVIDIA_MODEL: z.string().min(1, "Missing NVIDIA_MODEL"),
  AI_MAX_TOKENS: z.coerce.number().int().positive().default(16384),
  AI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.7),
  AI_TOP_P: z.coerce.number().min(0).max(1).default(1),
  AI_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(45000),
  AI_RATE_LIMIT_PER_USER_PER_HOUR: z.coerce.number().int().positive().default(10),
  AI_CHAT_RATE_LIMIT_PER_USER_PER_HOUR: z.coerce.number().int().positive().default(20),
  AI_CACHE_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

export function getServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`).join("\n");
    throw new Error(`Invalid environment variables:\n${message}`);
  }

  return parsed.data;
}

export function getAIEnv() {
  const parsed = aiEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => `${issue.path.join(".") || "env"}: ${issue.message}`).join("\n");
    throw new Error(`Invalid AI environment variables:\n${message}`);
  }

  return parsed.data;
}
