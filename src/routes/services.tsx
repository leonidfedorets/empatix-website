import { createFileRoute, Link } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { ArrowRight, Layers, Bot, Workflow, Compass, CheckCircle2, Quote, ShieldCheck, X } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CmsMark } from "@/components/CmsMark";
import { EditableHero, EditableCta } from "@/components/cms/EditablePageBlocks";
import { useCmsCollection, useCmsSection } from "@/lib/cms/useCmsContent";
import { ICON_OPTIONS } from "@/components/admin/IconPicker";
import bgServices from "@/assets/bg-services.jpg";
import ctaServicesBg from "@/assets/cta-services-bg.jpg";


const SITE_URL = "https://empathic-site-studio.lovable.app";

export const Route = createFileRoute("/services")({
  head: () => {
    const base = seoMeta({
      title: 'Services — Empatix',
      description: 'Product development, AI implementation, business automation and CTO-as-a-Service — one accountable team for founders and operators',
      path: '/services',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services' },
      ],
    });
    return {
      ...base,
      scripts: [
      ...(base.scripts ?? []),

      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Empatix services",
          itemListOrder: "https://schema.org/ItemListOrderAscending",
          itemListElement: DEFAULT_SERVICES.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              "@id": `${SITE_URL}/services#${s.anchor}`,
              name: s.title,
              description: s.pitch,
              url: `${SITE_URL}/services#${s.anchor}`,
              serviceType: s.title,
              provider: { "@id": `${SITE_URL}/#organization` },
              areaServed: "Worldwide",
              audience: s.forWhom
                ? { "@type": "Audience", audienceType: s.forWhom }
                : undefined,
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: `${s.title} — what's included`,
                itemListElement: splitLines(s.includes).map((line) => ({
                  "@type": "Offer",
                  itemOffered: { "@type": "Service", name: line },
                })),
              },
            },
          })),
        }),
      },
    ],
    };
  },
  component: ServicesPage,
});



function pickIcon(name: string | undefined) {
  return (name && (ICON_OPTIONS as Record<string, typeof Compass>)[name]) || Compass;
}

function splitLines(s: string | undefined): string[] {
  return (s ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

// Per-column accent classes (cycled). Keep palette tight and on-brand.
const ACCENTS = [
  { bar: "bg-brand-sky", pill: "bg-brand-sky/10 text-brand-sky ring-brand-sky/20", icon: "text-brand-sky border-brand-sky/30 bg-brand-sky/10" },
  { bar: "bg-violet-400", pill: "bg-violet-400/10 text-violet-300 ring-violet-400/20", icon: "text-violet-300 border-violet-400/30 bg-violet-400/10" },
  { bar: "bg-emerald-400", pill: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20", icon: "text-emerald-300 border-emerald-400/30 bg-emerald-400/10" },
  { bar: "bg-amber-400", pill: "bg-amber-400/10 text-amber-300 ring-amber-400/20", icon: "text-amber-300 border-amber-400/30 bg-amber-400/10" },
  { bar: "bg-rose-400", pill: "bg-rose-400/10 text-rose-300 ring-rose-400/20", icon: "text-rose-300 border-rose-400/30 bg-rose-400/10" },
  { bar: "bg-indigo-400", pill: "bg-indigo-400/10 text-indigo-300 ring-indigo-400/20", icon: "text-indigo-300 border-indigo-400/30 bg-indigo-400/10" },
];

type Service = {
  id: string;
  anchor: string;
  icon: string;
  title: string;
  pitch: string;
  forWhom?: string;
  timeline?: string;
  buildList: string;
  includes: string;
  proofMetric?: string;
  proofQuote?: string;
  proofAuthor?: string;
  image?: string;
  linkLabel?: string;
  linkHref?: string;

};

const DEFAULT_SERVICES: Service[] = [
  {
    id: "d-product",
    anchor: "product",
    icon: "Layers",
    title: "Digital Product Development",
    pitch: "Web, mobile, SaaS, CRM, fintech and internal products — from sketch to shipped.",
    forWhom: "Founders and operators turning an idea or internal pain into a real product.",
    timeline: "8–16 weeks",
    buildList: "Web & mobile apps\nSaaS platforms\nCRM systems\nFintech & tokenization\nInternal business tools\nE-commerce",
    includes: "Discovery & business analysis\nUX/UI & prototyping\nArchitecture & engineering\nQA & deployment\nContinuous improvement",
  },
  {
    id: "d-ai",
    anchor: "ai",
    icon: "Bot",
    title: "AI Implementation",
    pitch: "AI inside real workflows — assistants, RAG, document analysis, AI SDRs, trained on your data.",
    forWhom: "Teams who want AI that actually moves a metric, not a demo.",
    timeline: "4–10 weeks",
    buildList: "RAG assistants\nContract & clause analysis\nAI SDR agents\nAI mentors & chatbots\nPrivate-data AI\nWorkflow copilots",
    includes: "AI proof-of-concept\nData preparation & retrieval\nPrompt & evaluation pipelines\nProduction hosting & monitoring",
  },
  {
    id: "d-automation",
    anchor: "automation",
    icon: "Workflow",
    title: "Business Automation",
    pitch: "Connect CRMs, inboxes, lead sources and tools so manual work stops eating your week.",
    forWhom: "Sales, ops and finance teams losing hours on copy-paste between systems.",
    timeline: "2–6 weeks",
    buildList: "CRM integrations\nLead-gen workflows\nSales pipeline automation\nData parsing & enrichment\nReporting & dashboards\nInternal workflow digitalisation",
    includes: "n8n, Zapier, Make\nNode.js custom automations\nAPI & webhook integrations\nSheets, Airtable, Notion, HubSpot",
  },
  {
    id: "d-cto",
    anchor: "cto",
    icon: "Compass",
    title: "CTO-as-a-Service",
    pitch: "A senior tech partner for founders — without the cost or risk of a full-time CTO hire.",
    forWhom: "Non-technical founders and PE-backed operators who need a sober tech voice.",
    timeline: "Ongoing retainer",
    buildList: "Architecture & tech selection\nProduct roadmap\nVendor control & risk\nDelivery management\nDiscovery & solution design\nEstimation & MVP scoping",
    includes: "Fractional CTO advisory\nTechnical due diligence\nTeam & process setup\nInvestor-ready documentation",
  },
];

void [Layers, Bot, Workflow];

function ServicesPage() {
  const rows = useCmsCollection<Omit<Service, "id">>("services_offerings");
  const items: Service[] = rows.length
    ? rows.map((r) => ({ id: r.id, ...r.data }))
    : DEFAULT_SERVICES;

  return (
    <SiteLayout>
      <EditableHero sectionKey="services_page_hero" label="Services — Hero" bgImage={bgServices} />

      <CmsMark kind="collection" target="services_offerings" label="Services — Offerings" as="div">
        <section className="container-x pb-24">
          {/* Section header */}
          <div className="mx-auto mb-10 max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.22em] text-brand-sky">Service matrix</p>
            <h2 className="display mt-3 text-3xl font-bold text-foreground md:text-4xl">
              Compare engagements side&#8209;by&#8209;side
            </h2>
            <p className="mt-3 text-muted-foreground">
              Same accountable team, four ways to engage. Scan across rows to find the path that fits your stage.
            </p>
          </div>

          {/* Mobile: stacked cards */}
          <div className="space-y-4 md:hidden">
            {items.map((s, i) => {
              const Icon = pickIcon(s.icon);
              const a = ACCENTS[i % ACCENTS.length];
              return (
                <article
                  id={s.anchor || undefined}
                  key={s.id}
                  className="rounded-2xl border border-white/10 bg-card p-6"
                >
                  <div className={`h-1 w-12 rounded-full ${a.bar} mb-4`} />
                  <div className="flex items-start gap-3">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border ${a.icon}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="display text-lg font-semibold text-foreground">{s.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{s.pitch}</p>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-4 text-sm">
                    {s.forWhom ? (
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Who it's for</dt>
                        <dd className="mt-1 text-muted-foreground">{s.forWhom}</dd>
                      </div>
                    ) : null}
                    {s.timeline ? (
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Typical timeline</dt>
                        <dd className="mt-1">
                          <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-mono ring-1 ${a.pill}`}>{s.timeline}</span>
                        </dd>
                      </div>
                    ) : null}
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">Core deliverables</dt>
                      <dd className="mt-2 flex flex-wrap gap-1.5">
                        {splitLines(s.buildList).map((b) => (
                          <span key={b} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground">
                            {b}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70">What's included</dt>
                      <dd className="mt-2 space-y-1.5">
                        {splitLines(s.includes).map((it) => (
                          <div key={it} className="flex items-start gap-2 text-muted-foreground">
                            <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${a.icon.split(" ")[0]}`} />
                            <span>{it}</span>
                          </div>
                        ))}
                      </dd>
                    </div>
                  </dl>

                  {(s.proofMetric || s.proofQuote) ? (
                    <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                      {s.proofMetric ? (
                        <span className={`mb-2 inline-block rounded-md px-2 py-1 font-mono text-xs ring-1 ${a.pill}`}>
                          {s.proofMetric}
                        </span>
                      ) : null}
                      {s.proofQuote ? (
                        <figure>
                          <Quote className={`mb-1 h-3.5 w-3.5 ${a.icon.split(" ")[0]}`} />
                          <blockquote className="text-xs italic leading-relaxed text-muted-foreground">
                            “{s.proofQuote}”
                          </blockquote>
                          {s.proofAuthor ? (
                            <figcaption className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                              — {s.proofAuthor}
                            </figcaption>
                          ) : null}
                        </figure>
                      ) : null}
                    </div>
                  ) : null}

                  <ServiceCta service={s} accentPill={a.pill} className="mt-6" />
                </article>

              );
            })}
          </div>

          {/* Desktop: comparative matrix */}
          <div className="hidden md:block">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-card shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="w-56 bg-white/[0.02] p-6 align-bottom">
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/70">
                          Framework
                        </span>
                      </th>
                      {items.map((s, i) => {
                        const Icon = pickIcon(s.icon);
                        const a = ACCENTS[i % ACCENTS.length];
                        return (
                          <th
                            key={s.id}
                            id={s.anchor || undefined}
                            className="min-w-[220px] p-6 align-bottom"
                            scope="col"
                          >
                            <div className={`h-1 w-10 rounded-full ${a.bar} mb-4`} />
                            <div className="flex items-start gap-3">
                              <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${a.icon}`}>
                                <Icon className="h-4.5 w-4.5" />
                              </div>
                              <h3 className="display text-base font-semibold leading-tight text-foreground">
                                {s.title}
                              </h3>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {/* Pitch */}
                    <tr className="group transition-colors hover:bg-white/[0.02]">
                      <td className="bg-white/[0.02] p-6 align-top text-sm font-medium text-foreground/80">
                        Pitch
                      </td>
                      {items.map((s) => (
                        <td key={s.id} className="p-6 align-top text-sm text-muted-foreground">
                          {s.pitch}
                        </td>
                      ))}
                    </tr>

                    {/* Who it's for */}
                    <tr className="group transition-colors hover:bg-white/[0.02]">
                      <td className="bg-white/[0.02] p-6 align-top text-sm font-medium text-foreground/80">
                        Who it's for
                      </td>
                      {items.map((s) => (
                        <td key={s.id} className="p-6 align-top text-sm text-muted-foreground">
                          {s.forWhom || <span className="text-muted-foreground/40">—</span>}
                        </td>
                      ))}
                    </tr>

                    {/* Timeline */}
                    <tr className="group transition-colors hover:bg-white/[0.02]">
                      <td className="bg-white/[0.02] p-6 align-top text-sm font-medium text-foreground/80">
                        Typical timeline
                      </td>
                      {items.map((s, i) => {
                        const a = ACCENTS[i % ACCENTS.length];
                        return (
                          <td key={s.id} className="p-6 align-top">
                            {s.timeline ? (
                              <span className={`inline-block rounded-md px-2 py-1 font-mono text-xs ring-1 ${a.pill}`}>
                                {s.timeline}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/40">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Core deliverables */}
                    <tr className="group transition-colors hover:bg-white/[0.02]">
                      <td className="bg-white/[0.02] p-6 align-top text-sm font-medium text-foreground/80">
                        Core deliverables
                      </td>
                      {items.map((s) => (
                        <td key={s.id} className="p-6 align-top">
                          <div className="flex flex-wrap gap-1.5">
                            {splitLines(s.buildList).map((b) => (
                              <span
                                key={b}
                                className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-muted-foreground"
                              >
                                {b}
                              </span>
                            ))}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* What's included */}
                    <tr className="group transition-colors hover:bg-white/[0.02]">
                      <td className="bg-white/[0.02] p-6 align-top text-sm font-medium text-foreground/80">
                        What's included
                      </td>
                      {items.map((s, i) => {
                        const a = ACCENTS[i % ACCENTS.length];
                        const iconColor = a.icon.split(" ")[0];
                        return (
                          <td key={s.id} className="p-6 align-top">
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {splitLines(s.includes).map((it) => (
                                <li key={it} className="flex items-start gap-2">
                                  <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
                                  <span>{it}</span>
                                </li>
                              ))}
                            </ul>
                          </td>
                        );
                      })}
                    </tr>

                    {/* Proof — quote + metric */}
                    {items.some((s) => s.proofMetric || s.proofQuote) ? (
                      <tr className="group transition-colors hover:bg-white/[0.02]">
                        <td className="bg-white/[0.02] p-6 align-top text-sm font-medium text-foreground/80">
                          Proof
                        </td>
                        {items.map((s, i) => {
                          const a = ACCENTS[i % ACCENTS.length];
                          if (!s.proofMetric && !s.proofQuote) {
                            return (
                              <td key={s.id} className="p-6 align-top">
                                <span className="text-muted-foreground/40">—</span>
                              </td>
                            );
                          }
                          return (
                            <td key={s.id} className="p-6 align-top">
                              {s.proofMetric ? (
                                <span className={`mb-2 inline-block rounded-md px-2 py-1 font-mono text-xs ring-1 ${a.pill}`}>
                                  {s.proofMetric}
                                </span>
                              ) : null}
                              {s.proofQuote ? (
                                <figure className="mt-1">
                                  <Quote className={`mb-1 h-3.5 w-3.5 ${a.icon.split(" ")[0]}`} />
                                  <blockquote className="text-xs italic leading-relaxed text-muted-foreground">
                                    “{s.proofQuote}”
                                  </blockquote>
                                  {s.proofAuthor ? (
                                    <figcaption className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                                      — {s.proofAuthor}
                                    </figcaption>
                                  ) : null}
                                </figure>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ) : null}

                    {/* CTA */}

                    <tr>
                      <td className="bg-white/[0.02] p-6 align-top text-sm font-medium text-foreground/80">
                        Next step
                      </td>
                      {items.map((s, i) => (
                        <td key={s.id} className="p-6 align-top">
                          <ServiceCta service={s} accentPill={ACCENTS[i % ACCENTS.length].pill} />
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footnote */}
            <p className="mt-4 px-2 text-[11px] text-muted-foreground/60">
              * Timelines are typical estimates for standard scopes — final scope is agreed during discovery.
            </p>
          </div>
        </section>
      </CmsMark>

      <ServicesAssurance />

      <EditableCta sectionKey="services_page_cta" label="Services — Bottom CTA" bgImage={ctaServicesBg} />

    </SiteLayout>
  );
}

function ServiceCta({
  service,
  accentPill,
  className = "",
}: {
  service: Service;
  accentPill: string;
  className?: string;
}) {
  const href = service.linkHref || "/contact";
  const label = service.linkLabel || "Discuss this service";
  const isExternal = /^https?:\/\//i.test(href);
  const cls = `inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-foreground transition-all hover:bg-white/10 hover:border-brand-sky/40 ${className}`;
  void accentPill;
  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        <span>{label}</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    );
  }
  return (
    <Link to={href} className={cls}>
      <span>{label}</span>
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

type AssuranceContent = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  getTitle?: string;
  getList?: string;
  avoidTitle?: string;
  avoidList?: string;
};

function ServicesAssurance() {
  const c = useCmsSection<AssuranceContent>("services_assurance");
  const gets = splitLines(c.getList);
  const avoids = splitLines(c.avoidList);
  if (!gets.length && !avoids.length && !c.title) return null;
  return (
    <CmsMark kind="section" target="services_assurance" label="Services — Assurance" as="div">
      <section className="container-x pb-24">
        <div className="mx-auto mb-10 max-w-3xl text-center">
          {c.eyebrow ? (
            <p className="text-xs uppercase tracking-[0.22em] text-brand-sky">{c.eyebrow}</p>
          ) : null}
          <h2 className="display mt-3 text-3xl font-bold text-foreground md:text-4xl">
            {c.title || "What you get — and what you don't"}
          </h2>
          {c.subtitle ? (
            <p className="mt-3 text-muted-foreground">{c.subtitle}</p>
          ) : null}
        </div>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-6 md:p-8">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="display text-lg font-semibold text-foreground">
                {c.getTitle || "What you get"}
              </h3>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {gets.map((g) => (
                <li key={g} className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <span>{g}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/[0.04] p-6 md:p-8">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-lg border border-rose-400/30 bg-rose-400/10 text-rose-300">
                <X className="h-5 w-5" />
              </div>
              <h3 className="display text-lg font-semibold text-foreground">
                {c.avoidTitle || "What you don't get"}
              </h3>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
              {avoids.map((a) => (
                <li key={a} className="flex items-start gap-2.5">
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </CmsMark>
  );
}
