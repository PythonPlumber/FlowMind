# FlowMind — Advanced Period & Fertility Tracker

A mobile-first, AI-powered period tracking application built with Next.js 16.2.4, featuring adaptive real-time predictions, multi-signal ovulation detection, comprehensive health insights, and long-term pattern recognition.

> **Disclaimer**: Fertility and cycle predictions are estimates only. Not medical advice and not birth control. Always consult a healthcare provider for medical concerns.

---

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Architecture](#architecture)
4. [Getting Started](#getting-started)
5. [Advanced Analytics Engine](#advanced-analytics-engine)
6. [Prediction Algorithms](#prediction-algorithms)
7. [Data Models](#data-models)
8. [API Routes](#api-routes)
9. [Components](#components)
10. [Environment Variables](#environment-variables)
11. [Scripts](#scripts)
12. [Development](#development)
13. [Deployment](#deployment)
14. [Health & Privacy](#health--privacy)

---

## Features

### Core Tracking
- **Period Logging**: Track period start/end dates with flow intensity
- **Daily Logs**: Flow, mood (1-5), BBT, cervical mucus, notes, symptoms, sexual activity
- **Predefined Symptoms**: 20+ default symptoms categorized by body area
- **Custom Symptoms**: User-defined symptom labels
- **Calendar View**: Visual month view with actual periods + predicted windows

### Adaptive Prediction Engine
- **Real-time Calculation**: Uses actual logged data instead of static defaults
- **Weighted Median**: Recency-biased cycle length calculation
- **Standard Deviation**: Variability detection for confidence scoring
- **Multi-Phase Support**: 7 distinct cycle phases with detailed tracking

### Multi-Signal Ovulation Fusion
- **BBT Thermal Shift Detection**: Identifies 0.2-0.5°F sustained rise
- **Cervical Mucus Analysis**: Eggwhite = peak fertility signal
- **Mood Spike Detection**: Z-score analysis for energy shifts
- **Secondary Fertility Signs**: Sexual activity correlation
- **Bayesian Inference**: Weighted combination of all signals

### Anomaly Detection System
- **Breakthrough Bleeding**: Spotting outside predicted window
- **Unusual Flow Intensity**: Heavy flow deviation detection
- **Cycle Shape Analysis**: Z-score classification (typical/delayed/early/skipped)
- **Skipped Period Detection**: Extended cycle warnings
- **Early/Late Ovulation Flags**: Prediction discrepancy alerts

### Cycle Health Scoring (0-100)
- **Regularity Score**: Cycle length consistency
- **Flow Normalcy Score**: Period intensity patterns
- **Symptom Consistency Score**: Same symptoms per phase
- **Data Completeness Score**: Logging frequency
- **Anomaly Penalty**: Deviation from baseline

### Temporal Symptom Patterns
- **"X Days Before Period" Analysis**: Pattern timing identification
- **Occurrence Rate**: Percentage of cycles with pattern
- **Consistency Score**: Standard deviation of timing
- **Typical Severity**: Average intensity per pattern
- **Confidence Weighting**: Based on data quality

### Predictive Comfort Index
- **Energy Level**: Phase-based prediction (1-5)
- **Bloating Likelihood**: Percentage chance
- **Cramp Probability**: Percentage chance
- **Mood Tendency**: Average mood by phase
- **Breast Tenderness Risk**: Percentage risk
- **Personalized Suggestions**: Actionable recommendations

### Long-Term Trend Analysis
- **Cycle Length Drift**: Gradual lengthening/shortening over months
- **Seasonality Detection**: Winter vs summer cycle patterns
- **Stress Correlation**: Life event impact analysis
- **Luteal Phase Change**: Progesterone phase tracking
- **Variability Trend**: Increasing/decreasing stability

### Health Indicator Flags
- **PCOS Indicators**: Irregular cycles, high variability, long cycles
- **Hypothyroid Flags**: Very long cycles, persistent fatigue
- **Perimenopause Signals**: Cycle lengthening, missed periods
- **Anovulation Patterns**: No BBT shift despite regular cycles
- **Flow Pattern Concerns**: Variable intensity tracking

### Smart Notifications
- **Period Approaching**: 3-day and 1-day warnings
- **Fertile Window Alerts**: Optimal conception timing
- **Anomaly Detected**: Significant pattern changes
- **Symptom Pattern Alerts**: "Cramps usually start tomorrow"
- **Logging Reminders**: Streak maintenance prompts

### AI Integration (NVIDIA API)
- **Pattern Detection**: AI-powered cycle analysis
- **Monthly Summaries**: Comprehensive monthly reviews
- **Symptom Suggestions**: AI-driven symptom recommendations
- **Health Coaching**: Tone-appropriate guidance
- **Streaming Responses**: Real-time AI feedback

### Data Management
- **JSON Export**: Full data backup
- **JSON Import**: Data restoration
- **Rate Limiting**: NVIDIA API protection
- **Cache System**: AI response caching

---

## Technology Stack

### Framework & Runtime
- **Next.js 16.2.4** — App Router, Server Components, Server Actions
- **React 19** — Latest hooks and Server Components
- **TypeScript** — Strict mode enabled
- **Turbopack** — Default build system

### UI & Styling
- **Tailwind CSS v4** — CSS variables theming
- **CSS Variables** — Customizable color system
- **Lucide React** — Icon library
- **Radix UI** — Accessible primitives
- **Framer Motion** — Animations

### Database & Auth
- **MongoDB** — Primary database
- **Mongoose** — ODM with TypeScript support
- **NextAuth v4** — Authentication
- **Credentials Provider** — Email/password login

### AI & APIs
- **NVIDIA API** — AI analysis and chat
- **Server Actions** — Type-safe mutations
- **Streaming** — Real-time AI responses

### Testing & Quality
- **Vitest** — Unit testing
- **React Testing Library** — Component tests
- **ESLint** — Code linting

---

## Architecture

```
src/
├── app/                      # Next.js App Router
│   ├── (app)/               # Protected app routes
│   │   ├── page.tsx        # Dashboard
│   │   ├── calendar/       # Calendar view
│   │   ├── insights/       # Advanced analytics
│   │   ├── log/            # Daily logging
│   │   └── settings/       # User preferences
│   ├── api/                # API routes
│   │   ├── ai/             # AI endpoints
│   │   ├── auth/           # NextAuth
│   │   ├── calendar/        # ICS exports
│   │   ├── data/           # Export endpoint
│   │   └── reports/        # PDF generation
│   └── auth/               # Auth pages
├── components/              # React components
│   ├── analytics/          # Advanced UI components
│   ├── calendar/           # Calendar components
│   ├── dashboard/          # Dashboard widgets
│   ├── log/               # Logging form
│   ├── settings/          # Settings UI
│   └── ui/                # Primitives
├── lib/                    # Core libraries
│   ├── advancedAnalytics.ts # All advanced algorithms
│   ├── predictions.ts     # Prediction engine
│   ├── cycleVisualization.ts # Ring model builder
│   ├── insights.ts         # Basic insights
│   ├── dateOnly.ts        # UTC date utilities
│   ├── auth.ts            # NextAuth config
│   └── db.ts              # MongoDB connection
├── models/                 # Mongoose models
│   ├── Period.ts
│   ├── DailyLog.ts
│   ├── DailyLogSymptom.ts
│   ├── SymptomDefinition.ts
│   ├── CustomSymptom.ts
│   ├── Profile.ts
│   └── User.ts
├── actions/                # Server Actions
│   ├── account.ts
│   ├── customSymptoms.ts
│   ├── dataManagement.ts
│   ├── logging.ts
│   └── profile.ts
└── types/                  # TypeScript types
    ├── ai.ts
    └── predictions.ts
```

---

## Advanced Analytics Engine

### File: `src/lib/advancedAnalytics.ts`

All advanced algorithms are centralized in this module:

#### Multi-Signal Ovulation Fusion
```typescript
fuseOvulationSignals(logs, periodStart, assumedCycleLength)
// Returns: OvulationFusionResult with Bayesian probability
```

**Signals Combined:**
- BBT thermal shift (40% weight)
- Cervical mucus eggwhite (35% weight)
- Mood spike (15% weight)
- Secondary fertility signs (10% weight)

#### Anomaly Detection
```typescript
analyzeAnomalies(periods, logs, predictions)
// Returns: AnomalyDetectionResult[]
```

**Detects:**
- breakthrough_bleeding
- unusual_flow
- cycle_shape
- skipped_period
- early_ovulation
- late_ovulation

#### Cycle Health Scoring
```typescript
calculateCycleHealthScore(periods, logs, anomalies)
// Returns: CycleHealthScore with 0-100 overall score
```

**Components:**
- Regularity: 30% weight
- Flow Normalcy: 20% weight
- Symptom Consistency: 25% weight
- Data Completeness: 15% weight
- Anomaly Penalty: -0.5 per anomaly

#### Temporal Pattern Analysis
```typescript
analyzeTemporalSymptomPatterns(periods, logs)
// Returns: TemporalPattern[]
```

**For each symptom:**
- Average day before period
- Occurrence rate (% of cycles)
- Consistency score
- Typical severity
- Confidence level

#### Comfort Prediction
```typescript
predictComfortIndex(logs, patterns, cycleDay, phase)
// Returns: ComfortPrediction
```

**Predictions:**
- Energy level (1-5)
- Bloating likelihood (%)
- Cramp probability (%)
- Mood tendency (1-5)
- Breast tenderness risk (%)
- Overall discomfort index

#### Long-Term Trend Analysis
```typescript
analyzeLongTermTrends(periods, logs)
// Returns: LongTermTrend[]
```

**Trends Tracked:**
- cycle_length_drift
- seasonality
- stress_impact
- age_adjustment
- luteal_phase_change
- variability_trend

#### Health Indicator Flags
```typescript
detectHealthIndicatorFlags(periods, logs, healthScore)
// Returns: HealthIndicatorFlag[]
```

**Flags:**
- pcos_indicator (warning)
- hypothyroid_flag (warning)
- perimenopause_signal (info)
- anovulation_pattern (warning)
- cycle_length_concern (info)
- flow_pattern_concern (info)

#### Smart Notifications
```typescript
generateSmartNotifications(predictions, logs, anomalies, patterns)
// Returns: SmartNotification[]
```

**Types:**
- period_approaching
- fertile_window_alert
- logging_reminder
- anomaly_detected
- symptom_pattern_alert

#### Trend Analysis
```typescript
buildTrendAnalysis(periods, logs)
// Returns: TrendAnalysis
```

**Includes:**
- Cycle/period/luteal/follicular lengths
- Symptom frequency by phase
- Mood averages by phase
- Seasonal patterns
- Stress correlation
- Drift analysis

---

## Prediction Algorithms

### File: `src/lib/predictions.ts`

#### BBT Ovulation Detection
- Requires 5+ BBT readings
- Detects 0.2-0.5°F rise sustained 3+ days
- Calculates actual luteal phase length
- Returns confidence based on sustained days and magnitude

#### Cervical Mucus Detection
- Eggwhite mucus = peak fertility signal
- Watery mucus = secondary signal
- Confidence based on proximity to expected ovulation

#### Adaptive Confidence Scoring
```
Base Score: 25 (no history) or 55 (has history)
+ BBT Signal Bonus: up to +25
+ Mucus Signal Bonus: up to +15
+ Consistency Bonus: up to +10
- Discrepancy Penalty: 5-25
= Final Confidence: 15-98%
```

#### Phase Estimation
7 phases with detailed information:
1. **Menstruation** — Period days
2. **Early Follicular** — Days after period
3. **Late Follicular** — Pre-ovulation
4. **Ovulation** — Peak fertility
5. **Fertile Window** — Post-ovulation fertile
6. **Early Luteal** — Progesterone rise
7. **Late Luteal** — Pre-menstrual

---

## Data Models

### Period
```typescript
{
  userId: ObjectId
  startDate: Date
  endDate?: Date
  createdAt: Date
}
```

### DailyLog
```typescript
{
  userId: ObjectId
  logDate: Date
  mood?: number (1-5)
  bbt?: number
  flow?: "spotting" | "light" | "medium" | "heavy"
  mucusType?: "creamy" | "watery" | "eggwhite" | "sticky"
  notes?: string
  sex?: boolean
  contraception?: string
  createdAt: Date
}
```

### DailyLogSymptom
```typescript
{
  userId: ObjectId
  dailyLogId: ObjectId
  symptomKey?: string
  customSymptomId?: ObjectId
  severity?: number
}
```

### Profile
```typescript
{
  userId: ObjectId
  birthYear?: number
  cycleLengthTypical?: number
  periodLengthTypical?: number
  goalMode?: "track" | "conceive" | "avoid"
  ageGroup?: "teen" | "adult"
  aiPreferences?: {
    toneStyle: "gentle" | "encouraging" | "celebratory"
    privacyMode: "full_analysis" | "patterns_only"
    emotionalSupportLevel: "minimal" | "moderate" | "full"
  }
}
```

---

## API Routes

### AI Endpoints
- `POST /api/ai/analyze` — Cycle analysis
- `POST /api/ai/chat` — AI chat
- `POST /api/ai/monthly-summary` — Monthly summary
- `POST /api/ai/suggest-symptoms` — Symptom suggestions

### Calendar Exports
- `GET /api/calendar/next-period.ics` — Period ICS
- `GET /api/calendar/fertile-window.ics` — Fertile window ICS

### Data Management
- `GET /api/data/export` — JSON export

### Reports
- `GET /api/reports/pdf` — PDF report generation

---

## Components

### Analytics Components (`src/components/analytics/`)

| Component | Purpose |
|-----------|---------|
| `HealthScoreCard` | Visual health score with sub-metrics |
| `AnomalyAlertCard` | Anomaly display with severity badges |
| `ComfortPredictionCard` | Daily comfort predictions |
| `HealthIndicatorsPanel` | Health flags with recommendations |
| `TrendVisualization` | Long-term trend display |
| `TemporalPatternChart` | Symptom timing patterns |
| `SmartNotificationBanner` | Priority notification display |
| `CycleHealthGauge` | Circular health gauge |
| `PhaseAnalysisCard` | Phase breakdown with suggestions |

### Dashboard Components (`src/components/dashboard/`)
- `DashboardExperience` — Main dashboard
- `DashboardHeroSurface` — Hero card with predictions
- `CycleRing` — Visual cycle ring with phases

### Calendar Components (`src/components/calendar/`)
- `CalendarExperience` — Calendar page
- `CalendarDayDetail` — Day tooltip
- `CalendarDayActions` — Quick actions

### Log Components (`src/components/log/`)
- `DailyLogForm` — Daily logging form
- `ChoicePillGroup` — Pill-style select

### Settings Components (`src/components/settings/`)
- `SettingsClient` — Settings UI with data management

### UI Primitives (`src/components/ui/`)
- `Button` — Button variants
- `Card` — Card with variants
- `Input` — Form input
- `Label` — Form label
- `PageIntro` — Page header

---

## Environment Variables

Create `.env.local` based on `.env.example`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/periods

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# NVIDIA API (for AI features)
NVIDIA_API_KEY=your-nvidia-api-key
```

---

## Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack

# Production
npm run build        # Production build
npm run start        # Start production server

# Quality
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm test             # Vitest tests
```

---

## Development

### Project Structure
```
periods/
├── src/
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── lib/              # Libraries & utilities
│   ├── models/           # Mongoose models
│   ├── actions/          # Server Actions
│   └── types/            # TypeScript types
├── public/               # Static assets
├── docs/                 # Documentation
├── .env.example         # Environment template
├── package.json
└── README.md
```

### Key Files
- `src/lib/predictions.ts` — Core prediction engine
- `src/lib/advancedAnalytics.ts` — All advanced algorithms
- `src/lib/cycleVisualization.ts` — Cycle ring builder
- `src/components/analytics/AdvancedAnalytics.tsx` — UI components

### Adding Features
1. Algorithm logic → `src/lib/advancedAnalytics.ts`
2. Type definitions → `src/types/`
3. UI components → `src/components/analytics/`
4. Page integration → `src/app/(app)/insights/page.tsx`

---

## Deployment

### Requirements
- Node.js 18+
- MongoDB instance
- NVIDIA API key (optional)

### Platforms
- Vercel (recommended)
- Railway
- Render
- Any Node.js hosting

### Environment
Set environment variables in your hosting platform:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NVIDIA_API_KEY` (optional)

---

## Health & Privacy

### Medical Disclaimer
This app provides estimates and patterns only. It is not:
- Medical advice
- Birth control
- Diagnostic tool
- Replacement for professional healthcare

Always consult a healthcare provider for medical concerns.

### Data Privacy
- All data is per-user isolated
- Authentication required for all data access
- Notes can be excluded from AI analysis (privacy mode)
- Export your data anytime via Settings

### Recommendations
- Revisit policies/consent for minors
- Consider invite-only signup for public deployments
- Clear data retention policies
- GDPR compliance if applicable

---

## Version History

### v1.0 — Advanced Period Tracker
- Full-featured period tracking
- Adaptive prediction engine
- Multi-signal ovulation detection
- Comprehensive health insights
- AI-powered analytics
- Mobile-first design

---

## Credits

Built with Next.js 16.2.4, React 19, MongoDB, and NVIDIA API.

## License

Private project. All rights reserved.