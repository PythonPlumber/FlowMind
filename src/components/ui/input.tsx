import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[22px] border border-white/70 bg-[color:var(--paper-strong)] px-4 py-2 text-sm text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] placeholder:text-[color:var(--ink-soft)]/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/35 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
