import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/SignUpForm";

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Start here"
      title="Build a smarter period tracker"
      description="Create a private account to track cycles, symptoms, body signals, and richer wellness patterns over time."
      points={["Period forecasts", "Fertility estimates", "Body signal logging"]}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[color:var(--foreground)]">
            Create your account
          </h2>
          <p className="text-sm text-[color:var(--ink-soft)]">
            Private tracker for you and your friends.
          </p>
        </div>
        <SignUpForm />
      </div>
    </AuthShell>
  );
}
