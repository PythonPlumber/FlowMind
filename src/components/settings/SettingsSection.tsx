import * as React from "react";

export function SettingsSection({
  title,
  description,
  children,
  danger,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <section
      className={
        danger
          ? "rounded-[32px] border border-red-200/80 bg-red-50/90 p-6 shadow-[0_20px_48px_rgba(160,58,68,0.10)]"
          : "rounded-[32px] border border-white/60 bg-[color:var(--paper-strong)] p-6 [box-shadow:var(--shadow-soft),var(--shadow-inset)]"
      }
    >
      <div className="mb-5 space-y-2">
        <h2
          className={
            danger
              ? "text-xl font-semibold tracking-[-0.03em] text-red-900"
              : "text-xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]"
          }
        >
          {title}
        </h2>
        <p className={danger ? "text-sm text-red-900/80" : "max-w-2xl text-sm leading-6 text-[color:var(--ink-soft)]"}>
          {description}
        </p>
      </div>
      {children}
    </section>
  );
}
