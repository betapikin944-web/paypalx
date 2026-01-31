import { SubPageLayout } from "@/components/SubPageLayout";

export default function SecurityPrivacyPage() {
  return (
    <SubPageLayout title="Security & Privacy">
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">Manage your security and privacy settings.</p>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Password & login</p>
          <p className="text-xs text-muted-foreground mt-1">Placeholder page (features coming soon).</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Privacy</p>
          <p className="text-xs text-muted-foreground mt-1">Placeholder page (features coming soon).</p>
        </div>
      </section>
    </SubPageLayout>
  );
}
