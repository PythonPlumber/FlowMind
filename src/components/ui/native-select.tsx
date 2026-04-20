import * as React from "react";

import { cn } from "@/lib/utils";

export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "h-11 w-full rounded-2xl border border-white/55 bg-[color:var(--paper-strong)] px-4 text-sm text-[color:var(--foreground)] shadow-[0_12px_30px_rgba(83,37,48,0.06)] outline-none transition focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/35",
        className
      )}
      {...props}
    />
  );
});

NativeSelect.displayName = "NativeSelect";
