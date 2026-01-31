import { SubPageLayout } from "@/components/SubPageLayout";
import { Switch } from "@/components/ui/switch";

export default function NotificationsSettingsPage() {
  return (
    <SubPageLayout title="Notifications">
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">Choose what you want to be notified about.</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Transfers</p>
              <p className="text-xs text-muted-foreground">Get notified when you send/receive money.</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
            <div>
              <p className="text-sm font-medium text-foreground">Card activity</p>
              <p className="text-xs text-muted-foreground">Get notified about Cash Card activity.</p>
            </div>
            <Switch />
          </div>
        </div>
      </section>
    </SubPageLayout>
  );
}
