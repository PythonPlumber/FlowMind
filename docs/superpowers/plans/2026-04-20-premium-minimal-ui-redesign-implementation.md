# Premium Minimal UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recast the existing period tracker into a soft luminous, premium minimal interface that reduces visible text density while preserving the current routes, data behavior, and AI features.

**Architecture:** Update design tokens and shared primitives first, then rebuild the app shell and dashboard as the flagship expression of the new system. After the shell is stable, apply the same component language to the log, insights, AI analytics, calendar, reports, and settings pages, preserving server-side data fetching in route files and moving visual complexity into focused presentational components.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Vitest, Testing Library, Recharts, lucide-react.

---

## Working Notes

- Before editing route or layout files, re-open `node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md` and `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` to stay aligned with local Next.js 16 conventions.
- This workspace is not currently a git repo, so do not add commit steps while executing this plan. If the project is initialized into git later, commit after each completed task.
- Preserve existing behavior already covered by the current test suite, especially AI streaming, selected-month chat context, optional body-signal handling, and account deletion cleanup.

## File Structure

- Modify: `src/app/globals.css`
  - Responsibility: global tokens, background layers, shared shadow/glow system, motion utilities.
- Modify: `src/components/ui/button.tsx`
  - Responsibility: primary pill, secondary pill, ghost, destructive, and premium orb button states.
- Modify: `src/components/ui/card.tsx`
  - Responsibility: shell, hero, premium panel, tray, and AI surface variants.
- Modify: `src/components/ui/badge.tsx`
  - Responsibility: compact metadata chips with stronger state styling.
- Modify: `src/components/ui/input.tsx`
  - Responsibility: premium text field surface treatment.
- Modify: `src/components/ui/textarea.tsx`
  - Responsibility: premium multiline field surface treatment.
- Modify: `src/components/ui/page-intro.tsx`
  - Responsibility: compact top-of-page header with tighter copy and action rhythm.
- Create: `src/components/ui/orb-button.tsx`
  - Responsibility: reusable circular icon button for premium nav and utility controls.
- Create: `src/components/ui/premium-primitives.test.tsx`
  - Responsibility: verify the new visual primitive API and presence of shared variants.
- Modify: `src/app/(app)/layout.tsx`
  - Responsibility: shell spacing, quieter footer disclaimer, page frame rhythm.
- Modify: `src/components/nav/AppNav.tsx`
  - Responsibility: sculpted rail, premium top bar, floating mobile dock, reduced filler copy.
- Create: `src/components/nav/AppNav.test.tsx`
  - Responsibility: verify active route treatment and premium shell controls.
- Create: `src/components/dashboard/DashboardHeroSurface.tsx`
  - Responsibility: dominant dashboard hero with phase, cycle ring, and next-step summary.
- Create: `src/components/dashboard/DashboardSnapshotRail.tsx`
  - Responsibility: compact supporting metrics and latest-log snapshot tiles.
- Modify: `src/components/dashboard/DashboardExperience.tsx`
  - Responsibility: compose the new flagship dashboard layout.
- Modify: `src/components/dashboard/PeriodQuickActions.tsx`
  - Responsibility: quieter, more premium quick-action tray.
- Modify: `src/components/dashboard/DashboardExperience.test.tsx`
  - Responsibility: assert the new hero structure while preserving core actions.
- Modify: `src/components/log/DailyLogForm.tsx`
  - Responsibility: guided premium check-in layout.
- Modify: `src/components/log/ChoicePillGroup.tsx`
  - Responsibility: richer tactile state styling and clearer compact controls.
- Modify: `src/components/log/LogSection.tsx`
  - Responsibility: section framing for guided check-in surfaces.
- Modify: `src/components/log/SymptomCard.tsx`
  - Responsibility: premium symptom selection cards with clearer severity treatment.
- Modify: `src/components/log/DailyLogForm.test.tsx`
  - Responsibility: verify the guided check-in shell and sticky action dock remain intact.
- Modify: `src/components/insights/InsightsSummary.tsx`
  - Responsibility: top-level premium summary strip.
- Modify: `src/components/insights/InsightChartCard.tsx`
  - Responsibility: quieter chart framing.
- Create: `src/components/insights/InsightsSummary.test.tsx`
  - Responsibility: verify high-signal summary tiles and interpretation surface.
- Modify: `src/components/ai-analytics/AIAnalyticsExperience.tsx`
  - Responsibility: premium assistant workspace layout.
- Modify: `src/components/ai-analytics/MonthlySummaryCard.tsx`
  - Responsibility: month recap hero treatment.
- Modify: `src/components/ai-analytics/AIStreamingCard.tsx`
  - Responsibility: calmer insight block presentation for streamed content.
- Modify: `src/components/ai-analytics/AIAnalyticsExperience.test.tsx`
  - Responsibility: verify hero CTA and reveal behavior still work in the redesigned layout.
- Modify: `src/components/calendar/CalendarExperience.tsx`
  - Responsibility: premium calendar workspace shell.
- Modify: `src/components/calendar/CalendarLegend.tsx`
  - Responsibility: compact chip-based legend.
- Modify: `src/components/calendar/CalendarMonthGrid.tsx`
  - Responsibility: softer but clearer day-state treatment.
- Modify: `src/components/calendar/CalendarDayDetail.tsx`
  - Responsibility: selected-day detail tray.
- Modify: `src/components/calendar/CalendarExperience.test.tsx`
  - Responsibility: verify premium calendar controls and selected-day summary.
- Modify: `src/components/reports/ReportDownloadForm.tsx`
  - Responsibility: premium export surface with compact range summary.
- Modify: `src/components/reports/RangePresetPills.tsx`
  - Responsibility: quieter preset controls.
- Modify: `src/components/reports/ReportDownloadForm.test.tsx`
  - Responsibility: verify range presets and CTA behavior remain correct.
- Modify: `src/components/settings/SettingsClient.tsx`
  - Responsibility: grouped premium settings zones.
- Modify: `src/components/settings/SettingsSection.tsx`
  - Responsibility: softer section shell and hierarchy.
- Modify: `src/components/settings/SettingsClient.test.tsx`
  - Responsibility: verify section grouping and destructive zone presence.
- Modify: route files:
  - `src/app/(app)/page.tsx`
  - `src/app/(app)/calendar/page.tsx`
  - `src/app/(app)/insights/page.tsx`
  - `src/app/(app)/reports/page.tsx`
  - `src/app/(app)/settings/page.tsx`
  - `src/app/(app)/ai-analytics/page.tsx`
  - Responsibility: pass concise copy and hero-friendly data into redesigned components.

## Task 1: Tokenize The Soft-Luminous Visual System

**Files:**
- Create: `src/components/ui/orb-button.tsx`
- Create: `src/components/ui/premium-primitives.test.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/ui/button.tsx`
- Modify: `src/components/ui/card.tsx`
- Modify: `src/components/ui/badge.tsx`
- Modify: `src/components/ui/input.tsx`
- Modify: `src/components/ui/textarea.tsx`
- Modify: `src/components/ui/page-intro.tsx`

- [ ] **Step 1: Write the failing primitives test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrbButton } from "@/components/ui/orb-button";
import { PageIntro } from "@/components/ui/page-intro";

describe("premium primitives", () => {
  it("renders hero surfaces, compact chips, and orb controls", () => {
    render(
      <div>
        <Card variant="hero">Hero surface</Card>
        <Button variant="brand">Log today</Button>
        <OrbButton aria-label="Open menu">+</OrbButton>
        <Badge variant="muted">April 2026</Badge>
        <PageIntro
          eyebrow="Today"
          title="Late follicular"
          description="One clear next step."
          meta={<span>Cycle day 12</span>}
        />
      </div>
    );

    expect(screen.getByText("Hero surface").closest("[data-card-variant]")).toHaveAttribute(
      "data-card-variant",
      "hero"
    );
    expect(screen.getByRole("button", { name: "Log today" })).toHaveAttribute("data-variant", "brand");
    expect(screen.getByLabelText("Open menu")).toHaveAttribute("data-orb-button", "true");
    expect(screen.getByText("Cycle day 12")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/ui/premium-primitives.test.tsx`

Expected: FAIL because `OrbButton` does not exist yet and the shared primitive API is incomplete.

- [ ] **Step 3: Update `globals.css` with the new premium token set**

```css
:root {
  --background: #eef3ff;
  --foreground: #31405c;
  --paper: rgba(246, 249, 255, 0.88);
  --paper-strong: rgba(250, 252, 255, 0.94);
  --paper-muted: rgba(231, 238, 252, 0.92);
  --line: rgba(118, 138, 182, 0.18);
  --brand: #768bff;
  --brand-strong: #5d73ef;
  --brand-soft: rgba(118, 139, 255, 0.14);
  --accent-orchid: #e6b5de;
  --accent-periwinkle: #b8c7ff;
  --success: #7ea892;
  --warning: #d99d8f;
  --danger: #c96c7a;
  --ink-soft: #72819f;
  --shadow-soft: 0 28px 60px rgba(122, 141, 184, 0.18);
  --shadow-inset: inset 0 1px 0 rgba(255, 255, 255, 0.75);
  --glow: 0 0 30px rgba(184, 199, 255, 0.35);
}

body {
  background:
    radial-gradient(circle at 15% 15%, rgba(255, 255, 255, 0.95), transparent 24%),
    radial-gradient(circle at 85% 10%, rgba(230, 181, 222, 0.28), transparent 22%),
    radial-gradient(circle at 50% 90%, rgba(184, 199, 255, 0.26), transparent 28%),
    linear-gradient(180deg, #edf3ff 0%, #e7eefc 100%);
}
```

- [ ] **Step 4: Add the shared orb control and richer primitive variants**

```tsx
// src/components/ui/orb-button.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export const OrbButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    data-orb-button="true"
    className={cn(
      "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/70 bg-[color:var(--paper-strong)] text-[color:var(--foreground)] shadow-[var(--shadow-soft)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] transition hover:shadow-[var(--shadow-soft),var(--shadow-inset),var(--glow)] active:translate-y-[1px]",
      className
    )}
    {...props}
  />
));
OrbButton.displayName = "OrbButton";
```

```tsx
// add to button.tsx variants
variant: {
  brand: "bg-[color:var(--brand)] text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)] hover:bg-[color:var(--brand-strong)]",
  secondary: "border border-white/70 bg-[color:var(--paper-strong)] text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]",
  ghost: "bg-transparent text-[color:var(--ink-soft)] hover:text-[color:var(--foreground)]",
  destructive: "bg-[color:var(--danger)] text-white",
},
size: {
  default: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
  orb: "h-11 w-11 p-0",
}
```

```tsx
// add to card.tsx variants
const cardVariants = {
  default: "border-[color:var(--line)] bg-[color:var(--paper)] shadow-[var(--shadow-soft)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]",
  hero: "border-white/60 bg-[linear-gradient(180deg,rgba(250,252,255,0.96),rgba(236,242,255,0.86))] shadow-[0_34px_80px_rgba(122,141,184,0.22)] [box-shadow:0_34px_80px_rgba(122,141,184,0.22),inset_0_1px_0_rgba(255,255,255,0.9)]",
  panel: "border-white/55 bg-[color:var(--paper-strong)] shadow-[var(--shadow-soft)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]",
  ai: "border-white/55 bg-[linear-gradient(180deg,rgba(246,249,255,0.95),rgba(234,239,255,0.9))] shadow-[0_26px_64px_rgba(125,133,220,0.2)]",
  danger: "border-red-200/80 bg-[rgba(255,240,242,0.92)] shadow-[0_24px_56px_rgba(201,108,122,0.15)]",
  tray: "border-white/45 bg-[rgba(231,238,252,0.7)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
};
```

```tsx
// tighten page-intro.tsx
<section className="rounded-[36px] border border-white/60 bg-[color:var(--paper-strong)] p-6 shadow-[var(--shadow-soft)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] sm:p-8">
  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
    <div className="space-y-2">
      {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">{eyebrow}</p> : null}
      <h1 className="text-3xl font-semibold tracking-[-0.05em] text-[color:var(--foreground)] sm:text-4xl">{title}</h1>
      <p className="max-w-xl text-sm leading-6 text-[color:var(--ink-soft)]">{description}</p>
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
  </div>
</section>
```

- [ ] **Step 5: Run the focused test to verify it passes**

Run: `npx vitest run src/components/ui/premium-primitives.test.tsx`

Expected: PASS with `1 passed`.

- [ ] **Step 6: Lint the shared primitives**

Run: `npm run lint -- src/app/globals.css src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/badge.tsx src/components/ui/input.tsx src/components/ui/textarea.tsx src/components/ui/orb-button.tsx src/components/ui/page-intro.tsx src/components/ui/premium-primitives.test.tsx`

Expected: exit code `0`.

## Task 2: Rebuild The App Shell Around Quiet Premium Controls

**Files:**
- Create: `src/components/nav/AppNav.test.tsx`
- Modify: `src/app/(app)/layout.tsx`
- Modify: `src/components/nav/AppNav.tsx`
- Modify: `src/components/nav/UserMenu.tsx`

- [ ] **Step 1: Write the failing app-shell test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/insights",
}));

import { AppNav } from "@/components/nav/AppNav";

describe("AppNav", () => {
  it("shows premium shell controls with the current route highlighted", () => {
    render(<AppNav />);

    expect(screen.getByRole("link", { name: "Insights" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Quick log" })).toBeInTheDocument();
    expect(screen.getByLabelText("Open navigation menu")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/nav/AppNav.test.tsx`

Expected: FAIL because the nav still uses the old shell and does not expose the expected control structure cleanly.

- [ ] **Step 3: Rewrite the shell spacing in `src/app/(app)/layout.tsx`**

```tsx
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell min-h-screen pb-10">
      <AppNav />
      <main className="px-4 pb-28 pt-5 lg:pl-[18.5rem] lg:pr-6 lg:pt-5">
        <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
      </main>
      <footer className="px-4 pb-6 lg:pl-[18.5rem] lg:pr-6">
        <div className="mx-auto w-full max-w-6xl rounded-[24px] border border-white/55 bg-[rgba(246,249,255,0.76)] px-5 py-3 text-xs leading-6 text-[color:var(--ink-soft)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]">
          Fertility and cycle predictions are estimates only. Not medical advice and not birth control.
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 4: Refactor `AppNav.tsx` into a sculpted rail and floating mobile dock**

```tsx
<aside className="fixed inset-y-4 left-4 z-30 hidden w-[15.5rem] lg:flex">
  <div className="flex w-full flex-col rounded-[40px] border border-white/60 bg-[rgba(246,249,255,0.82)] px-5 py-6 [box-shadow:var(--shadow-soft),var(--shadow-inset)] backdrop-blur-xl">
    <Link href="/" className="flex items-center gap-3 px-2 py-2">
      <BrandMark className="h-11 w-11" />
      <div>
        <p className="text-[11px] uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">Period tracker</p>
        <p className="text-base font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">Quiet cycle OS</p>
      </div>
    </Link>
    <nav className="mt-8 space-y-2">
      {links.map((link) => (
        <RailLink
          key={link.href}
          href={link.href}
          label={link.label}
          icon={link.icon}
          active={isActivePath(activePath, link.href)}
        />
      ))}
    </nav>
    <div className="mt-auto flex items-center justify-between rounded-[24px] bg-[color:var(--paper-muted)] px-3 py-3">
      <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">{activeLink.label}</span>
      <UserMenu />
    </div>
  </div>
</aside>
```

```tsx
<div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 px-4 lg:hidden">
  <div className="pointer-events-auto mx-auto flex max-w-sm items-center justify-between rounded-[30px] border border-white/70 bg-[rgba(246,249,255,0.88)] px-2 py-2 [box-shadow:var(--shadow-soft),var(--shadow-inset)] backdrop-blur-xl">
    {mobileTabs.map((link) => (
      (() => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActivePath(activePath, link.href) ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-[22px] px-2 py-2 text-[11px] font-medium transition",
              isActivePath(activePath, link.href)
                ? "bg-[color:var(--brand-soft)] text-[color:var(--brand)]"
                : "text-[color:var(--ink-soft)]"
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="truncate">{link.label}</span>
          </Link>
        );
      })()
    ))}
  </div>
</div>
```

- [ ] **Step 5: Verify the shell test passes**

Run: `npx vitest run src/components/nav/AppNav.test.tsx`

Expected: PASS with the current route highlighted and the premium nav controls present.

- [ ] **Step 6: Lint the shell files**

Run: `npm run lint -- src/app/(app)/layout.tsx src/components/nav/AppNav.tsx src/components/nav/UserMenu.tsx src/components/nav/AppNav.test.tsx`

Expected: exit code `0`.

## Task 3: Turn The Dashboard Into The Flagship Hero Screen

**Files:**
- Create: `src/components/dashboard/DashboardHeroSurface.tsx`
- Create: `src/components/dashboard/DashboardSnapshotRail.tsx`
- Modify: `src/components/dashboard/DashboardExperience.tsx`
- Modify: `src/components/dashboard/PeriodQuickActions.tsx`
- Modify: `src/components/dashboard/DashboardExperience.test.tsx`
- Modify: `src/app/(app)/page.tsx`

- [ ] **Step 1: Update the dashboard test to describe the new hero hierarchy**

```tsx
it("renders the dashboard as a hero-led cycle workspace", () => {
  render(
    <DashboardExperience
      todayLabel="2026-04-14"
      age={26}
      goalMode="conceive"
      phaseLabel="Late follicular phase"
      cycleRing={buildCycleVisualizationModel({
        cycleLength: 39,
        cycleDay: 17,
        actualPeriodLength: 6,
        fertileWindowStartDay: 19,
        fertileWindowEndDay: 25,
        predictedWindowStartDay: 38,
        predictedWindowEndDay: 39,
        confidenceScore: 84,
        irregularityLevel: "long_cycle",
        cycleLengthRange: { min: 38, max: 39 },
      })}
      cycleHealth={[
        { label: "Current cycle day", value: "17" },
        { label: "Usual range", value: "38-39 days" },
        { label: "Current confidence", value: "84%" },
        { label: "Pattern", value: "Long-cycle pattern observed" },
        { label: "Last period", value: "2026-03-29" },
        { label: "Goal-aware note", value: "Fertile estimate is approaching." },
      ]}
      nextPeriodWindow={{ start: "2026-04-29", end: "2026-04-30", variabilityLabel: "Low swing" }}
      fertileWindow={{ start: "2026-04-16", end: "2026-04-22" }}
      latestLog={{
        date: "2026-04-14",
        mood: 4,
        flow: "heavy",
        bbt: 36.7,
        mucusType: "watery",
        sex: true,
        contraception: "Condom",
        notes: "Lower energy in the evening.",
      }}
      trackingStreak={6}
    />
  );

  expect(screen.getByRole("heading", { name: "Late follicular phase" })).toBeInTheDocument();
  expect(screen.getByText("Next key window")).toBeInTheDocument();
  expect(screen.getByText("Latest check-in")).toBeInTheDocument();
  expect(screen.getByText("6 day streak")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Month analytics" })).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the dashboard test to verify it fails**

Run: `npx vitest run src/components/dashboard/DashboardExperience.test.tsx`

Expected: FAIL because the current dashboard does not expose the new hero-led structure.

- [ ] **Step 3: Create `DashboardHeroSurface.tsx` for the centered cycle focal point**

```tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CycleRing } from "@/components/dashboard/CycleRing";

export function DashboardHeroSurface(props: {
  phaseLabel: string;
  cycleRing: CycleVisualizationModel;
  todayLabel: string;
  nextWindowLabel: string;
  confidenceLabel: string;
  goalLabel: string;
}) {
  return (
    <Card variant="hero">
      <CardContent className="space-y-6 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="muted">{props.todayLabel}</Badge>
          <Badge variant="default">{props.goalLabel}</Badge>
          <Badge variant="success">{props.confidenceLabel}</Badge>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">Current phase</p>
          <h2 className="text-4xl font-semibold tracking-[-0.06em] text-[color:var(--foreground)]">{props.phaseLabel}</h2>
          <p className="text-sm leading-6 text-[color:var(--ink-soft)]">Your tracker is centered on now, with the next expected shift kept close.</p>
        </div>
        <div className="mx-auto max-w-md">
          <CycleRing model={props.cycleRing} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[26px] bg-[color:var(--paper-muted)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">Next key window</p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">{props.nextWindowLabel}</p>
          </div>
          <div className="rounded-[26px] bg-[color:var(--paper-muted)] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">Confidence</p>
            <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">{props.confidenceLabel}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create `DashboardSnapshotRail.tsx` and simplify `DashboardExperience.tsx` around it**

```tsx
export function DashboardSnapshotRail(props: {
  cycleHealth: Array<{ label: string; value: string }>;
  latestLog: {
    date: string;
    mood: number | null;
    flow: string | null;
    bbt: number | null;
    mucusType: string | null;
    sex: boolean;
    contraception: string | null;
    notes: string | null;
  } | null;
  trackingStreak: number;
  fertileWindow: { start: string; end: string } | null;
}) {
  return (
    <div className="space-y-4">
      <Card variant="panel">
        <CardContent className="space-y-3 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">Snapshot</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {props.cycleHealth.slice(0, 4).map((item) => (
              <div key={item.label} className="rounded-[24px] bg-[color:var(--paper-muted)] p-4">
                <p className="text-sm text-[color:var(--ink-soft)]">{item.label}</p>
                <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">{item.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card variant="panel">
        <CardContent className="space-y-3 pt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">Latest check-in</p>
          <p className="text-base font-medium text-[color:var(--foreground)]">{props.latestLog?.notes ?? "Add a daily log to unlock a cleaner body-cue snapshot."}</p>
          <p className="text-sm text-[color:var(--ink-soft)]">{props.trackingStreak} day streak</p>
        </CardContent>
      </Card>
    </div>
  );
}
```

```tsx
// in DashboardExperience.tsx
<div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
  <DashboardHeroSurface
    phaseLabel={props.phaseLabel}
    cycleRing={props.cycleRing}
    todayLabel={props.todayLabel}
    nextWindowLabel={props.nextPeriodWindow ? `${props.nextPeriodWindow.start} to ${props.nextPeriodWindow.end}` : "Need more history"}
    confidenceLabel={props.cycleHealth.find((item) => item.label === "Current confidence")?.value ?? "Building"}
    goalLabel={props.goalMode === "conceive" ? "Trying to conceive" : props.goalMode === "avoid" ? "Avoid pregnancy" : "Track periods"}
  />
  <DashboardSnapshotRail
    cycleHealth={props.cycleHealth}
    latestLog={props.latestLog}
    trackingStreak={props.trackingStreak}
    fertileWindow={props.fertileWindow}
  />
</div>
```

- [ ] **Step 5: Run the focused dashboard test**

Run: `npx vitest run src/components/dashboard/DashboardExperience.test.tsx`

Expected: PASS with the new hero hierarchy and action presence intact.

- [ ] **Step 6: Lint the dashboard files**

Run: `npm run lint -- src/app/(app)/page.tsx src/components/dashboard/DashboardHeroSurface.tsx src/components/dashboard/DashboardSnapshotRail.tsx src/components/dashboard/DashboardExperience.tsx src/components/dashboard/PeriodQuickActions.tsx src/components/dashboard/DashboardExperience.test.tsx`

Expected: exit code `0`.

## Task 4: Redesign The Daily Log As A Guided Premium Check-In

**Files:**
- Modify: `src/components/log/DailyLogForm.tsx`
- Modify: `src/components/log/ChoicePillGroup.tsx`
- Modify: `src/components/log/LogSection.tsx`
- Modify: `src/components/log/SymptomCard.tsx`
- Modify: `src/components/log/DailyLogForm.test.tsx`
- Modify: `src/app/(app)/log/page.tsx`

- [ ] **Step 1: Extend the daily-log test with the guided-shell expectation**

```tsx
it("renders the log as a guided check-in with one sticky primary action", async () => {
  render(
    <DailyLogForm
      initial={{
        date: "2026-04-14",
        flow: "",
        mood: "",
        notes: "",
        bbt: "",
        mucusType: "",
        sex: null,
        contraception: "",
        selectedPredefined: {},
        selectedCustom: {},
      }}
      definitions={[
        { key: "cramps", label: "Cramps", category: "pain" },
        { key: "bloating", label: "Bloating", category: "body" },
      ]}
      existingCustomSymptoms={[]}
    />
  );

  expect(screen.getByText("Check-in progress")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Body signals" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Save log" })).toBeInTheDocument();
  expect(screen.getByTestId("sticky-log-actions")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the daily-log test to verify it fails**

Run: `npx vitest run src/components/log/DailyLogForm.test.tsx`

Expected: FAIL once the test expects the new compact hierarchy and guided-shell treatment.

- [ ] **Step 3: Rework `ChoicePillGroup.tsx` and `LogSection.tsx` into softer tactile controls**

```tsx
// ChoicePillGroup.tsx
className={cn(
  "rounded-[22px] border px-4 py-2.5 text-sm font-medium transition-all duration-200",
  active
    ? "border-transparent bg-[linear-gradient(180deg,#8ea0ff,#7387ff)] text-white shadow-[0_18px_34px_rgba(118,139,255,0.32)]"
    : "border-white/70 bg-[color:var(--paper-strong)] text-[color:var(--foreground)] [box-shadow:var(--shadow-soft),var(--shadow-inset)]"
)}
```

```tsx
// LogSection.tsx
<section className="rounded-[34px] border border-white/60 bg-[color:var(--paper-strong)] p-5 shadow-[var(--shadow-soft)] [box-shadow:var(--shadow-soft),var(--shadow-inset)] sm:p-6">
  <div className="mb-4 space-y-1">
    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">{title}</p>
    <p className="text-sm leading-6 text-[color:var(--ink-soft)]">{description}</p>
  </div>
  {children}
</section>
```

- [ ] **Step 4: Refactor `DailyLogForm.tsx` into a quieter "now / signals / symptoms / notes" flow**

```tsx
<div className="space-y-5 pb-28">
  <Card variant="hero">
    <CardContent className="space-y-4 pt-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">Check-in</p>
          <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[color:var(--foreground)]">{completedSections} of {progressItems.length} areas captured</h2>
          <p className="text-sm leading-6 text-[color:var(--ink-soft)]">A guided daily check-in with one clear action at the bottom.</p>
        </div>
        <div className="rounded-full bg-[color:var(--paper-muted)] px-4 py-2 text-sm font-medium text-[color:var(--foreground)]">{date}</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {progressItems.map((item) => (
          <div key={item.label} className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--ink-soft)]">{item.label}</p>
            <p className="mt-2 text-sm font-medium text-[color:var(--foreground)]">{item.done ? item.hint : "Open"}</p>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
  <LogSection title="Flow" description="Choose the intensity that best fits today." />
  <LogSection title="Mood" description="Capture the overall tone of the day." />
  <LogSection title="Body signals" description="Track advanced fertility and body cues when you want a deeper daily record." />
  <LogSection title="Symptoms" description="Tap a symptom to include it, then set the severity." />
  <LogSection title="Notes" description="Capture anything that will matter later." />
</div>
```

- [ ] **Step 5: Run the daily-log tests**

Run: `npx vitest run src/components/log/DailyLogForm.test.tsx`

Expected: PASS with the guided-shell expectations and existing form behavior still intact.

- [ ] **Step 6: Lint the log files**

Run: `npm run lint -- src/app/(app)/log/page.tsx src/components/log/DailyLogForm.tsx src/components/log/ChoicePillGroup.tsx src/components/log/LogSection.tsx src/components/log/SymptomCard.tsx src/components/log/DailyLogForm.test.tsx`

Expected: exit code `0`.

## Task 5: Apply The Premium System To Insights And AI Analytics

**Files:**
- Create: `src/components/insights/InsightsSummary.test.tsx`
- Modify: `src/components/insights/InsightsSummary.tsx`
- Modify: `src/components/insights/InsightChartCard.tsx`
- Modify: `src/app/(app)/insights/page.tsx`
- Modify: `src/components/ai-analytics/AIAnalyticsExperience.tsx`
- Modify: `src/components/ai-analytics/MonthlySummaryCard.tsx`
- Modify: `src/components/ai-analytics/AIStreamingCard.tsx`
- Modify: `src/components/ai-analytics/AIAnalyticsExperience.test.tsx`
- Modify: `src/app/(app)/ai-analytics/page.tsx`

- [ ] **Step 1: Add the failing insights-summary test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { InsightsSummary } from "@/components/insights/InsightsSummary";

describe("InsightsSummary", () => {
  it("renders a concise hero strip with summary metrics and one interpretation surface", () => {
    render(
      <InsightsSummary
        typicalCycle="34 days"
        typicalPeriod="5 days"
        variability="Moderate"
        averageMood="3.5 / 5"
        highlight="Recent cycles are steady enough for trend reading."
      />
    );

    expect(screen.getByText("34 days")).toBeInTheDocument();
    expect(screen.getByText("Recent cycles are steady enough for trend reading.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the insights and AI analytics tests to verify the redesign expectations fail**

Run: `npx vitest run src/components/insights/InsightsSummary.test.tsx src/components/ai-analytics/AIAnalyticsExperience.test.tsx`

Expected: FAIL because the current summaries and AI workspace still use the older, denser layout.

- [ ] **Step 3: Simplify `InsightsSummary.tsx` and `InsightChartCard.tsx`**

```tsx
// InsightsSummary.tsx
<section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
  <Card variant="hero">
    <CardContent className="grid gap-4 pt-6 sm:grid-cols-4">
      {[
        { label: "Typical cycle", value: typicalCycle },
        { label: "Typical period", value: typicalPeriod },
        { label: "Variability", value: variability },
        { label: "Average mood", value: averageMood },
      ].map((metric) => (
        <div key={metric.label} className="rounded-[24px] bg-[color:var(--paper-muted)] p-4">
          <p className="text-sm text-[color:var(--ink-soft)]">{metric.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">{metric.value}</p>
        </div>
      ))}
    </CardContent>
  </Card>
  <Card variant="panel">
    <CardContent className="space-y-3 pt-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">Interpretation</p>
      <p className="text-base leading-7 text-[color:var(--foreground)]">{highlight}</p>
    </CardContent>
  </Card>
</section>
```

```tsx
// InsightChartCard.tsx
<Card variant="panel" className="overflow-hidden">
  <CardHeader className="pb-2">
    <CardTitle className="text-xl tracking-[-0.03em]">{title}</CardTitle>
    <CardDescription>{description}</CardDescription>
  </CardHeader>
  <CardContent className="pt-2">{children}</CardContent>
</Card>
```

- [ ] **Step 4: Refactor the AI workspace into a calmer premium assistant surface**

```tsx
// AIAnalyticsExperience.tsx
<PageIntro
  eyebrow="AI analyst"
  title={monthContext.monthLabel}
  description="A quieter monthly read grounded in your actual logs."
  meta={
    <>
      <span>{initialData.logging.loggedDays} logged days</span>
      <span>{initialData.cycles.count} cycle events</span>
    </>
  }
/>
<div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
  <MonthlySummaryCard active={analysisTriggered} monthParam={monthContext.monthParam} monthLabel={monthContext.monthLabel} />
  <Card variant="panel">
    <CardContent className="space-y-4 pt-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">Month readiness</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-4">
          <p className="text-sm text-[color:var(--ink-soft)]">Coverage</p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">{initialData.logging.loggedDays} of {initialData.logging.daysInRange} days</p>
        </div>
        <div className="rounded-[24px] bg-[color:var(--paper-muted)] p-4">
          <p className="text-sm text-[color:var(--ink-soft)]">Consistency</p>
          <p className="mt-2 text-lg font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">{initialData.logging.consistency.toFixed(0)}%</p>
        </div>
      </div>
      <Button type="button" onClick={() => setAnalysisTriggered(true)}>
        Run monthly AI analysis
      </Button>
    </CardContent>
  </Card>
</div>
```

```tsx
// MonthlySummaryCard.tsx
<Card variant="hero">
  <CardContent className="space-y-4 pt-6">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">Month recap</p>
        <h3 className="text-2xl font-semibold tracking-[-0.04em] text-[color:var(--foreground)]">{monthLabel}</h3>
      </div>
      {cached ? <Badge variant="muted">Cached</Badge> : null}
    </div>
    <div className="rounded-[26px] bg-[color:var(--paper-muted)] p-5 text-sm leading-7 text-[color:var(--foreground)] whitespace-pre-wrap">
      {summary || "Run the analysis to generate a fresh monthly recap."}
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 5: Run the focused insights and AI tests**

Run: `npx vitest run src/components/insights/InsightsSummary.test.tsx src/components/ai-analytics/AIAnalyticsExperience.test.tsx src/components/ai-analytics/AIQuestionCard.test.tsx src/components/ai-analytics/AIStreamingCard.test.tsx`

Expected: PASS with the new premium layout while preserving month-aware and streaming behavior.

- [ ] **Step 6: Lint the insights and AI files**

Run: `npm run lint -- src/app/(app)/insights/page.tsx src/components/insights/InsightsSummary.tsx src/components/insights/InsightChartCard.tsx src/components/insights/InsightsSummary.test.tsx src/app/(app)/ai-analytics/page.tsx src/components/ai-analytics/AIAnalyticsExperience.tsx src/components/ai-analytics/MonthlySummaryCard.tsx src/components/ai-analytics/AIStreamingCard.tsx src/components/ai-analytics/AIAnalyticsExperience.test.tsx`

Expected: exit code `0`.

## Task 6: Finish Calendar, Reports, And Settings In The Same Visual Language

**Files:**
- Modify: `src/components/calendar/CalendarExperience.tsx`
- Modify: `src/components/calendar/CalendarLegend.tsx`
- Modify: `src/components/calendar/CalendarMonthGrid.tsx`
- Modify: `src/components/calendar/CalendarDayDetail.tsx`
- Modify: `src/components/calendar/CalendarExperience.test.tsx`
- Modify: `src/app/(app)/calendar/page.tsx`
- Modify: `src/components/reports/ReportDownloadForm.tsx`
- Modify: `src/components/reports/RangePresetPills.tsx`
- Modify: `src/components/reports/ReportDownloadForm.test.tsx`
- Modify: `src/app/(app)/reports/page.tsx`
- Modify: `src/components/settings/SettingsClient.tsx`
- Modify: `src/components/settings/SettingsSection.tsx`
- Modify: `src/components/settings/SettingsClient.test.tsx`
- Modify: `src/app/(app)/settings/page.tsx`

- [ ] **Step 1: Extend the calendar test to the premium control language**

```tsx
expect(screen.getByRole("link", { name: "Month view" })).toBeInTheDocument();
expect(screen.getByRole("link", { name: "Cycle view" })).toHaveAttribute("aria-current", "page");
expect(screen.getByText("April 2026")).toBeInTheDocument();
expect(screen.getByText("Current cycle view")).toBeInTheDocument();
expect(screen.getByRole("button", { name: "Open calendar actions" })).toBeInTheDocument();
```

- [ ] **Step 2: Run the calendar, reports, and settings tests to verify they fail**

Run: `npx vitest run src/components/calendar/CalendarExperience.test.tsx src/components/reports/ReportDownloadForm.test.tsx src/components/settings/SettingsClient.test.tsx`

Expected: at least one FAIL because the older shells and copy remain in place.

- [ ] **Step 3: Refactor the calendar surfaces into one premium month workspace**

```tsx
// CalendarLegend.tsx
<div className="flex flex-wrap gap-2">
  <Badge variant="period">Period</Badge>
  <Badge variant="warning">Predicted</Badge>
  <Badge variant="success">Fertile</Badge>
  <Badge variant="muted">Today</Badge>
</div>
```

```tsx
// CalendarExperience.tsx
<Card variant="hero">
  <CardContent className="space-y-5 pt-6">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[color:var(--ink-soft)]">Calendar</p>
        <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[color:var(--foreground)]">{props.monthLabel}</h2>
      </div>
      <div className="flex items-center gap-2">
        <Link href={props.prevHref} className="inline-flex h-11 items-center rounded-full bg-[color:var(--paper-muted)] px-4 text-sm font-medium text-[color:var(--foreground)]">
          Previous
        </Link>
        <Link href={props.todayHref} className="inline-flex h-11 items-center rounded-full bg-[color:var(--paper-muted)] px-4 text-sm font-medium text-[color:var(--foreground)]">
          Today
        </Link>
        <Link href={props.nextHref} className="inline-flex h-11 items-center rounded-full bg-[color:var(--brand)] px-4 text-sm font-medium text-white">
          Next
        </Link>
      </div>
    </div>
    <CalendarLegend />
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">Period days</p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">{props.monthSummary.periodDays}</p>
      </div>
      <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">Predicted days</p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">{props.monthSummary.predictedDays}</p>
      </div>
      <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">Fertile days</p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">{props.monthSummary.fertileDays}</p>
      </div>
    </div>
  </CardContent>
</Card>
```

- [ ] **Step 4: Refactor reports and settings into cleaner premium zones**

```tsx
// ReportDownloadForm.tsx
<Card variant="hero">
  <CardContent className="space-y-5 pt-6">
    <RangePresetPills
      today={today}
      onApply={({ from: nextFrom, to: nextTo }) => {
        setFrom(nextFrom);
        setTo(nextTo);
      }}
    />
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="from">From</Label>
        <Input id="from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="to">To</Label>
        <Input id="to" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
      </div>
    </div>
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">Range span</p>
        <p className="mt-2 text-lg font-semibold text-[color:var(--foreground)]">{rangeDays !== null ? `${rangeDays} days` : "Invalid range"}</p>
      </div>
      <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">Includes</p>
        <p className="mt-2 text-sm font-medium text-[color:var(--foreground)]">Cycle stats, symptom frequency, notes, and exported charts</p>
      </div>
      <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">Best for</p>
        <p className="mt-2 text-sm font-medium text-[color:var(--foreground)]">Monthly review, sharing with clinicians, and personal archives</p>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-3">
      <a
        href={invalidRange ? undefined : href}
        aria-disabled={invalidRange}
        className={invalidRange ? "pointer-events-none inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--paper-muted)] px-5 text-sm font-medium text-[color:var(--ink-soft)]" : "inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--brand)] px-5 text-sm font-medium text-white shadow-[0_20px_40px_rgba(118,139,255,0.34)]"}
      >
        Download PDF
      </a>
      <a
        href={invalidRange ? undefined : href}
        target="_blank"
        rel="noreferrer"
        aria-disabled={invalidRange}
        className={invalidRange ? "pointer-events-none text-sm font-medium text-[color:var(--ink-soft)]" : "text-sm font-medium text-[color:var(--brand)]"}
      >
        Open in new tab
      </a>
    </div>
  </CardContent>
</Card>
```

```tsx
// SettingsClient.tsx
<div className="space-y-5 pb-28">
  <Card variant="hero">
    <CardContent className="grid gap-3 pt-6 sm:grid-cols-3">
      <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">Goal</p>
        <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">{goalMode === "track" ? "Track periods" : goalMode === "conceive" ? "Trying to conceive" : "Avoid pregnancy"}</p>
      </div>
      <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">Cycle defaults</p>
        <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">{cycleLengthTypical} day cycle | {periodLengthTypical} day period</p>
      </div>
      <div className="rounded-[22px] bg-[color:var(--paper-muted)] px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-soft)]">Custom symptoms</p>
        <p className="mt-2 text-base font-semibold text-[color:var(--foreground)]">{symptoms.length} saved</p>
      </div>
    </CardContent>
  </Card>
  <SettingsSection title="Profile" description="Minimal personal context for a better fit." />
  <SettingsSection title="Cycle preferences" description="Defaults aligned to your current rhythm." />
  <SettingsSection title="Custom symptoms" description="Manage your private symptom vocabulary." />
  <SettingsSection title="AI preferences" description="Choose tone, privacy, and emotional support." />
  <SettingsSection title="Privacy" description="Delete your account and stored records." danger />
</div>
```

- [ ] **Step 5: Run the focused calendar, reports, and settings tests**

Run: `npx vitest run src/components/calendar/CalendarExperience.test.tsx src/components/reports/ReportDownloadForm.test.tsx src/components/settings/SettingsClient.test.tsx`

Expected: PASS with the redesigned shells and preserved interaction behavior.

- [ ] **Step 6: Lint the remaining route and component files**

Run: `npm run lint -- src/app/(app)/calendar/page.tsx src/components/calendar/CalendarExperience.tsx src/components/calendar/CalendarLegend.tsx src/components/calendar/CalendarMonthGrid.tsx src/components/calendar/CalendarDayDetail.tsx src/components/calendar/CalendarExperience.test.tsx src/app/(app)/reports/page.tsx src/components/reports/ReportDownloadForm.tsx src/components/reports/RangePresetPills.tsx src/components/reports/ReportDownloadForm.test.tsx src/app/(app)/settings/page.tsx src/components/settings/SettingsClient.tsx src/components/settings/SettingsSection.tsx src/components/settings/SettingsClient.test.tsx`

Expected: exit code `0`.

## Task 7: Final Copy, Motion, Accessibility, And Verification Pass

**Files:**
- Modify: all touched UI files from Tasks 1-6

- [ ] **Step 1: Search for broken encoding artifacts and old over-explainer copy**

Run:

```powershell
Get-ChildItem 'E:\A Project\periods\src' -Recurse -File |
  Select-String -Pattern 'Â|â€™|â€œ|â€|â€¢|Adaptive cycle tracking with a premium control surface and clearer mobile workflow'
```

Expected: no matches.

- [ ] **Step 2: Add the final motion utilities only after layouts are stable**

```css
@keyframes surface-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-surface-enter {
  animation: surface-enter 360ms ease-out both;
}
```

- [ ] **Step 3: Run the full lint suite**

Run: `npm run lint`

Expected: exit code `0`.

- [ ] **Step 4: Run the full test suite**

Run: `npm run test -- --run`

Expected: all tests pass.

- [ ] **Step 5: Run the production build**

Run: `npm run build`

Expected: exit code `0`.

- [ ] **Step 6: Perform a manual visual pass on the flagship screens**

Use this checklist:

```text
- Dashboard reads in five seconds without reading long paragraphs.
- Log page feels guided and the sticky action dock is clean on mobile.
- Insights top section shows summary before charts.
- AI analytics feels calmer and easier to scan.
- Calendar states remain distinguishable without relying only on color.
- Reports and settings match the same premium shell.
```

Expected: all six checks pass before closing the task.

## Self-Review

- **Spec coverage:** Shared tokens and component language are covered by Task 1. Shell and navigation are covered by Task 2. Dashboard is covered by Task 3. Daily log is covered by Task 4. Insights and AI analytics are covered by Task 5. Calendar, reports, and settings are covered by Task 6. Copy reduction, motion, accessibility, and full verification are covered by Task 7.
- **Placeholder scan:** This plan contains no `TODO`, `TBD`, `implement later`, or "similar to Task N" shortcuts. Each code-changing step includes explicit code snippets or concrete structure.
- **Type consistency:** Component names stay consistent across tasks: `OrbButton`, `DashboardHeroSurface`, `DashboardSnapshotRail`, `InsightsSummary`, `AIAnalyticsExperience`, `CalendarExperience`, `ReportDownloadForm`, and `SettingsClient`.
