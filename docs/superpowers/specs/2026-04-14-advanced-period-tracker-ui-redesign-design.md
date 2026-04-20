# Advanced Period Tracker UI Redesign

Date: 2026-04-14

## Summary

This redesign upgrades the existing period tracker from a functional dashboard into a premium wellness product with a stronger analytical edge. The target experience is a "premium wellness cockpit": calm, elegant, and emotionally safe at first glance, while still feeling advanced and insight-rich for repeat use.

The redesign does not change core product scope. It improves perceived quality, layout intelligence, visual identity, information hierarchy, and task flow across the current routes:

- `/`
- `/calendar`
- `/log`
- `/insights`
- `/reports`
- `/settings`

## Goals

- Make the app feel premium, memorable, and polished rather than default/admin-like.
- Increase clarity of the most important actions and metrics on every screen.
- Make the tracker feel more advanced without making it harder to use.
- Improve mobile ergonomics so the product feels app-like on phones.
- Create a reusable visual system so new screens inherit the same quality level.

## Non-Goals

- No new backend features or new product modules.
- No dark mode redesign in this pass.
- No feature expansion beyond the current routes and actions.
- No heavy animation system or novelty effects that distract from tracking tasks.

## Design Direction

The visual direction is "editorial wellness cockpit".

It combines:

- Luxury wellness softness: warm surfaces, emotional safety, richer layering, softer visual transitions.
- Advanced product clarity: stronger stat hierarchy, clearer data grouping, sharper chart containers, and better decision support.

This should avoid two extremes:

- Too clinical: sterile, hospital-like, cold dashboards.
- Too playful: overly cute, teen-app styling that weakens trust.

## Visual Language

### Color

The palette should move from generic white + gray into a more intentional system:

- Base background: warm porcelain / paper tones
- Primary brand: oxblood / deep rose
- Accent glow: blush / champagne highlights
- Body text: deep ink rather than pure black
- Fertility state: muted sage / emerald
- Period state: amber / warm coral
- Utility surfaces: ivory, sand, fogged white

The interface should feel warm and premium, not candy-colored.

### Typography

Typography should be more editorial and contrast-driven:

- Larger page titles with stronger personality
- Stat values that feel decisive and premium
- Supporting labels that are quieter and cleaner
- Better rhythm between heading, metadata, body copy, and helper text

Current typography is functional but too flat. The redesign should make the most important content immediately scannable.

### Surfaces

Surfaces should be more layered and tactile:

- Frosted / blurred top navigation
- Elevated cards with subtle depth, not flat white rectangles
- Occasional inner highlights or gradient edges on hero panels
- Stronger distinction between primary, secondary, and utility sections

Cards should still be reusable, but not all cards should feel visually identical.

### Motion

Motion should be subtle and meaningful:

- Page-load fade + rise
- Staggered reveal for dashboard card groups
- Smooth hover and press transitions
- Gentle chart entrance

No noisy animation, bounce effects, or novelty motion.

## UX Principles

- Lead with "today" and immediate relevance.
- Reduce form heaviness by turning repeated actions into guided interactions.
- Use progressive emphasis: the most important metric or action should dominate first, with detail revealed below.
- Keep emotional tone calm and trustworthy.
- Mobile interactions should always feel first-class, not like a squeezed desktop layout.

## Screen Designs

### Dashboard

The dashboard becomes a command center instead of a stack of simple cards.

Key changes:

- Add a large hero panel showing current phase, cycle day, next predicted period window, and confidence context.
- Introduce a tighter stat grid beneath the hero for cycle length, variability, period length, and active state.
- Add a horizontal cycle timeline or "phase strip" that visually places today inside the broader cycle.
- Turn quick actions into a more premium action cluster with stronger hierarchy and clearer CTAs.
- Keep fertility disclaimer visible but visually integrated rather than dropped as plain utility text.

Outcome:

- The home screen should feel useful and emotionally legible in the first 3 seconds.

### Calendar

The calendar should feel more immersive and more informative.

Key changes:

- Increase cell presence and visual density slightly so the grid feels intentional.
- Use layered cell states for actual period, predicted window, fertile window, and today.
- Improve legend treatment and integrate it more naturally into the screen.
- Add a selected-day or focused-day detail area to explain what happened on that date.
- Improve mobile month navigation and overall visual rhythm.

Outcome:

- The calendar should feel like a product feature, not a default date grid.

### Daily Log

The log should feel like a guided check-in instead of a long utility form.

Key changes:

- Break the page into sections such as Flow, Mood, Body, Symptoms, Notes.
- Convert symptom selection from checkbox-heavy blocks into card/chip-based interactions.
- Make severity controls clearer and less cramped.
- Improve custom symptom creation so it feels integrated into the same visual system.
- Keep the primary save action persistent or visually sticky on mobile.

Outcome:

- Logging should feel smoother, faster, and more emotionally considered.

### Insights

Insights should feel more advanced by showing meaning, not only charts.

Key changes:

- Add a top summary layer with high-value metrics before charts.
- Give each chart a stronger container with better header hierarchy.
- Add brief interpretation copy where useful, such as variability or common symptom patterns.
- Improve chart framing, grid density, and typography so data feels more premium.

Outcome:

- The page should feel like an intelligent analysis space, not a chart dump.

### Reports

Reports should feel like an export center.

Key changes:

- Improve the report page header and explain what the PDF contains.
- Add date presets or stronger range selection treatment.
- Frame the download action as a polished product feature.
- Provide better empty and loading states around export.

Outcome:

- Exporting should feel intentional and premium, not purely technical.

### Settings

Settings should be reorganized into clearer experience zones.

Key changes:

- Separate the page into Profile, Cycle Preferences, Custom Symptoms, and Privacy.
- Improve hierarchy around editable settings so the page feels less like one long form.
- Make the danger zone feel clearly separate and deliberate.
- Keep destructive actions easy to understand but hard to trigger by accident.

Outcome:

- Settings should feel trustworthy, tidy, and more mature.

## Navigation

The application shell should become a stronger brand anchor.

Key changes:

- Upgrade the sticky top bar with richer blur, better spacing, and stronger brand treatment.
- Add more obvious current-route indication.
- Improve mobile nav treatment so it feels app-like and refined.
- Ensure page headers align visually with nav rhythm across all screens.

## Shared Component Changes

The redesign should start by improving the shared primitives before rewriting page layouts.

Primary files expected to change first:

- `src/app/globals.css`
- `src/components/ui/button.tsx`
- `src/components/ui/card.tsx`
- `src/components/nav/AppNav.tsx`
- `src/app/(app)/layout.tsx`

Component-level goals:

- Buttons: more premium weight, stronger variants, better press states
- Cards: multiple depth levels and richer headers
- Badges: clearer meaning by state, more refined colors
- Inputs/selects/textarea: better focus treatment and softer premium surfaces
- Page containers: more consistent max widths, vertical spacing, and section rhythm

## Content and Copy Adjustments

The redesign should clean up awkward or visually weak copy moments while keeping the product simple.

Examples:

- Remove broken text separator or encoding artifacts such as malformed middle dots in metadata rows
- Tighten helper copy to feel more polished
- Rewrite empty states so they guide next actions clearly
- Keep fertility disclaimers visible but better integrated

## Accessibility and Usability

The redesign must preserve and improve usability:

- Maintain strong color contrast for all essential text and indicators
- Keep touch targets comfortable on mobile
- Avoid relying only on color to communicate state
- Preserve keyboard focus visibility
- Ensure charts and key status areas have readable supporting labels

## Technical Notes

- Reuse the existing Tailwind-based stack rather than introducing a new UI framework.
- Prefer component refactors over large one-off page styling blocks.
- Avoid excessive client-side motion dependencies unless clearly needed.
- Keep the redesign compatible with the current data and route structure.

## Implementation Shape

The redesign should be implemented in this order:

1. Shared visual system and app shell
2. Dashboard redesign
3. Calendar redesign
4. Daily log redesign
5. Insights redesign
6. Reports and settings polish
7. Final pass on empty states, copy, and mobile spacing

## Acceptance Criteria

- The app feels visually distinct and premium at first glance.
- Dashboard has a clearly dominant hero and stronger information hierarchy.
- Calendar is easier to scan and more visually expressive.
- Daily log feels guided and less form-heavy.
- Insights feels analytical and polished rather than plain.
- Reports and settings match the same premium visual language.
- Mobile layouts feel intentional, not compressed desktop layouts.
- Existing features continue to work without scope expansion.

## Assumptions

- The current light-mode direction remains the primary visual target.
- English remains the UI language.
- Existing routes and data structures remain in place.
- The goal is a strong visual/product redesign, not a feature rewrite.
