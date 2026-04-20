import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--brand)]/35 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        brand:
          "bg-[color:var(--brand)] text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)] hover:bg-[color:var(--brand-strong)] hover:shadow-[0_24px_48px_rgba(118,139,255,0.38)]",
        secondary:
          "border border-white/70 bg-[color:var(--paper-strong)] text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] hover:bg-white/90",
        outline:
          "border border-[color:var(--line)] bg-transparent text-[color:var(--foreground)] hover:bg-white/40",
        ghost:
          "bg-transparent text-[color:var(--ink-soft)] hover:bg-[color:var(--paper-muted)] hover:text-[color:var(--foreground)]",
        destructive:
          "bg-[color:var(--danger)] text-white shadow-[0_18px_34px_rgba(201,108,122,0.28)] hover:brightness-95",
      },
      size: {
        default: "h-11 px-5 text-sm",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
        orb: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "brand",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        data-variant={variant ?? "brand"}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
