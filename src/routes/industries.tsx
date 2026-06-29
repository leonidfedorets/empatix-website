import { createFileRoute } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { Banknote, Scale, Users, ShoppingBag, Cpu, Stethoscope, Briefcase } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CmsMark } from "@/components/CmsMark";
import { EditableHero, EditableCta } from "@/components/cms/EditablePageBlocks";
import { useCmsCollection } from "@/lib/cms/useCmsContent";
import { ICON_OPTIONS } from "@/components/admin/IconPicker";
import bgIndustries from "@/assets/bg-industries.jpg";
import ctaIndustriesBg from "@/assets/cta-industries-bg.jpg";

export const Route = createFileRoute("/industries")({
  head: () => ({
    ...seoMeta({
      title: 'Industries — Empatix',
      description: 'Fintech, LegalTech, CRM & Sales, SaaS, operations-heavy SMEs and service businesses — the industries where we know the work',
      path: '/industries',
      breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Industries', path: '/industries' }],
    }),
  }),
  component: IndustriesPage,
});

function pickIcon(name: string | undefined) {
  return (name && (ICON_OPTIONS as Record<string, typeof Briefcase>)[name]) || Briefcase;
}

const DEFAULT_INDUSTRIES = [
  { id: "d-fintech", icon: "Banknote",    title: "Fintech",                     description: "Tokenization, transaction monitoring, reconciliation, admin workflows and back-office automation — built for teams under regulatory pressure" },
  { id: "d-legal",   icon: "Scale",       title: "LegalTech",                   description: "AI contract analysis, clause extraction, risk detection and document comparison — for legal teams drowning in PDFs" },
  { id: "d-crm",     icon: "Users",       title: "CRM & Sales",                 description: "CRMs, AI SDRs, lead generation, outreach automation and pipeline reporting — the systems sales actually rely on" },
  { id: "d-ai",      icon: "Cpu",         title: "AI products & SaaS",          description: "AI-powered SaaS from MVP to production — RAG, agents and copilots built on real customer data" },
  { id: "d-ops",     icon: "ShoppingBag", title: "Operations-heavy SMEs",       description: "Replace the spreadsheets, group chats and copy-paste with controlled digital workflows your team trusts" },
  { id: "d-svc",     icon: "Stethoscope", title: "Service & retention businesses", description: "CRM automation and AI assistants for repeat-service businesses where retention drives the P&L" },
];

void [Banknote, Scale, Users, ShoppingBag, Cpu, Stethoscope];

function IndustriesPage() {
  const rows = useCmsCollection<{ icon: string; title: string; description: string }>("industries_items");
  const items = rows.length ? rows.map((r) => ({ id: r.id, ...r.data })) : DEFAULT_INDUSTRIES;

  return (
    <SiteLayout>
      <EditableHero sectionKey="industries_hero" label="Industries — Hero" bgImage={bgIndustries} />
      <CmsMark kind="collection" target="industries_items" label="Industries — Items" as="section" className="container-x grid gap-4 pb-20 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => {
          const Icon = pickIcon(it.icon);
          return (
            <article
              key={it.id}
              className="group rounded-2xl border border-white/5 bg-card p-7 transition duration-350 hover:-translate-y-1 hover:border-brand-sky/30 hover:shadow-[0_10px_40px_-15px_rgba(56,189,248,0.35)]"
            >
              <Icon className="h-7 w-7 text-brand-sky transition-transform duration-300 group-hover:scale-110" />
              <h2 className="display mt-5 text-xl font-bold">{it.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{it.description}</p>
            </article>
          );
        })}
      </CmsMark>
      <EditableCta sectionKey="industries_cta" label="Industries — Bottom CTA" bgImage={ctaIndustriesBg} />
    </SiteLayout>
  );
}
