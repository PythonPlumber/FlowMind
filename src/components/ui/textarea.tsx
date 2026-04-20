import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-32 w-full rounded-[24px] border border-white/70 bg-[color:var(--paper-strong)] px-4 py-3 text-sm text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] placeholder:text-[color:var(--ink-soft)]/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/35 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
