import { QrCode } from "lucide-react";
import { SubPageLayout } from "@/components/SubPageLayout";

export default function ProfileQrPage() {
  return (
    <SubPageLayout title="My QR Code">
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This is your personal QR code. Share it so others can find you quickly.
        </p>
        <div className="mx-auto w-full max-w-xs aspect-square rounded-2xl border border-border bg-card flex items-center justify-center">
          <div className="text-center">
            <QrCode className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-xs text-muted-foreground mt-2">QR code placeholder</p>
          </div>
        </div>
      </section>
    </SubPageLayout>
  );
}
