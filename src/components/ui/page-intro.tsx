import * as React from "react";

import { cn } from "@/lib/utils";

type PageIntroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
};

export function PageIntro({
  eyebrow,
  title,
  description,
  meta,
  actions,
  className,
}: PageIntroProps) {
  return (
    <section
      className={cn(
        "animate-surface-enter rounded-[36px] border border-white/60 bg-[color:var(--paper-strong)] p-6 [box-shadow:var(--shadow-soft),var(--shadow-inset)] sm:p-8",
        className
      )}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[color:var(--foreground)] sm:text-4xl">
            {title}
          </h1>
          <p className="max-w-xl text-sm leading-6 text-[color:var(--ink-soft)]">{description}</p>
          {meta ? (
            <div className="flex flex-wrap gap-2 text-sm text-[color:var(--ink-soft)] [&>span]:rounded-full [&>span]:border [&>span]:border-white/60 [&>span]:bg-[color:var(--paper-muted)] [&>span]:px-3 [&>span]:py-1.5">
              {meta}
            </div>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-3">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}
