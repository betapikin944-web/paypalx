import { Smartphone } from "lucide-react";
import { SubPageLayout } from "@/components/SubPageLayout";

export default function LinkedDevicesPage() {
  return (
    <SubPageLayout title="Linked Devices">
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">Manage devices that have access to your account.</p>
        <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-muted p-2">
            <Smartphone className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Current device</p>
            <p className="text-xs text-muted-foreground">Linked devices list coming soon.</p>
          </div>
        </div>
      </section>
    </SubPageLayout>
  );
}
