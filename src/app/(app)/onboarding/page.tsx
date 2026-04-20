import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/OnboardingForm";
import { PageIntro } from "@/components/ui/page-intro";
import { dbConnect } from "@/lib/db";
import { getProfileForUser, requireUserId } from "@/lib/guards";

export default async function OnboardingPage() {
  const userId = await requireUserId();
  await dbConnect();
  const profile = await getProfileForUser(userId);

  if (profile?.onboardingCompleted) redirect("/");

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Welcome"
        title="Set up your tracker"
        description="These details help the app build better cycle, fertility, and body-signal estimates from day one."
      />
      <div className="rounded-[34px] border border-white/60 bg-white/78 p-6 shadow-[0_24px_64px_rgba(83,37,48,0.10)]">
        <OnboardingForm
          initial={{
            birthYear: profile?.birthYear ?? "",
            cycleLengthTypical: profile?.cycleLengthTypical ?? 28,
            periodLengthTypical: profile?.periodLengthTypical ?? 5,
            goalMode: (profile?.goalMode as "track" | "conceive" | "avoid") ?? "track",
          }}
        />
      </div>
    </div>
  );
}
