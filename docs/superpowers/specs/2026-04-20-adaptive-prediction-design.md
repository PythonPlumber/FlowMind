# Adaptive Real-Time Prediction System

**Date:** 2026-04-20
**Status:** Implemented

## Overview

The prediction engine was upgraded from a static, default-based system to an adaptive system that layers real-time daily log signals (BBT, cervical mucus, mood, flow) on top of period anchor data to produce more accurate cycle predictions.

## Problem

Previous system used hardcoded assumptions (28-day cycle, 14-day luteal phase) and fell back to profile defaults when actual data was insufficient. This ignored valuable signals from daily logs.

## Solution

### Core Philosophy

1. **Period dates are the anchor** - only definitive hormonal event
2. **Daily log signals refine the anchor** - BBT, mucus, mood, flow add precision
3. **Discrepancies are detected and handled** - when logs contradict predictions, system adjusts and flags
4. **Confidence reflects data quality** - multi-signal data = higher confidence

### Data Sources & Signals

| Data | Signal | Purpose |
|------|--------|---------|
| Period start/end | Cycle anchor | Primary - establishes boundaries |
| BBT | Ovulation day | Most reliable - thermal shift indicates ovulation |
| Cervical mucus | Fertile window | Eggwhite = peak, creamy/watery = approaching |
| Mood | Phase transitions | Sharp changes indicate hormonal shifts |
| Flow | Period confirmation | Spotting may indicate period approaching |

### Algorithm: 5-Layer Refinement

**Layer 1: Period-Based Base Calculation**
- Calculate cycle lengths from period dates
- Compute weighted median (recency-biased)
- Baseline prediction for next period start

**Layer 2: BBT Ovulation Detection**
- Detect BBT spike: 0.2-0.5°F rise sustained 3+ days
- If detected: actual ovulation = first high BBT day - 1
- Calculate actual luteal length = period start - ovulation day
- Use actual luteal length for future predictions (not assumed 14 days)

**Layer 3: Mucus Pattern Confirmation**
- Eggwhite mucus within 1 day of BBT-confirmed ovulation = confirms
- Creamy→watery→eggwhite progression = approaching ovulation signal
- If no BBT but eggwhite mucus = strong ovulation evidence

**Layer 4: Discrepancy Detection & Adjustment**
- Predicted vs evidence-based ovulation compared
- If discrepancy found:
  - Adjust prediction to match evidence
  - Flag the adjustment with explanation
  - Reduce confidence by 15-25% depending on data quality

**Layer 5: Confidence Scoring**

```
Final Confidence =
  Base Score
  + BBT data present (3+ cycles) → +15%
  + BBT shows consistent pattern → +10%
  + Mucus confirms BBT → +5%
  - Major discrepancy (prediction vs evidence) → -20%
  - High cycle variability → -15%
  - Less than 3 cycles history → -10%
```

## Implementation

### New Types Added

**OvulationEvidence** - Records detected ovulation with source
**PredictionDiscrepancy** - Tracks differences between predicted and actual
**ConfidenceBreakdown** - Shows confidence components for transparency

### Modified Files

1. `src/lib/predictions.ts` - Core engine with adaptive logic
2. `src/types/predictions.ts` - New type definitions
3. `src/lib/cycleVisualization.ts` - Updated to display discrepancy flags
4. `src/components/dashboard/DashboardHeroSurface.tsx` - Shows adjustment indicators
5. `src/components/calendar/CalendarDayDetail.tsx` - Shows BBT/mucus evidence on days

### Key Functions Added

- `detectBBTOvulation()` - Analyzes BBT data for thermal shift
- `detectMucusOvulation()` - Checks for eggwhite mucus patterns
- `detectOvulationEvidence()` - Combines BBT and mucus signals
- `adjustPredictionFromEvidence()` - Applies evidence to refine prediction
- `calculateAdaptiveConfidence()` - Computes confidence from data quality

## Behavior

### When Actual Data Contradicts Prediction

1. **Adjustment made**: Prediction shifts to match evidence, flag shown
2. **User sees**: "Adjusted from BBT data" or "Contradicted by logs"
3. **Confidence**: Reduced proportionally to discrepancy magnitude

### Example: BBT Shows Day 16 Ovulation, Prediction Said Day 14

1. System detects BBT thermal shift on Day 16
2. Calculates actual luteal phase = 12 days (not assumed 14)
3. Adjusts next period prediction: ovulation Day 16 + 12 day luteal = Day 28
4. Flags: "Cycle adjusted based on BBT data"
5. Confidence: reduced by 20%

### Example: Eggwhite Mucus on Day 20 (Prediction Said Fertile Ended Day 16)

1. System detects eggwhite mucus evidence
2. Shows discrepancy warning: "Prediction conflict"
3. Does NOT override - shows both predictions with confidence weights
4. User sees: "Predicted ovulation: Day 14 (low confidence) but eggwhite mucus on Day 20 suggests late ovulation"

## Backward Compatibility

- If no daily logs exist, falls back to period-only calculation
- If BBT/mucus logs insufficient for detection, uses standard prediction
- All existing tests pass with updated confidence thresholds