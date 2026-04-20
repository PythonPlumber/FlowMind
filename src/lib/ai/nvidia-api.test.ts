import { describe, expect, it } from "vitest";

import { streamNvidiaResponse } from "@/lib/ai/nvidia-api";

describe("streamNvidiaResponse", () => {
  it("parses SSE chunks into text content", async () => {
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(
          encoder.encode(
            'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\ndata: {"choices":[{"delta":{"content":" there"}}]}\n\ndata: [DONE]\n'
          )
        );
        controller.close();
      },
    });

    const parts: string[] = [];
    for await (const part of streamNvidiaResponse(stream)) {
      parts.push(part);
    }

    expect(parts).toEqual(["Hello", " there"]);
  });
});
