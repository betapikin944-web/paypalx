import { SubPageLayout } from "@/components/SubPageLayout";
import { Input } from "@/components/ui/input";
import { Mail, MessageCircle, Phone, Loader2 } from "lucide-react";
import { useSupportContacts } from "@/hooks/useSupportContacts";

const contactTypeIcons = {
  email: Mail,
  phone: Phone,
  chat: MessageCircle,
};

function getContactHref(type: string, value: string) {
  if (type === 'email') return `mailto:${value}`;
  if (type === 'phone') return `tel:${value}`;
  return value; // chat links are URLs
}

export default function HelpCenterPage() {
  const { data: contacts, isLoading } = useSupportContacts();

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
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          ) : contacts && contacts.length > 0 ? (
            <div className="space-y-2">
              {contacts.map((contact) => {
                const Icon = contactTypeIcons[contact.contact_type as keyof typeof contactTypeIcons] || Mail;
                return (
                  <a
                    key={contact.id}
                    href={getContactHref(contact.contact_type, contact.value)}
                    target={contact.contact_type === 'chat' ? '_blank' : undefined}
                    rel={contact.contact_type === 'chat' ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-foreground">{contact.label}</p>
                      <p className="text-[10px] text-muted-foreground">{contact.value}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          ) : (
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
          )}
        </div>
      </section>
    </SubPageLayout>
  );
}
