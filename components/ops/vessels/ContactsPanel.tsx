import { Building2, Mail, MessageCircle, Phone, UserRound, Users } from "lucide-react";
import type { ReactNode } from "react";
import type { VesselView } from "@/lib/vessels/types";

function digits(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

function ContactBlock({
  icon,
  title,
  name,
  phone,
  email,
}: {
  icon: ReactNode;
  title: string;
  name: string | null;
  phone: string | null;
  email: string | null;
}) {
  const empty = !name && !phone && !email;
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </div>
      {empty ? (
        <p className="mt-2 text-sm text-muted-foreground">Not filled in</p>
      ) : (
        <div className="mt-2 space-y-1.5 text-sm">
          {name ? <p className="font-medium">{name}</p> : null}
          {phone ? (
            <div className="flex flex-wrap items-center gap-2">
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 text-primary hover:underline">
                <Phone className="h-3.5 w-3.5" /> {phone}
              </a>
              {digits(phone).length >= 9 ? (
                <a
                  href={`https://wa.me/${digits(phone)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs text-ok hover:bg-ok/10"
                >
                  <MessageCircle className="h-3 w-3" /> WhatsApp
                </a>
              ) : null}
            </div>
          ) : null}
          {email ? (
            <a href={`mailto:${email}`} className="inline-flex items-center gap-1.5 break-all text-primary hover:underline">
              <Mail className="h-3.5 w-3.5 shrink-0" /> {email}
            </a>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function ContactsPanel({ vessel }: { vessel: VesselView }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <ContactBlock icon={<UserRound className="h-3.5 w-3.5" />} title="Master" name={vessel.masterName} phone={vessel.masterPhone} email={vessel.masterEmail} />
      <ContactBlock icon={<Building2 className="h-3.5 w-3.5" />} title="Owner / office" name={vessel.officeName} phone={vessel.officePhone} email={vessel.officeEmail} />
      <div className="rounded-lg border p-3 sm:col-span-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> Port agent at destination
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm">{vessel.portAgent || <span className="text-muted-foreground">Not filled in</span>}</p>
      </div>
    </div>
  );
}
