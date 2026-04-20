import { SettingsClient } from "@/components/settings/SettingsClient";
import { PageIntro } from "@/components/ui/page-intro";
import { dbConnect } from "@/lib/db";
import { requireOnboardedProfile } from "@/lib/guards";
import { CustomSymptom } from "@/models/CustomSymptom";

export default async function SettingsPage() {
  const { userId, profile } = await requireOnboardedProfile();
  await dbConnect();

  const customSymptoms = await CustomSymptom.find({ userId }).sort({ label: 1 }).lean();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Preferences"
        title="Settings"
        description="Profile details, cycle defaults, custom symptoms, and privacy controls in one calmer workspace."
        meta={
          <>
            <span>Private profile</span>
            <span>
              {customSymptoms.length} custom symptom{customSymptoms.length === 1 ? "" : "s"}
            </span>
          </>
        }
      />

      <SettingsClient
        initialProfile={{
          birthYear: profile.birthYear ?? "",
          cycleLengthTypical: profile.cycleLengthTypical ?? 28,
          periodLengthTypical: profile.periodLengthTypical ?? 5,
          goalMode: profile.goalMode ?? "track",
          ageGroup: profile.ageGroup ?? null,
          aiPreferences: {
            toneStyle: profile.aiPreferences?.toneStyle ?? "encouraging",
            privacyMode: profile.aiPreferences?.privacyMode ?? "full_analysis",
            emotionalSupportLevel: profile.aiPreferences?.emotionalSupportLevel ?? "full",
          },
        }}
        customSymptoms={customSymptoms.map((symptom) => symptom.label)}
      />
    </div>
  );
}
