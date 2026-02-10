import { SubPageLayout } from "@/components/SubPageLayout";
import { Input } from "@/components/ui/input";
import { Mail, MessageCircle, Phone } from "lucide-react";

export default function HelpCenterPage() {
  return (
    <SubPageLayout title="Help Center">
      <section className="space-y-4">
        <p className="text-[11px] text-muted-foreground">Search FAQs and contact support.</p>
        <Input placeholder="Search help articles..." className="h-8 text-xs" />
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-medium text-foreground">Popular topics</p>
          <ul className="mt-2 space-y-1.5 text-[11px] text-muted-foreground">
            <li>• Card funding & cash out</li>
            <li>• Transfer issues</li>
            <li>• Account security</li>
          </ul>
        </div>

        {/* Contact Support */}
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-medium text-foreground mb-2">Contact Support</p>
          <a
            href="mailto:Andersonlukehh@gmail.com"
            className="flex items-center gap-2 p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-foreground">Email Support</p>
              <p className="text-[10px] text-muted-foreground">Andersonlukehh@gmail.com</p>
            </div>
          </a>
        </div>
      </section>
    </SubPageLayout>
  );
}
