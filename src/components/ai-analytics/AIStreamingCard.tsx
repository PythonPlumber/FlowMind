"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { readAIResponseStream } from "@/lib/ai/client-streaming";
import { renderModelText } from "@/lib/ai/model-text";
import type { AggregatedUserData, AnalysisType } from "@/types/ai";
import { cn } from "@/lib/utils";

interface AIStreamingCardProps {
  title: string;
  analysisType: AnalysisType;
  icon: ReactNode;
  color: "teal" | "purple" | "rose";
  aggregatedData: AggregatedUserData;
}

const colorStyles = {
  teal: {
    icon: "text-[color:var(--insight-pattern)]",
    border: "border-teal-200/50",
    dot: "bg-teal-500",
  },
  purple: {
    icon: "text-[color:var(--insight-health)]",
    border: "border-purple-200/50",
    dot: "bg-violet-500",
  },
  rose: {
    icon: "text-[color:var(--insight-emotion)]",
    border: "border-rose-200/50",
    dot: "bg-rose-500",
  },
};

export default function AIStreamingCard({
  title,
  analysisType,
  icon,
  color,
  aggregatedData,
}: AIStreamingCardProps) {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const analyzeData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setContent("");

    try {
      const response = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          analysisType,
          data: aggregatedData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "AI analysis failed");
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        setContent(data.content);
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const fullContent = await readAIResponseStream(response.body, (nextContent) => {
        setContent(nextContent);
      });

      setContent(fullContent);
      setIsLoading(false);
    } catch (err) {
      console.error("Error in AI analysis:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
      setIsLoading(false);
    }
  }, [aggregatedData, analysisType]);

  useEffect(() => {
    void analyzeData();
  }, [analyzeData]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [content]);

  async function copyToClipboard() {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card variant="panel" className={cn("overflow-hidden", colorStyles[color].border)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-xl tracking-[-0.03em]">
          <span
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--paper-muted)] [box-shadow:var(--shadow-inset)]",
              colorStyles[color].icon
            )}
          >
            {icon}
          </span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error ? (
          <div className="flex items-start gap-3 rounded-[24px] bg-red-50/85 p-4 text-sm text-red-900">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Analysis Error</p>
              <p className="mt-1 text-red-800">{error}</p>
              <button
                onClick={analyzeData}
                className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-900"
              >
                Try again
              </button>
            </div>
          </div>
        ) : isLoading && content.length === 0 ? (
          <div className="rounded-[26px] bg-[color:var(--paper-muted)] p-5 [box-shadow:var(--shadow-inset)]">
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-white/70 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-5/6 rounded bg-white/70 bg-[length:200%_100%] animate-shimmer" />
              <div className="h-4 w-4/6 rounded bg-white/70 bg-[length:200%_100%] animate-shimmer" />
            </div>
          </div>
        ) : (
          <>
            <div
              ref={contentRef}
              className="max-h-96 overflow-auto pr-2"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(139, 92, 246, 0.3) transparent",
              }}
            >
              <div className="rounded-[26px] bg-[color:var(--paper-muted)] p-5 [box-shadow:var(--shadow-inset)]">
                <div className="space-y-4 text-sm leading-7 text-[color:var(--foreground)]">
                  {renderModelText(content || "Analyzing...")}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              {isLoading && content.length > 0 ? (
                <div className="flex items-center gap-2 text-sm text-[color:var(--ink-soft)]">
                  <div className={cn("h-2.5 w-2.5 rounded-full animate-pulse", colorStyles[color].dot)} />
                  Analyzing...
                </div>
              ) : (
                <span />
              )}

              {content && !isLoading ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={copyToClipboard}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
