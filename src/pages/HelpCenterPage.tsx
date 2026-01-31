import { SubPageLayout } from "@/components/SubPageLayout";
import { Input } from "@/components/ui/input";

export default function HelpCenterPage() {
  return (
    <SubPageLayout title="Help Center">
      <section className="space-y-4">
        <p className="text-sm text-muted-foreground">Search FAQs and contact support.</p>
        <Input placeholder="Search help articles..." />
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-foreground">Popular topics</p>
          <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
            <li>• Card funding & cash out</li>
            <li>• Transfer issues</li>
            <li>• Account security</li>
          </ul>
        </div>
      </section>
    </SubPageLayout>
  );
}
