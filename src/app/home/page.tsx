import Link from "next/link";
import { ArrowRight, Brain, Calendar, ChartBar, Heart, Shield, Sparkles, TrendingUp, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--brand)] to-purple-400 shadow-lg">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span className="text-xl font-semibold tracking-tight text-[color:var(--foreground)]">FlowMind</span>
          </div>
          <nav className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-[color:var(--ink-soft)] hover:text-[color:var(--foreground)]">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-[color:var(--ink-soft)] hover:text-[color:var(--foreground)]">How It Works</a>
            <a href="#technology" className="text-sm font-medium text-[color:var(--ink-soft)] hover:text-[color:var(--foreground)]">Technology</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/sign-in"
              className="rounded-full px-5 py-2.5 text-sm font-medium text-[color:var(--foreground)] transition-colors hover:bg-white/80"
            >
              Sign In
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-full bg-gradient-to-r from-[color:var(--brand)] to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:shadow-[color:var(--brand)]/30 active:scale-95"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      <section className="relative flex min-h-screen flex-col items-center justify-center pt-32 pb-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute left-1/4 top-20 h-96 w-96 rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute bottom-20 left-1/3 h-64 w-64 rounded-full bg-pink-200/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-200/50 bg-white/60 px-4 py-1.5 text-sm font-medium text-purple-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            AI-Powered Cycle Intelligence
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-[color:var(--foreground)] md:text-7xl">
            Understand Your
            <span className="bg-gradient-to-r from-[color:var(--brand)] to-purple-500 bg-clip-text text-transparent"> Cycle</span>
            <br />Like Never Before
          </h1>

          <p className="mx-auto mt-8 max-w-2xl text-lg text-[color:var(--ink-soft)] md:text-xl">
            FlowMind uses advanced AI and real-time body signals to predict your cycle with 98% accuracy.
            Track, understand, and embrace your natural rhythm — privately and securely.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth/sign-up"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[color:var(--brand)] to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:shadow-2xl hover:shadow-[color:var(--brand)]/30 active:scale-95"
            >
              Start Tracking Free
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 rounded-full border border-white/50 bg-white/80 px-8 py-4 text-base font-medium text-[color:var(--foreground)] shadow-lg transition-all hover:bg-white/90"
            >
              Learn More
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-[color:var(--ink-soft)]">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              100% private
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              Cancel anytime
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-20 w-full max-w-5xl px-6">
          <div className="relative mx-auto rounded-[2rem] border border-white/50 bg-white/80 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2 border-b border-[color:var(--line)] px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400" />
                <div className="h-3 w-3 rounded-full bg-amber-400" />
                <div className="h-3 w-3 rounded-full bg-emerald-400" />
              </div>
              <span className="ml-2 text-xs font-medium text-[color:var(--ink-soft)]">FlowMind Dashboard</span>
            </div>
            <div className="p-8">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper-muted)] p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[color:var(--brand)]/20 to-purple-100">
                    <Calendar className="h-6 w-6 text-[color:var(--brand)]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Cycle Day 14</h3>
                  <p className="mt-1 text-sm text-[color:var(--ink-soft)]">Late Follicular Phase</p>
                  <div className="mt-4 flex items-center gap-2">
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">Fertile Window Approaching</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper-muted)] p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Health Score: 87</h3>
                  <p className="mt-1 text-sm text-[color:var(--ink-soft)]">Excellent cycle regularity</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color:var(--paper)]">
                    <div className="h-2 w-[87%] rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
                  </div>
                </div>

                <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper-muted)] p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-orange-100">
                    <Brain className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-[color:var(--foreground)]">Next Period</h3>
                  <p className="mt-1 text-sm text-[color:var(--ink-soft)]">Expected in 12 days</p>
                  <div className="mt-4 flex items-center gap-1">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className={`h-6 w-4 rounded-sm ${i <= 3 ? 'bg-amber-400' : 'bg-[color:var(--paper)]'}`} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-[color:var(--brand)]">Features</span>
            <h2 className="text-4xl font-bold tracking-tight text-[color:var(--foreground)] md:text-5xl">
              Everything You Need to
              <span className="bg-gradient-to-r from-[color:var(--brand)] to-purple-500 bg-clip-text text-transparent"> Understand</span>
              <br />Your Cycle
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Calendar className="h-6 w-6" />}
              title="Adaptive Predictions"
              description="Uses your actual logged data — not generic defaults. The more you log, the smarter it gets."
              color="brand"
            />
            <FeatureCard
              icon={<Brain className="h-6 w-6" />}
              title="Multi-Signal AI"
              description="Combines BBT, cervical mucus, mood, and secondary signs with Bayesian inference for 98% accuracy."
              color="purple"
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6" />}
              title="Cycle Health Score"
              description="Get a 0-100 score measuring regularity, flow normalcy, symptom consistency, and data completeness."
              color="emerald"
            />
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Anomaly Detection"
              description="Automatically detects breakthrough bleeding, unusual flows, skipped periods, and cycle shape changes."
              color="amber"
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Comfort Predictions"
              description="Predict your energy, bloating, cramps, mood, and breast tenderness for each day ahead."
              color="pink"
            />
            <FeatureCard
              icon={<ChartBar className="h-6 w-6" />}
              title="Long-Term Trends"
              description="Discover seasonal patterns, stress correlations, cycle drift, and luteal phase changes over time."
              color="teal"
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-[color:var(--brand)]">How It Works</span>
            <h2 className="text-4xl font-bold tracking-tight text-[color:var(--foreground)] md:text-5xl">
              Simple to Start,
              <span className="bg-gradient-to-r from-[color:var(--brand)] to-purple-500 bg-clip-text text-transparent"> Powerful</span>
              <br />Under the Hood
            </h2>
          </div>

          <div className="grid gap-12 lg:grid-cols-2">
            <StepCard
              number={1}
              title="Create Your Account"
              description="Sign up in seconds. No credit card required. Your data is encrypted and stored securely."
            />
            <StepCard
              number={2}
              title="Log Your First Day"
              description="Record your flow, mood, symptoms, and optional advanced signals like BBT and cervical mucus."
            />
            <StepCard
              number={3}
              title="Watch the AI Learn"
              description="Our algorithms analyze your patterns in real-time, improving predictions with every log."
            />
            <StepCard
              number={4}
              title="Get Personalized Insights"
              description="Receive health scores, anomaly alerts, trend analysis, and smart notifications tailored to you."
            />
          </div>
        </div>
      </section>

      <section id="technology" className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 text-center">
            <span className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-[color:var(--brand)]">Our Technology</span>
            <h2 className="text-4xl font-bold tracking-tight text-[color:var(--foreground)] md:text-5xl">
              Built on
              <span className="bg-gradient-to-r from-[color:var(--brand)] to-purple-500 bg-clip-text text-transparent"> Advanced</span>
              <br />Cycle Science
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <TechCard
                title="BBT Thermal Shift Detection"
                description="Detects the 0.2-0.5°F temperature rise that indicates ovulation has occurred. Requires just 5+ readings and identifies sustained shifts of 3+ days."
              />
              <TechCard
                title="Cervical Mucus Analysis"
                description="Identifies eggwhite mucus patterns — the gold standard for peak fertility. Cross-references with BBT for maximum accuracy."
              />
              <TechCard
                title="Temporal Pattern Recognition"
                description="Discovers &quot;X days before period&quot; patterns with statistical significance. Know when cramps, headaches, or mood changes typically appear."
              />
            </div>
            <div className="space-y-6">
              <TechCard
                title="Z-Score Anomaly Detection"
                description="Classifies cycles as typical, delayed, early, or skipped using statistical deviation from your personal baseline."
              />
              <TechCard
                title="Bayesian Signal Fusion"
                description="Combines multiple weak signals (BBT, mucus, mood, activity) into a strong ovulation probability with confidence weighting."
              />
              <TechCard
                title="Health Indicator Flags"
                description="Analyzes patterns for PCOS, hypothyroidism, perimenopause, and anovulation signals with actionable recommendations."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative rounded-[2rem] border border-purple-200/50 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-12 text-center shadow-2xl">
            <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
              <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-purple-200/30 blur-3xl" />
              <div className="absolute right-1/4 top-20 h-48 w-48 rounded-full bg-blue-200/30 blur-3xl" />
            </div>

            <div className="relative z-10">
              <Heart className="mx-auto mb-6 h-12 w-12 text-purple-500" />
              <h2 className="text-3xl font-bold text-[color:var(--foreground)] md:text-4xl">
                Start Understanding
                <br />Your Cycle Today
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-[color:var(--ink-soft)]">
                Join thousands of women who have discovered their body&apos;s natural rhythm with FlowMind&apos;s AI-powered tracking.
              </p>
              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/auth/sign-up"
                  className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[color:var(--brand)] to-purple-500 px-8 py-4 text-base font-semibold text-white shadow-xl transition-all hover:shadow-2xl active:scale-95"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <p className="mt-6 text-sm text-[color:var(--ink-soft)]">
                Free forever • No credit card • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[color:var(--line)] py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[color:var(--brand)] to-purple-400 shadow-lg">
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-xl font-semibold text-[color:var(--foreground)]">FlowMind</span>
            </div>

            <p className="text-sm text-[color:var(--ink-soft)]">
              © 2026 FlowMind. All rights reserved.
            </p>

            <div className="flex items-center gap-6 text-sm text-[color:var(--ink-soft)]">
              <a href="#" className="hover:text-[color:var(--foreground)]">Privacy Policy</a>
              <a href="#" className="hover:text-[color:var(--foreground)]">Terms of Service</a>
              <a href="#" className="hover:text-[color:var(--foreground)]">Contact</a>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-amber-200/50 bg-amber-50/50 p-4">
            <p className="text-center text-sm text-amber-800">
              <strong>Medical Disclaimer:</strong> FlowMind provides estimates and patterns only. It is not medical advice, birth control, or a diagnostic tool. Always consult a healthcare provider for medical concerns.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: React.ReactNode; title: string; description: string; color: string }) {
  const colorMap: Record<string, string> = {
    brand: "from-[color:var(--brand)]/20 to-purple-100 text-[color:var(--brand)]",
    purple: "from-purple-100 to-pink-100 text-purple-600",
    emerald: "from-emerald-100 to-teal-100 text-emerald-600",
    amber: "from-amber-100 to-orange-100 text-amber-600",
    pink: "from-pink-100 to-rose-100 text-pink-600",
    teal: "from-teal-100 to-cyan-100 text-teal-600",
  };

  return (
    <div className="group rounded-2xl border border-[color:var(--line)] bg-[color:var(--paper)] p-6 transition-all hover:border-[color:var(--brand)]/30 hover:shadow-xl hover:shadow-[color:var(--brand)]/10">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorMap[color] || colorMap.brand}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[color:var(--brand)] to-purple-500 text-lg font-bold text-white shadow-lg">
        {number}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[color:var(--foreground)]">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-[color:var(--ink-soft)]">{description}</p>
      </div>
    </div>
  );
}

function TechCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-[color:var(--line)] bg-[color:var(--paper)] p-5">
      <h3 className="font-semibold text-[color:var(--foreground)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[color:var(--ink-soft)]">{description}</p>
    </div>
  );
}