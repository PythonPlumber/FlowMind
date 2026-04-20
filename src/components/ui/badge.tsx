import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]",
        muted: "border-white/60 bg-[color:var(--paper-muted)] text-[color:var(--ink-soft)]",
        success: "border-emerald-200/70 bg-emerald-50/85 text-emerald-900",
        warning: "border-amber-200/80 bg-amber-50/85 text-amber-900",
        period: "border-rose-200/70 bg-rose-50/85 text-rose-900",
        fertile: "border-emerald-200/70 bg-emerald-50/85 text-emerald-900",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
