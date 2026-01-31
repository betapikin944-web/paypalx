import { SubPageLayout } from "@/components/SubPageLayout";

export default function LegalPage() {
  return (
    <SubPageLayout title="Legal">
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Add your Terms of Service, Privacy Policy, and other legal documents here.
        </p>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Terms of Service</p>
          <p className="text-xs text-muted-foreground mt-1">Placeholder page (content coming soon).</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Privacy Policy</p>
          <p className="text-xs text-muted-foreground mt-1">Placeholder page (content coming soon).</p>
        </div>
      </section>
    </SubPageLayout>
  );
}
