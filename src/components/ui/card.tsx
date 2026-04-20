import * as React from "react";

import { cn } from "@/lib/utils";

type CardVariant = "default" | "hero" | "panel" | "danger" | "ai" | "tray";

const cardVariants: Record<CardVariant, string> = {
  default:
    "border-[color:var(--line)] bg-[color:var(--paper)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]",
  hero:
    "border-white/60 bg-[linear-gradient(180deg,rgba(250,252,255,0.96),rgba(236,242,255,0.86))] shadow-[0_34px_80px_rgba(122,141,184,0.22)] [box-shadow:0_34px_80px_rgba(122,141,184,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]",
  panel:
    "border-white/55 bg-[color:var(--paper-strong)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]",
  danger:
    "border-red-200/80 bg-[rgba(255,240,242,0.92)] shadow-[0_24px_56px_rgba(201,108,122,0.15)]",
  ai:
    "border-white/55 bg-[linear-gradient(180deg,rgba(246,249,255,0.95),rgba(234,239,255,0.9))] shadow-[0_26px_64px_rgba(125,133,220,0.2)]",
  tray:
    "border-white/45 bg-[rgba(231,238,252,0.7)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]",
};

export function Card({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: CardVariant }) {
  return (
    <div
      data-card-variant={variant}
      className={cn(
        "rounded-[28px] border text-[color:var(--foreground)] backdrop-blur-sm",
        cardVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pb-3", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-[-0.02em]", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm leading-6 text-[color:var(--ink-soft)]", className)} {...props} />
  );
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-0", className)} {...props} />;
}

export function CardFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
  );
}
