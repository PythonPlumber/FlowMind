import { Suspense } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/SignInForm";

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Return to your cycle space"
      description="Sign in to pick up your latest body cues, cycle forecasts, and private tracking history."
      points={["Forecast windows", "Advanced body cues", "Private notes and symptoms"]}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
            Sign in
          </h2>
          <p className="text-sm text-[color:var(--ink-soft)]">Access your tracker securely.</p>
        </div>
        <Suspense fallback={null}>
          <SignInForm />
        </Suspense>
      </div>
    </AuthShell>
  );
}
