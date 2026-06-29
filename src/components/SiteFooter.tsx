import { Link } from "@tanstack/react-router";
import { Linkedin, Send, Mail, Phone, MapPin } from "lucide-react";
import { IconButton } from "@/components/ds";
import { useCmsSection, useCmsCollection } from "@/lib/cms/useCmsContent";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.123-.272-.198-.57-.347zM12.04 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.992c-.003 5.45-4.437 9.886-9.887 9.886zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.49-8.413z"/>
    </svg>
  );
}
import { Logo } from "./Logo";

type FooterContent = {
  description: string;
  email: string;
  phone: string;
  phoneHref: string;
  address: string;
  linkedinUrl: string;
  telegramUrl: string;
  whatsappUrl: string;
  copyright: string;
};

const COMPANY_LINKS: [string, string][] = [
  ["Products & Cases", "/cases"],
  ["Industries", "/industries"],
  ["How We Work", "/how-we-work"],
  ["About", "/about"],
  ["Insights", "/insights"],
];

export function SiteFooter() {
  const c = useCmsSection<FooterContent>("footer");
  const services = useCmsCollection<{ title?: string; linkHref?: string }>("services");

  const serviceLinks: [string, string][] = services
    .map((s) => [s.data.title ?? "", s.data.linkHref ?? "/services"] as [string, string])
    .filter(([label]) => label.trim().length > 0);

  return (
    <footer className="relative mt-32 border-t border-white/5">
      <div className="container-x grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">{c.description}</p>
          <div className="mt-5 flex items-center gap-2">
            {c.linkedinUrl && (
              <IconButton as="a" href={c.linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </IconButton>
            )}
            {c.telegramUrl && (
              <IconButton as="a" href={c.telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                <Send className="h-4 w-4" />
              </IconButton>
            )}
            {c.whatsappUrl && (
              <IconButton as="a" href={c.whatsappUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                <WhatsAppIcon className="h-4 w-4" />
              </IconButton>
            )}
          </div>
        </div>
        <FooterCol title="Services" links={serviceLinks} />
        <FooterCol title="Company" links={COMPANY_LINKS} />
        <div>
          <h4 className="text-sm font-semibold text-foreground">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {c.email && (
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
                <a href={`mailto:${c.email}`} className="transition hover:text-foreground">{c.email}</a>
              </li>
            )}
            {c.phone && (
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
                <a href={c.phoneHref || `tel:${c.phone.replace(/\s+/g, "")}`} className="transition hover:text-foreground">{c.phone}</a>
              </li>
            )}
            {c.address && (
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
                <span>{c.address}</span>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="container-x flex flex-col items-start justify-between gap-3 py-6 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>{c.copyright}</p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            <li><Link to="/privacy" className="transition hover:text-foreground">Privacy Policy</Link></li>
            <li><Link to="/terms" className="transition hover:text-foreground">Terms of Use</Link></li>
            <li><Link to="/cookies" className="transition hover:text-foreground">Cookie Policy</Link></li>
            <li><Link to="/gdpr" className="transition hover:text-foreground">GDPR</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
        {links.map(([label, to]) => (
          <li key={`${title}-${label}`}>
            <Link to={to} className="transition hover:text-foreground">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
