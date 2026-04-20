import * as React from "react";

export function LogSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[34px] border border-white/60 bg-[color:var(--paper-strong)] p-5 [box-shadow:var(--shadow-soft),var(--shadow-inset)] sm:p-6">
      <div className="mb-5 space-y-2">
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-6 text-[color:var(--ink-soft)]">{description}</p>
      </div>
      {children}
    </section>
  );
}
