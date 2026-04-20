export function extractAIStreamContent(buffer: string, chunk: string) {
  const combined = buffer + chunk;
  const lines = combined.split("\n");
  const nextBuffer = lines.pop() ?? "";
  const content: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "data: [DONE]" || !trimmed.startsWith("data: ")) {
      continue;
    }

    try {
      const json = JSON.parse(trimmed.slice(6));
      const delta = json.choices?.[0]?.delta?.content;
      if (typeof delta === "string" && delta.length > 0) {
        content.push(delta);
      }
    } catch {
      // Ignore malformed or partial event payloads until the next chunk completes them.
    }
  }

  return { nextBuffer, content };
}

function extractTrailingContent(buffer: string) {
  const trimmed = buffer.trim();
  if (!trimmed || trimmed === "data: [DONE]" || !trimmed.startsWith("data: ")) {
    return [];
  }

  try {
    const json = JSON.parse(trimmed.slice(6));
    const delta = json.choices?.[0]?.delta?.content;
    return typeof delta === "string" && delta.length > 0 ? [delta] : [];
  } catch {
    return [];
  }
}

export async function readAIResponseStream(
  stream: ReadableStream<Uint8Array>,
  onContent: (fullText: string, delta: string) => void
) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const parsed = extractAIStreamContent(
        buffer,
        decoder.decode(value, { stream: true })
      );
      buffer = parsed.nextBuffer;

      for (const delta of parsed.content) {
        fullText += delta;
        onContent(fullText, delta);
      }
    }

    const flush = decoder.decode();
    if (flush) {
      const parsed = extractAIStreamContent(buffer, flush);
      buffer = parsed.nextBuffer;
      for (const delta of parsed.content) {
        fullText += delta;
        onContent(fullText, delta);
      }
    }

    for (const delta of extractTrailingContent(buffer)) {
      fullText += delta;
      onContent(fullText, delta);
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
}
