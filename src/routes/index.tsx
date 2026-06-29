import { Fragment, useEffect, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { seoMeta } from "@/lib/seo";
import {
  ArrowRight, Workflow, Cpu, Compass,
  FileSearch, Zap, ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CmsMark } from "@/components/CmsMark";
import { useCmsSection, useCmsCollection } from "@/lib/cms/useCmsContent";
import { RevealGroup, RevealItem, Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { ICON_OPTIONS } from "@/components/admin/IconPicker";
import caseFineClause from "@/assets/case-fine-clause.jpg";
import caseAiSdr from "@/assets/case-ai-sdr.jpg";
import caseGalaxy from "@/assets/case-galaxy-connext.jpg";
import caseSiteParsers from "@/assets/case-site-parsers.jpg";
import ctaDiscoveryBg from "@/assets/cta-discovery-bg.jpg";

const EASE = [0.22, 1, 0.36, 1] as const;

type Segment = { text: string; gradient?: boolean };

// Split text into tokens that preserve spaces, so we can animate per-word
// without breaking inside a word at line-wrap (each word is inline-block,
// the spaces stay as plain text and act as wrap opportunities).
function splitWords(text: string): { word: string; trailingSpace: string }[] {
  const out: { word: string; trailingSpace: string }[] = [];
  const re = /(\S+)(\s*)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push({ word: m[1], trailingSpace: m[2] });
  }
  return out;
}

function TypewriterHeadline({
  segments,
  className,
  delay = 0,
  stagger = 0.06,
}: {
  segments: Segment[];
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  let i = 0;
  return (
    <h1 className={className} aria-label={segments.map((s) => s.text).join("")}>
      {segments.map((seg, sIdx) => {
        const words = splitWords(seg.text);
        return (
          <span key={sIdx} aria-hidden>
            {words.map((w, wIdx) => {
              const idx = i++;
              return (
                <span key={`${sIdx}-${wIdx}`}>
                  <motion.span
                    className={seg.gradient ? "text-gradient" : undefined}
                    style={{ display: "inline-block" }}
                    initial={{ opacity: 0, x: -10, filter: "blur(6px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    transition={{ duration: 0.45, delay: delay + idx * stagger, ease: EASE }}
                  >
                    {w.word}
                  </motion.span>
                  {w.trailingSpace}
                </span>
              );
            })}
          </span>
        );
      })}
    </h1>
  );
}

function TypewriterText({
  text,
  className,
  as: As = "p",
  delay = 0,
  stagger = 0.03,
}: {
  text: string;
  className?: string;
  as?: "p" | "span";
  delay?: number;
  stagger?: number;
}) {
  const words = splitWords(text);
  return (
    <As className={className} aria-label={text}>
      {words.map((w, idx) => (
        <span key={idx}>
          <motion.span
            aria-hidden
            style={{ display: "inline-block" }}
            initial={{ opacity: 0, x: -6, filter: "blur(4px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.35, delay: delay + idx * stagger, ease: EASE }}
          >
            {w.word}
          </motion.span>
          {w.trailingSpace}
        </span>
      ))}
    </As>
  );
}



export const Route = createFileRoute("/")({
  head: () => ({
    ...seoMeta({
      title: 'Empatix — Ship AI products. Automate the work behind them',
      description: 'Empatix helps ops and product teams turn manual work into software — AI products, automations and internal tools built by senior engineers.',
      path: '/',
    }),
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <SiteLayout>
      <CmsMark kind="section" target="hero" label="Hero" as="div"><Hero /></CmsMark>
      <CmsMark kind="collection" target="trust_metrics" label="Trust — Metrics" as="div"><TrustStrip /></CmsMark>
      <CmsMark kind="collection" target="value_props" label="Value Propositions" as="div"><ValueProposition /></CmsMark>
      <CmsMark kind="collection" target="services" label="Services" as="div"><Services /></CmsMark>
      <CmsMark kind="collection" target="case_studies" label="Featured Cases" as="div"><FeaturedCases /></CmsMark>
      <CmsMark kind="section" target="why_empatix" label="Why Empatix" as="div"><WhyEmpatix /></CmsMark>
      <CmsMark kind="section" target="process" label="Process" as="div"><ProcessStrip /></CmsMark>
      <CmsMark kind="section" target="final_cta" label="Final CTA" as="div"><FinalCTA /></CmsMark>
    </SiteLayout>
  );
}

type HeroContent = {
  headline: string;
  subheadline: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  ctaTertiaryLabel: string;
  ctaTertiaryHref: string;
  proofMetric?: string;
  proofText?: string;
  proofCaseLabel?: string;
  proofCaseHref?: string;
};

function Hero() {
  const c = useCmsSection<HeroContent>("hero");
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-40 right-[-15%] h-[60vw] max-h-[640px] w-[60vw] max-w-[640px] rounded-full bg-gradient-brand opacity-30 blur-3xl md:opacity-50"
          animate={{ x: [0, 14, 0], y: [0, -10, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 left-[-15%] h-[50vw] max-h-[520px] w-[50vw] max-w-[520px] rounded-full bg-[radial-gradient(circle,_#283BD4_0%,_transparent_60%)] opacity-20 blur-3xl md:opacity-30"
          animate={{ x: [0, -12, 0], y: [0, 10, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Decorative brand mark — only on xl+ where there's room beside the text column */}
        <motion.div
          aria-hidden
          className="absolute right-[-4%] top-[34%] hidden h-[520px] w-[520px] -translate-y-1/2 xl:block 2xl:h-[640px] 2xl:w-[640px]"
          style={{
            background:
              "linear-gradient(115deg, #6FA8FF 0%, #6FA8FF 42%, #2547E0 50%, #1B3A99 70%, #050912 100%)",
            WebkitMaskImage: `url(/empatix-logo-dark.svg)`,
            maskImage: `url(/empatix-logo-dark.svg)`,
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
          initial={{ opacity: 0, scale: 0.85, x: 80 }}
          animate={{ opacity: 0.35, scale: 1, x: 0 }}
          transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        />
      </div>

      <div className="container-x section-y">
        <div className="text-readable-wide">
          <TypewriterHeadline
            key={c.headline}
            className="display fluid-h1 text-balance font-bold"
            segments={[{ text: c.headline }]}
            delay={0.1}
          />

          <TypewriterText
            key={c.subheadline}
            as="p"
            className="fluid-body text-readable mt-5 leading-relaxed text-muted-foreground md:mt-6"
            text={c.subheadline}
            delay={1.1}
            stagger={0.012}
          />

          <Reveal className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:mt-9" delay={0.4} duration={0.6}>
            <a
              href={c.ctaPrimaryHref}
              target={/^https?:/.test(c.ctaPrimaryHref) ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-brand px-6 py-3.5 text-sm font-semibold text-white shadow-brand transition hover:brightness-110 sm:w-auto"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                {c.ctaPrimaryLabel}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            <a
              href={c.ctaSecondaryHref}
              target={/^https?:/.test(c.ctaSecondaryHref) ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-foreground transition hover:border-white/30 hover:bg-white/5 sm:w-auto"
            >
              <span className="relative z-10 inline-flex items-center gap-2">
                {c.ctaSecondaryLabel}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </a>
            <a
              href={c.ctaTertiaryHref}
              target={/^https?:/.test(c.ctaTertiaryHref) ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-semibold text-muted-foreground transition hover:text-foreground sm:py-3.5"
            >
              {c.ctaTertiaryLabel} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
          </Reveal>
          {(c.proofMetric || c.proofText) && (
            <Reveal className="mt-7" delay={0.5} duration={0.5}>
              <a
                href={c.proofCaseHref || "/cases"}
                className="group inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-sm transition hover:border-white/25 hover:bg-white/[0.06]"
              >
                <span className="inline-flex h-9 items-center rounded-full bg-gradient-brand px-3 text-sm font-semibold text-white shadow-brand">
                  {c.proofMetric}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  {c.proofText}
                </span>
                {c.proofCaseLabel && (
                  <span className="hidden shrink-0 items-center gap-1 text-sm font-semibold text-foreground sm:inline-flex">
                    {c.proofCaseLabel}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                  </span>
                )}
              </a>
            </Reveal>
          )}

        </div>
      </div>
    </section>
  );
}

function TrustStrip() {
  const header = useCmsSection<{ eyebrow: string; showLogos: boolean; logosCaption: string }>("trust_strip");
  const metrics = useCmsCollection<{ value: string; prefix?: string; label: string }>("trust_metrics");
  const logos = useCmsCollection<{ name: string; logo: string; url?: string }>("trust_logos");

  const hasMetrics = metrics.length > 0;
  const hasLogos = header.showLogos && logos.length > 0;

  if (!hasMetrics && !hasLogos) return null;

  return (
    <section className="border-b border-white/5">
      <div className="container-x py-12 md:py-16">
        {hasMetrics && (
          <div className="mb-10 text-center md:mb-12">
            <p className="eyebrow mb-6">{header.eyebrow}</p>
            <dl className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-8 gap-y-8 md:gap-x-14">
              {metrics.map((m, i, arr) => (
                <Fragment key={m.id}>
                  <div className="text-center">
                    <dt className="display text-3xl font-bold text-foreground md:text-4xl">
                      {m.data.prefix ? <span className="text-brand-sky">{m.data.prefix}</span> : null}
                      <CountUp value={m.data.value} />
                    </dt>
                    <dd className="mt-1.5 text-xs uppercase tracking-wider text-muted-foreground">{m.data.label}</dd>
                  </div>
                  {i < arr.length - 1 && (
                    <span aria-hidden className="hidden h-10 w-px bg-white/10 md:block" />
                  )}
                </Fragment>
              ))}
            </dl>
          </div>
        )}
        {hasLogos && (
          <div className="text-center">
            <p className="mb-5 text-xs uppercase tracking-wider text-muted-foreground">{header.logosCaption}</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {logos.map((logo) => (
                <a
                  key={logo.id}
                  href={logo.data.url}
                  target={logo.data.url && /^https?:/.test(logo.data.url) ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
                >
                  {logo.data.logo ? (
                    <img src={logo.data.logo} alt={logo.data.name} className="h-8 max-w-[140px] object-contain md:h-10" />
                  ) : (
                    <span className="text-sm font-semibold text-muted-foreground">{logo.data.name}</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}



const ICON_MAP = ICON_OPTIONS;
function pickIcon(name: string | undefined) {
  return (name && (ICON_MAP as Record<string, typeof Compass>)[name]) || Compass;
}
function splitLines(s: string | undefined): string[] {
  return (s ?? "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
}

const DEFAULT_VALUE_PROPS = [
  { id: "default-product-thinking", title: "Product thinking, first",            description: "We start with the business goal, the people doing the work, and what's actually feasible — before anyone writes code", icon: "Compass" },
  { id: "default-ai-payback", title: "AI only where it pays back",         description: "We use AI inside real workflows where it saves hours or unlocks revenue — not because it's on the roadmap slide", icon: "Cpu" },
  { id: "default-automation", title: "Automate the boring, repeatable work", description: "CRMs, inboxes, spreadsheets, lead sources, internal tools — connected so your team stops being the integration layer", icon: "Workflow" },
  { id: "default-cto", title: "A CTO in the room",                  description: "Senior technical guidance for non-technical founders and operators — architecture, vendors and roadmap decisions without the guesswork", icon: "Compass" },
  { id: "default-end-to-end", title: "One team, end to end",               description: "Discovery, design, architecture, engineering, integrations, QA, launch and support — under a single accountable partner", icon: "ShieldCheck" },
];

function ValueProposition() {
  const header = useCmsSection<{ eyebrow: string; title: string }>("value_props_header");
  const rows = useCmsCollection<{ title: string; description: string; icon: string }>("value_props");
  const items = rows.length ? rows.map((r) => ({ id: r.id, ...r.data })) : DEFAULT_VALUE_PROPS;

  return (
    <section className="container-x py-24">
      <Reveal className="mb-16 max-w-4xl">
        <p className="eyebrow mb-3">{header.eyebrow}</p>
        <h2 className="display text-balance text-4xl font-bold leading-tight md:text-5xl">
          {header.title}
        </h2>
      </Reveal>



      <div className="relative">
        {/* Vertical progress rail */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-brand-sky/60 via-brand/40 to-transparent md:left-1/2 md:-translate-x-1/2"
        />
        <RevealGroup as="ol" className="relative space-y-6 md:space-y-10" stagger={0.12}>
          {items.map((item, idx) => {
            const Icon = pickIcon(item.icon);
            const isLeft = idx % 2 === 0;
            return (
              <RevealItem
                key={item.id}
                as="li"
                className="relative md:grid md:grid-cols-2 md:gap-10"
              >
                {/* Node on rail */}
                <div className="absolute left-0 top-1.5 z-10 md:left-1/2 md:-translate-x-1/2">
                  <div className="relative grid h-10 w-10 place-items-center rounded-full border border-brand-sky/40 bg-background shadow-[0_0_0_4px_rgba(15,17,28,1)]">
                    <span className="display text-[11px] font-bold tracking-widest text-brand-sky">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="absolute inset-0 -z-10 rounded-full bg-brand/30 blur-md" />
                  </div>
                </div>

                {/* Card */}
                <div
                  className={[
                    "pl-16 md:pl-0",
                    isLeft ? "md:col-start-1 md:pr-12 md:text-right" : "md:col-start-2 md:pl-12",
                  ].join(" ")}
                >
                  <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-card p-6 transition duration-300 hover:-translate-y-1 hover:border-brand-sky/30 hover:shadow-card">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-brand/20 opacity-0 blur-2xl transition group-hover:opacity-100" />
                    <div className={isLeft ? "md:flex md:justify-end" : ""}>
                      <Icon className="h-7 w-7 text-brand-sky transition group-hover:scale-110" />
                    </div>
                    <h3 className="display mt-4 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>

  );
}

const DEFAULT_SERVICES = [
  { number: "01", title: "Digital Product Development", linkHref: "/services",
    summary: "Web, mobile, SaaS, CRM, fintech and internal tools — taken from first sketch to a product your customers use",
    tags: "Discovery\nUX/UI\nArchitecture\nEngineering\nQA\nLaunch" },
  { number: "02", title: "AI Implementation", linkHref: "/ai-solutions",
    summary: "Assistants, RAG, contract analysis, AI SDRs and mentors — built on your own data and shipped into real workflows",
    tags: "RAG\nAI Agents\nPrivate data\nOpenAI\nLangChain" },
  { number: "03", title: "Business Automation", linkHref: "/services",
    summary: "Connect the tools your team already lives in — CRMs, inboxes, spreadsheets — so manual work stops eating the week",
    tags: "n8n\nZapier\nNode.js\nCRM\nAPIs" },
  { number: "04", title: "CTO-as-a-Service", linkHref: "/services",
    summary: "A senior tech partner for founders and operators: architecture calls, roadmap, vendor control, risk — without a full-time hire",
    tags: "Architecture\nRoadmap\nVendor control\nRisk" },
];

function Services() {
  const header = useCmsSection<{ eyebrow: string; title: string; linkLabel: string; linkHref: string }>("services_header");
  const rows = useCmsCollection<{ number: string; title: string; summary: string; linkHref: string; tags: string }>("services");
  const items = rows.length ? rows.map((r) => r.data) : DEFAULT_SERVICES;

  return (
    <section className="container-x py-24">
      <Reveal className="mb-14 flex items-end justify-between gap-8">
        <div className="max-w-3xl">
          <p className="eyebrow mb-3">{header.eyebrow}</p>
          <h2 className="display text-4xl font-bold leading-tight md:text-5xl">{header.title}</h2>
        </div>
        <a href={header.linkHref} className="group hidden items-center gap-1 text-sm font-semibold text-brand-sky hover:text-foreground md:inline-flex">
          {header.linkLabel} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </a>
      </Reveal>
      <RevealGroup className="grid gap-4 md:grid-cols-2 md:auto-rows-fr" stagger={0.12}>
        {items.map((s, idx) => (
          <RevealItem key={`${s.title}-${idx}`} className="h-full">
            <div className="group relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-3xl border border-white/5 bg-card p-8 transition duration-300 hover:-translate-y-1 hover:border-brand-sky/40 hover:shadow-brand">
              <div className="flex items-start justify-between">
                <span className="display text-sm font-bold tracking-widest text-brand-sky">{s.number}</span>
              </div>
              <h3 className="display mt-8 text-2xl font-bold md:text-3xl">{s.title}</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
              <div className="mt-auto pt-6 flex flex-wrap gap-1.5">
                {splitLines(s.tags).map((t) => (
                  <span key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground transition group-hover:border-brand-sky/30 group-hover:text-foreground">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>

    </section>
  );
}

const DEFAULT_CASES = [
  { name: "Fine Clause", kind: "AI Contract Analysis",
    summary: "Reads legal documents and surfaces the clauses, risks and obligations a human would otherwise hunt for",
    outcome: "−70% contract review time",
    chips: "LegalTech\nRAG\nDocument AI", image: caseFineClause },
  { name: "AI SDR Automation", kind: "Sales Automation",
    summary: "Enriches leads, personalises outreach and keeps the CRM clean — so reps spend time on real conversations",
    outcome: "3× qualified meetings per SDR",
    chips: "AI Agents\nCRM\nn8n", image: caseAiSdr },
  { name: "Galaxy Connext", kind: "Gamification for Kids",
    summary: "A gamified app that drives learning, engagement and sponsor opportunities for younger audiences",
    outcome: "4.8★ retention with 35% DAU lift",
    chips: "Mobile\nGamification\nEdTech", image: caseGalaxy },
  { name: "Site Parsers", kind: "Data Engineering",
    summary: "Custom parsers that feed lead gen, market research and AI datasets — reliably, at scale",
    outcome: "10M+ pages/day at 99.5% uptime",
    chips: "Parsing\nBig Data\nPipelines", image: caseSiteParsers },
];

const CASE_FALLBACK_IMAGES: Record<string, string> = {
  "Fine Clause": caseFineClause,
  "AI SDR Automation": caseAiSdr,
  "Galaxy Connext": caseGalaxy,
  "Site Parsers": caseSiteParsers,
};

function FeaturedCases() {
  const header = useCmsSection<{ eyebrow: string; title: string; linkLabel: string; linkHref: string }>("cases_header");
  const rows = useCmsCollection<{ name: string; kind: string; summary: string; outcome: string; image: string; chips: string }>("case_studies");
  const items = rows.length ? rows.map((r) => r.data) : DEFAULT_CASES;

  return (
    <section className="container-x py-24">
      <Reveal className="mb-14 flex items-end justify-between gap-8">
        <div className="max-w-3xl">
          <p className="eyebrow mb-3">{header.eyebrow}</p>
          <h2 className="display text-4xl font-bold leading-tight md:text-5xl">{header.title}</h2>
        </div>
        <a href={header.linkHref} className="group hidden items-center gap-1 text-sm font-semibold text-brand-sky hover:text-foreground md:inline-flex">
          {header.linkLabel} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </a>
      </Reveal>
      {items.length > 4 ? (
        <CasesCarousel items={items} />
      ) : (
        <RevealGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" stagger={0.1}>
          {items.map((c, idx) => (
            <CaseCard key={`${c.name}-${idx}`} c={c} />
          ))}
        </RevealGroup>
      )}
      <Reveal className="mt-10 flex justify-center md:hidden">
        <a href={header.linkHref} className="group inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-white/30 hover:bg-white/5">
          {header.linkLabel} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </a>
      </Reveal>
    </section>
  );
}

type CaseItem = { name: string; kind: string; summary: string; outcome?: string; image: string; chips: string };

function CaseCard({ c }: { c: CaseItem }) {
  const img = c.image || CASE_FALLBACK_IMAGES[c.name] || "";
  return (
    <RevealItem
      as="article"
      className="group relative overflow-hidden rounded-2xl border border-white/5 bg-card transition duration-300 hover:-translate-y-1 hover:border-white/20"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={c.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-brand-soft" />
        )}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
      </div>
      <div className="p-5">
        <p className="text-xs uppercase tracking-wider text-brand-sky">{c.kind}</p>
        <h3 className="display mt-1.5 text-xl font-bold">{c.name}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{c.summary}</p>
        {c.outcome && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-brand-sky/30 bg-brand-sky/10 px-2.5 py-1 text-[11px] font-semibold text-brand-sky">
            <span aria-hidden>↗</span>
            <span>{c.outcome}</span>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {splitLines(c.chips).map((t) => (
            <span key={t} className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
              {t}
            </span>
          ))}
        </div>
      </div>
    </RevealItem>
  );
}

function CasesCarousel({ items }: { items: CaseItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const manualPauseUntilRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // honor user preference — skip autoplay entirely
    let rafId = 0;
    let last = performance.now();
    const SPEED = 40; // px per second

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const manuallyPaused = now < manualPauseUntilRef.current;
      if (!pausedRef.current && !manuallyPaused) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 0) {
          let next = el.scrollLeft + SPEED * dt;
          if (next >= max - 0.5) next = 0; // loop to start
          el.scrollLeft = next;
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);


    const onEnter = () => { pausedRef.current = true; };
    const onLeave = () => { pausedRef.current = false; };
    const onManual = () => { manualPauseUntilRef.current = performance.now() + 3000; };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onEnter, { passive: true });
    el.addEventListener("touchend", onLeave, { passive: true });
    el.addEventListener("wheel", onManual, { passive: true });
    el.addEventListener("pointerdown", onManual);

    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onEnter);
      el.removeEventListener("touchend", onLeave);
      el.removeEventListener("wheel", onManual);
      el.removeEventListener("pointerdown", onManual);
    };
  }, [items.length]);

  return (
    <div
      ref={ref}
      className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {items.map((c, idx) => (
        <div
          key={`${c.name}-${idx}`}
          className="w-[280px] shrink-0 snap-start sm:w-[320px] lg:w-[360px]"
        >
          <CaseCard c={c} />
        </div>
      ))}
    </div>
  );
}



function WhyEmpatix() {
  const c = useCmsSection<{ eyebrow: string; title: string; body: string; points: string }>("why_empatix");
  const points = splitLines(c.points);
  return (
    <section className="relative overflow-hidden border-y border-white/5">
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-brand-soft" />
      <div className="container-x grid gap-12 py-24 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <p className="eyebrow mb-3">{c.eyebrow}</p>
          <h2 className="display text-balance text-4xl font-bold leading-tight md:text-5xl">
            {c.title}
          </h2>
          <p className="mt-5 max-w-lg text-muted-foreground">{c.body}</p>
        </Reveal>
        <ul className="grid gap-3 self-center">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-3 rounded-xl border border-white/5 bg-card/60 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-sky" />
              <span className="text-sm">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

type ProcessContent = {
  eyebrow: string; title: string;
  step1Title: string; step1Body: string;
  step2Title: string; step2Body: string;
  step3Title: string; step3Body: string;
  step4Title: string; step4Body: string;
  step5Title?: string; step5Body?: string;
  step6Title?: string; step6Body?: string;
};

function ProcessStrip() {
  const c = useCmsSection<ProcessContent>("process");

  const allSteps = [
    { title: c.step1Title, body: c.step1Body },
    { title: c.step2Title, body: c.step2Body },
    { title: c.step3Title, body: c.step3Body },
    { title: c.step4Title, body: c.step4Body },
    { title: c.step5Title, body: c.step5Body },
    { title: c.step6Title, body: c.step6Body },
  ].filter((s) => s.title && s.title.trim().length > 0) as { title: string; body: string }[];

  const variantClass = (i: number) => {
    const v = i % 4;
    if (v === 0) return "group relative flex min-h-[260px] flex-col justify-between rounded-[2rem] border border-white/5 bg-card/60 p-7 transition-all hover:bg-card/80 hover:border-brand-sky/20";
    if (v === 1) return "group relative flex min-h-[300px] flex-col justify-between rounded-[2.25rem] border-2 border-brand-sky/25 bg-card p-7 transition-all hover:border-brand-sky/45 lg:mt-10 lg:min-h-[340px]";
    if (v === 2) return "group relative flex min-h-[280px] flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-card p-8 text-center shadow-[0_0_50px_-12px_rgb(59_130_246/0.18)] transition-all hover:shadow-[0_0_60px_-10px_rgb(59_130_246/0.28)] lg:min-h-[320px]";
    return "group relative flex min-h-[260px] flex-col justify-between rounded-[2rem] border border-white/5 bg-card/60 p-7 transition-all hover:bg-card/80 hover:border-brand-sky/20 lg:mt-20";
  };

  const gridCols = allSteps.length >= 5
    ? "grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
    : "grid grid-cols-1 items-start gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8";

  return (
    <section className="container-x py-24">
      <Reveal className="mb-12 flex items-end justify-between gap-8">
        <div>
          <p className="eyebrow mb-3">{c.eyebrow}</p>
          <h2 className="display text-4xl font-bold md:text-5xl">{c.title}</h2>
        </div>
        <Link to="/how-we-work" className="group hidden items-center gap-1 text-sm font-semibold text-brand-sky md:inline-flex">
          See the full process <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      </Reveal>
      <ol className={gridCols}>
        {allSteps.map((s, i) => {
          const num = String(i + 1).padStart(2, "0");
          const v = i % 4;
          return (
            <li key={i} className={variantClass(i)}>
              {v === 0 && (
                <>
                  <span className="display text-base font-bold tracking-tighter text-brand-sky">{num}</span>
                  <div>
                    <h3 className="display text-xl font-bold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </>
              )}
              {v === 1 && (
                <>
                  <div>
                    <h3 className="display text-xl font-bold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                  <div className="display text-5xl font-bold tracking-tighter text-brand-sky/30 lg:text-6xl">{num}</div>
                </>
              )}
              {v === 2 && (
                <>
                  <span aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-1 w-32 -translate-x-1/2 bg-brand-sky/50 blur-sm" />
                  <span aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-brand-sky/10 blur-3xl" />
                  <span className="display mb-5 grid h-12 w-12 place-items-center rounded-xl bg-brand-sky/10 text-base font-bold text-brand-sky">{num}</span>
                  <h3 className="display text-2xl font-bold">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </>
              )}
              {v === 3 && (
                <>
                  <span aria-hidden className="display absolute right-7 top-6 text-3xl font-bold text-brand-sky/25">{num}</span>
                  <div className="mt-auto">
                    <h3 className="display text-xl font-bold">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                    <div aria-hidden className="mt-5 h-[3px] w-12 rounded-full bg-brand-sky/40 transition-all duration-500 group-hover:w-full" />
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function FinalCTA() {
  const c = useCmsSection<{
    title: string; body: string;
    primaryLabel: string; primaryHref: string;
    secondaryLabel: string; secondaryHref: string;
  }>("final_cta");
  return (
    <section className="container-x py-24">
      <Reveal>
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-brand p-10 shadow-brand md:p-16">
          <img
            src={ctaDiscoveryBg}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-screen"
          />
          <motion.div
            aria-hidden
            className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
            animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-black/30 blur-3xl"
            animate={{ x: [0, -18, 0], y: [0, 12, 0] }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative grid items-center gap-8 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="display text-balance text-3xl font-bold text-white md:text-5xl">
                {c.title}
              </h2>
              <p className="mt-4 max-w-xl text-white/80">{c.body}</p>
            </div>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <a
                href={c.primaryHref}
                target={/^https?:/.test(c.primaryHref) ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-black/80"
              >
                <span className="relative z-10 inline-flex items-center gap-2">
                  {c.primaryLabel}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </a>
              <a
                href={c.secondaryHref}
                target={/^https?:/.test(c.secondaryHref) ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <span className="relative z-10">{c.secondaryLabel}</span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

