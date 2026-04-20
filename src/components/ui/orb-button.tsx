import * as React from "react";

import { cn } from "@/lib/utils";

export const OrbButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    data-orb-button="true"
    className={cn(
      "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-[color:var(--paper-strong)] text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] transition-all duration-200 hover:[box-shadow:var(--shadow-soft),var(--shadow-inset),var(--glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/35 focus-visible:ring-offset-2 active:translate-y-[1px] disabled:pointer-events-none disabled:opacity-50",
      className
    )}
    {...props}
  />
));

OrbButton.displayName = "OrbButton";
