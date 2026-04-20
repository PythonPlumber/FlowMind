import { BrandMark } from "@/components/brand/BrandMark";
import { HeartPulse, LockKeyhole, Sparkles } from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
  children: React.ReactNode;
};

const icons = [Sparkles, HeartPulse, LockKeyhole];

export function AuthShell({
  eyebrow,
  title,
  description,
  points,
  children,
}: AuthShellProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[34px] border border-[color:var(--line)] bg-[linear-gradient(135deg,#ffffff,rgba(253,231,239,0.78))] p-8 shadow-[0_24px_64px_rgba(83,37,48,0.10)]">
        <div className="mb-6 flex items-center gap-3">
          <BrandMark />
          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--brand)]">
            Period Tracker
          </span>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--brand)]">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-[color:var(--foreground)]">
          {title}
        </h1>
        <p className="mt-3 max-w-lg text-base leading-7 text-[color:var(--ink-soft)]">
          {description}
        </p>
        <div className="mt-8 space-y-3">
          {points.map((point, index) => {
            const Icon = icons[index % icons.length]!;
            return (
              <div
                key={point}
                className="flex items-center gap-3 rounded-[22px] border border-[color:var(--line)] bg-white px-4 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--brand-soft)] text-[color:var(--brand-strong)]">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-[color:var(--foreground)]">{point}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[34px] border border-[color:var(--line)] bg-white p-8 shadow-[0_20px_56px_rgba(83,37,48,0.08)]">
        {children}
      </section>
    </div>
  );
}
