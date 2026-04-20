"use client";

import { useState } from "react";

import { readAIResponseStream } from "@/lib/ai/client-streaming";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

const suggestedQuestions = [
  "What changed this month compared with my usual rhythm?",
  "Which symptom pattern looks strongest right now?",
  "What should I focus on logging next month?",
];

export default function AIQuestionCard({
  monthLabel,
  monthParam,
}: {
  monthLabel: string;
  monthParam: string;
}) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function askAI(customQuestion?: string) {
    const finalQuestion = (customQuestion ?? question).trim();
    if (!finalQuestion) return;

    setLoading(true);
    setError(null);
    setAnswer("");

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `For ${monthLabel}, ${finalQuestion}`,
          monthParam,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "AI request failed" }));
        throw new Error(data.error || "AI request failed");
      }

      if (!response.body) {
        throw new Error("No response body received.");
      }

      await readAIResponseStream(response.body, (fullAnswer) => {
        setAnswer(fullAnswer);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown AI error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card variant="panel">
      <CardHeader>
        <CardTitle>Ask about this month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-[color:var(--ink-soft)]">
          Ask follow-up questions about the selected month, your symptom timing, or what to log next.
        </p>

        <div className="flex flex-wrap gap-2">
          {suggestedQuestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => {
                setQuestion(item);
                void askAI(item);
              }}
              className="rounded-full border border-[color:var(--line)] bg-[color:var(--paper-muted)] px-3 py-2 text-left text-xs font-medium text-[color:var(--foreground)] transition hover:border-[color:var(--brand)]/40 hover:bg-white"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <Textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask a month-specific question about your data..."
            rows={4}
          />
          <div className="flex justify-end">
            <Button type="button" onClick={() => void askAI()} disabled={loading || question.trim().length === 0}>
              {loading ? "Thinking..." : "Ask AI"}
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-[20px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
        ) : null}

        {answer ? (
          <div className="rounded-[24px] border border-white/60 bg-white/90 p-4 text-sm leading-7 text-[color:var(--foreground)] shadow-[0_16px_36px_rgba(83,37,48,0.06)]">
            {answer}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
