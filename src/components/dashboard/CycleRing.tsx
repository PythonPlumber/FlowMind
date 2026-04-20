"use client";

import { useMemo } from "react";
import { CycleVisualizationModel } from "@/lib/cycleVisualization";
import { cn } from "@/lib/utils";

const segmentToneClasses: Record<
  CycleVisualizationModel["segments"][number]["tone"],
  { stroke: string; label: string }
> = {
  period: { stroke: "#e7a63a", label: "text-amber-900" },
  fertile: { stroke: "#5f8f72", label: "text-emerald-900" },
  predicted: { stroke: "#b12b57", label: "text-[color:var(--brand-strong)]" },
  phase: { stroke: "#7387ff", label: "text-indigo-900" },
};

const phaseColors: Record<string, string> = {
  menstruation: "#e7a63a",
  follicular_early: "#a78bcd",
  follicular_late: "#8b5cf6",
  ovulation: "#ec4899",
  fertile: "#5f8f72",
  luteal_early: "#7387ff",
  luteal_late: "#b12b57",
};

export function CycleRing({ model }: { model: CycleVisualizationModel }) {
  const radius = 84;
  const circumference = 2 * Math.PI * radius;
  
  const todayAngle = useMemo(
    () =>
      model.cycleDay && model.cycleLength > 0
        ? ((Math.min(model.cycleLength, model.cycleDay) - 1) / model.cycleLength) * 360 - 90
        : null,
    [model.cycleDay, model.cycleLength]
  );

  const activePhaseSegment = useMemo(
    () => model.phaseSegments.find((s) => s.isActive),
    [model.phaseSegments]
  );

  const fertilityIndicator = useMemo(() => {
    if (model.fertilityLevel === "peak") return { color: "#5f8f72", label: "Peak fertility", glow: true };
    if (model.fertilityLevel === "post") return { color: "#7387ff", label: "Post-ovulation", glow: false };
    return { color: "#a78bcd", label: "Low fertility", glow: false };
  }, [model.fertilityLevel]);

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="relative">
        <svg
          aria-label="Adaptive cycle ring"
          viewBox="0 0 240 240"
          className="h-[260px] w-[260px] drop-shadow-[0_24px_32px_rgba(61,28,35,0.08)] sm:h-[300px] sm:w-[300px]"
        >
          <defs>
            <filter id="cycle-ring-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="12" stdDeviation="12" floodColor="rgba(177,43,87,0.12)" />
            </filter>
            <filter id="fertility-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor={fertilityIndicator.glow ? "rgba(95,143,114,0.5)" : "rgba(167,139,205,0.3)"} />
            </filter>
          </defs>

          <circle cx="120" cy="120" r={98} fill="#ffffff" />

          <circle
            cx="120"
            cy="120"
            r={98}
            fill="none"
            stroke={model.uncertaintyLevel === "high" ? "rgba(177,43,87,0.18)" : "rgba(177,43,87,0.08)"}
            strokeWidth={model.uncertaintyLevel === "high" ? 16 : model.uncertaintyLevel === "medium" ? 12 : 8}
          />

          <circle
            cx="120"
            cy="120"
            r={radius}
            fill="none"
            stroke="rgba(111,89,96,0.12)"
            strokeWidth="18"
          />

          {model.segments.map((segment) => {
            const length = ((segment.endDay - segment.startDay + 1) / model.cycleLength) * circumference;
            const offset = circumference - ((segment.startDay - 1) / model.cycleLength) * circumference;
            return (
              <circle
                key={`${segment.label}-${segment.startDay}-${segment.endDay}`}
                cx="120"
                cy="120"
                r={radius}
                fill="none"
                stroke={segmentToneClasses[segment.tone].stroke}
                strokeWidth="18"
                strokeLinecap="round"
                strokeDasharray={`${length} ${circumference}`}
                strokeDashoffset={offset}
                transform="rotate(-90 120 120)"
                filter="url(#cycle-ring-soft-glow)"
              />
            );
          })}

          {model.phaseSegments.map((segment) => {
            const startAngle = ((segment.startDay - 1) / model.cycleLength) * 360 - 90;
            const endAngle = (segment.endDay / model.cycleLength) * 360 - 90;
            const length = ((segment.endDay - segment.startDay + 1) / model.cycleLength) * circumference;
            const offset = circumference - ((segment.startDay - 1) / model.cycleLength) * circumference;
            
            return (
              <circle
                key={segment.phase}
                cx="120"
                cy="120"
                r={radius - 24}
                fill="none"
                stroke={segment.color}
                strokeWidth="4"
                strokeLinecap="butt"
                strokeDasharray={`${length} ${circumference}`}
                strokeDashoffset={offset}
                transform="rotate(-90 120 120)"
                opacity={segment.isActive ? 1 : 0.4}
                filter={segment.isActive ? "url(#fertility-glow)" : undefined}
              />
            );
          })}

          <circle
            cx="120"
            cy="120"
            r={60}
            fill="url(#cycle-core-fill)"
          />
          <defs>
            <radialGradient id="cycle-core-fill" cx="50%" cy="40%" r="70%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f6f3f5" />
            </radialGradient>
          </defs>

          {todayAngle !== null && (
            <g transform={`rotate(${todayAngle} 120 120)`}>
              <circle cx="120" cy="36" r="7" fill="#23181a" />
              <circle cx="120" cy="36" r="12" fill="none" stroke="rgba(35,24,26,0.16)" strokeWidth="2" />
            </g>
          )}

          {activePhaseSegment && (
            <g opacity={0.9}>
              <circle
                cx="120"
                cy="120"
                r={45}
                fill="none"
                stroke={activePhaseSegment.color}
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity={0.5}
              />
            </g>
          )}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {activePhaseSegment && (
            <p 
              className="text-xs font-semibold uppercase tracking-[0.18em] mb-1"
              style={{ color: activePhaseSegment.color }}
            >
              {activePhaseSegment.label}
            </p>
          )}
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">
            {model.centerLabel}
          </p>
          <p className="mt-1 text-4xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)] sm:text-5xl">
            {model.cycleDay ? `Day ${model.cycleDay}` : "--"}
          </p>
          <p className="mt-1 text-sm text-[color:var(--ink-soft)]">
            {model.confidenceScore}% confident
          </p>
        </div>
      </div>

      <div className="space-y-3 text-center">
        {model.nextKeyDate && (
          <div className="mb-2">
            <p className="text-sm font-medium text-[color:var(--foreground)]">
              {model.nextKeyDate.label}: <span className="font-bold">{model.nextKeyDate.daysAway} days</span>
            </p>
          </div>
        )}
        
        <p className="text-base font-semibold tracking-[-0.02em] text-[color:var(--foreground)]">
          {model.rangeLabel}
        </p>
        
        <div className="flex items-center justify-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: fertilityIndicator.color }}
          />
          <p className="text-xs font-medium" style={{ color: fertilityIndicator.color }}>
            {fertilityIndicator.label}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          {model.phaseSegments.filter(s => s.isActive).map((segment) => (
            <span
              key={segment.phase}
              className="rounded-full border border-[color:var(--line)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ color: segment.color }}
            >
              {segment.label}
            </span>
          ))}
          {model.segments.map((segment) => (
            <span
              key={`seg-${segment.label}`}
              className={cn(
                "rounded-full border border-[color:var(--line)] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]",
                segmentToneClasses[segment.tone].label
              )}
            >
              {segment.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
