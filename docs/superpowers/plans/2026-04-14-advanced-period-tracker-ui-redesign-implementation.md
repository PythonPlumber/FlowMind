# Advanced Period Tracker UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing authenticated period tracker into a premium wellness cockpit with denser insights, stronger hierarchy, richer interactions, and more advanced visual elements while preserving the current data model and routes.

**Architecture:** Keep server-side data fetching in the route files, but extract presentation into smaller UI components and helper functions so the redesign is testable. Build the shared visual system first, then rebuild the app shell, then redesign each route on top of those primitives.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Vitest, Testing Library, Recharts, lucide-react.

---

## File Structure

- Modify: `package.json`, `vitest.config.ts`, `src/app/globals.css`
- Create: `src/test/setup.ts`, `src/components/ui/native-select.tsx`, `src/components/ui/page-intro.tsx`
- Modify: `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/badge.tsx`, `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`
- Modify: `src/app/(app)/layout.tsx`, `src/components/nav/AppNav.tsx`, `src/components/nav/UserMenu.tsx`
- Create: dashboard, calendar, insights, report, and settings view helpers/components as needed during route rewrites
- Test: `src/components/ui/primitives.test.tsx`, `src/lib/calendar.test.ts`, `src/lib/insights.test.ts`, route-level component tests for interactive client components when behavior changes materially

## Task 1: Shared UI Foundation

**Files:** `package.json`, `vitest.config.ts`, `src/test/setup.ts`, `src/app/globals.css`, `src/components/ui/*`, `src/components/ui/primitives.test.tsx`

- [ ] **Step 1: Add UI test dependencies**

```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Write the failing primitives test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";

describe("premium primitives", () => {
  it("supports hero card, brand button, and premium select styling", () => {
    render(
      <div>
        <Card variant="hero">Hero</Card>
        <Button variant="brand">Track today</Button>
        <NativeSelect aria-label="Goal">
          <option>Track</option>
        </NativeSelect>
      </div>
    );

    expect(screen.getByText("Hero").closest("[data-card-variant]")).toHaveAttribute("data-card-variant", "hero");
    expect(screen.getByRole("button", { name: "Track today" })).toHaveAttribute("data-variant", "brand");
    expect(screen.getByRole("combobox", { name: "Goal" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run the test and watch it fail**

```bash
npx vitest run src/components/ui/primitives.test.tsx
```

Expected: FAIL because `NativeSelect` and the new variant API do not exist yet.

- [ ] **Step 4: Implement design tokens and premium primitives**

```tsx
// Add `variant="hero" | "panel" | "danger"` to Card and `variant="brand" | "secondary" | "outline" | "ghost" | "destructive"` to Button.
// Add `data-card-variant` and `data-variant` attributes for test visibility.
// Create `NativeSelect` as a styled wrapper around the native select element.
// Move the color system in globals.css to porcelain / oxblood / champagne / sage / amber tokens.
```

- [ ] **Step 5: Verify**

```bash
npx vitest run src/components/ui/primitives.test.tsx
npm run lint -- src/components/ui/button.tsx src/components/ui/card.tsx src/components/ui/badge.tsx src/components/ui/input.tsx src/components/ui/textarea.tsx src/components/ui/native-select.tsx src/components/ui/primitives.test.tsx
```

## Task 2: App Shell and Navigation

**Files:** `src/app/(app)/layout.tsx`, `src/components/nav/AppNav.tsx`, `src/components/nav/UserMenu.tsx`, `src/components/ui/page-intro.tsx`

- [ ] **Step 1: Add a failing nav/header test**
- [ ] **Step 2: Rebuild the shell with a sticky glass nav, active-route states, and a reusable `PageIntro` header component**
- [ ] **Step 3: Verify with** `npx vitest run src/components/nav/AppNav.test.tsx`

## Task 3: Dashboard, Calendar, and Daily Log

**Files:** route files in `src/app/(app)`, new components under `src/components/dashboard`, `src/components/calendar`, `src/components/log`, helper under `src/lib/calendar.ts`

- [ ] **Step 1: Dashboard**
  - Write a failing render test for a new dashboard presentation component.
  - Add a hero, metric strip, progress bars, phase strip, richer quick actions, and a stronger fertility disclaimer block.
- [ ] **Step 2: Calendar**
  - Write `src/lib/calendar.test.ts` first.
  - Extract calendar cell building into `src/lib/calendar.ts`.
  - Add a split view with legend, selected-day inspector, stronger state layering, and cleaner month controls.
- [ ] **Step 3: Daily log**
  - Write a failing interaction test for the redesigned `DailyLogForm`.
  - Replace long utility sections with guided sections, pill selectors, symptom cards, severity controls, and a sticky mobile save bar.
- [ ] **Step 4: Verify**

```bash
npx vitest run src/components/dashboard/DashboardExperience.test.tsx src/lib/calendar.test.ts src/components/log/DailyLogForm.test.tsx src/lib/predictions.test.ts
npm run lint -- src/app/(app)/page.tsx src/app/(app)/calendar/page.tsx src/app/(app)/log/page.tsx src/components/dashboard src/components/calendar src/components/log src/lib/calendar.ts
```

## Task 4: Insights, Reports, and Settings

**Files:** `src/app/(app)/insights/page.tsx`, `src/components/insights/*`, `src/lib/insights.ts`, `src/app/(app)/reports/page.tsx`, `src/components/reports/*`, `src/app/(app)/settings/page.tsx`, `src/components/settings/*`

- [ ] **Step 1: Insights**
  - Write `src/lib/insights.test.ts` first.
  - Add summary metrics, interpretation copy, stronger chart containers, and more polished tooltip styling.
- [ ] **Step 2: Reports**
  - Write a failing preset-range test for `ReportDownloadForm`.
  - Add range presets, export summary copy, and a more premium CTA area.
- [ ] **Step 3: Settings**
  - Write a failing render test for the reorganized `SettingsClient`.
  - Split the page into Profile, Cycle Preferences, Custom Symptoms, and Privacy sections with improved hierarchy.
- [ ] **Step 4: Verify**

```bash
npx vitest run src/lib/insights.test.ts src/components/reports/ReportDownloadForm.test.tsx src/components/settings/SettingsClient.test.tsx
npm run lint -- src/app/(app)/insights/page.tsx src/components/insights src/lib/insights.ts src/app/(app)/reports/page.tsx src/components/reports src/app/(app)/settings/page.tsx src/components/settings
```

## Task 5: Final Pass

**Files:** all touched UI files

- [ ] **Step 1: Search for encoding artifacts**

```bash
Get-ChildItem 'E:\A Project\periods\src' -Recurse -File | Select-String -Pattern 'Â|â€™|â€œ|â€|â€¢'
```

Expected: no matches after cleanup.

- [ ] **Step 2: Full verification**

```bash
npm run lint
npm run test
npm run build
```

Expected: all commands exit with code `0`.

## Self-Review

- Shared design system and app shell are covered by Task 1 and Task 2.
- Dashboard, calendar, and log redesign are covered by Task 3.
- Insights, reports, and settings redesign are covered by Task 4.
- Copy cleanup, encoding fixes, and final verification are covered by Task 5.
- Naming stays consistent across the plan: `PageIntro`, `NativeSelect`, `buildCalendarMonth`, and `buildInsightsSummary` are the shared interfaces referenced later.
