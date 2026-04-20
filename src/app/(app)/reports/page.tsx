import { ReportDownloadForm } from "@/components/reports/ReportDownloadForm";
import { PageIntro } from "@/components/ui/page-intro";
import { requireOnboardedProfile } from "@/lib/guards";

export default async function ReportsPage() {
  await requireOnboardedProfile();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Exports"
        title="Reports"
        description="Choose a range and export one clean PDF summary."
        meta={
          <>
            <span>Private export</span>
            <span>Server-generated PDF</span>
          </>
        }
      />

      <ReportDownloadForm />
    </div>
  );
}
