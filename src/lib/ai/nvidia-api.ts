import { getAIEnv } from "@/lib/env";
import type { AIResponse } from "@/types/ai";

interface NvidiaAPIOptions {
  prompt: string;
  systemPrompt: string;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

interface NvidiaAPIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface NvidiaAPIRequest {
  model: string;
  messages: NvidiaAPIMessage[];
  temperature: number;
  top_p: number;
  max_tokens: number;
  stream: boolean;
}

interface NvidiaAPIResponseChoice {
  message: {
    content: string;
  };
  finish_reason: string;
}

interface NvidiaAPIResponseData {
  choices: NvidiaAPIResponseChoice[];
}

export class NvidiaAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "NvidiaAPIError";
  }
}

export async function callNvidiaAI({
  prompt,
  systemPrompt,
  stream = false,
  temperature,
  maxTokens,
}: NvidiaAPIOptions): Promise<AIResponse | ReadableStream<Uint8Array>> {
  const env = getAIEnv();

  const requestBody: NvidiaAPIRequest = {
    model: env.NVIDIA_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    temperature: temperature ?? env.AI_TEMPERATURE,
    top_p: env.AI_TOP_P,
    max_tokens: maxTokens ?? env.AI_MAX_TOKENS,
    stream,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.AI_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(env.NVIDIA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.NVIDIA_API_KEY}`,
        Accept: stream ? "text/event-stream" : "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      throw new NvidiaAPIError(
        `Rate limit exceeded. ${retryAfter ? `Retry after ${retryAfter} seconds.` : "Please try again shortly."}`,
        429,
        { retryAfter }
      );
    }

    if (!response.ok) {
      let errorDetails: unknown;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }

      throw new NvidiaAPIError(`NVIDIA API error: ${response.statusText}`, response.status, errorDetails);
    }

    if (stream) {
      if (!response.body) {
        throw new NvidiaAPIError("No response body received for streaming request");
      }
      return response.body;
    }

    const data: NvidiaAPIResponseData = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new NvidiaAPIError("Invalid response: no choices returned", undefined, data);
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new NvidiaAPIError("Invalid response: empty content", undefined, data);
    }

    return {
      content,
      cached: false,
    };
  } catch (error) {
    if (error instanceof NvidiaAPIError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new NvidiaAPIError("NVIDIA API request timed out. Please try again.");
    }

    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new NvidiaAPIError(
        "Network error: Unable to reach NVIDIA API. Please check your internet connection.",
        undefined,
        error
      );
    }

    throw new NvidiaAPIError("Unexpected error calling NVIDIA API", undefined, error);
  } finally {
    clearTimeout(timeout);
  }
}

export async function* streamNvidiaResponse(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === "data: [DONE]") continue;

        if (trimmed.startsWith("data: ")) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              yield content;
            }
          } catch (error) {
            console.error("Error parsing streaming chunk:", error);
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
