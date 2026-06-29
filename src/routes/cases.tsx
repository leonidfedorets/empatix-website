import { createFileRoute, Link } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { ArrowRight, ExternalLink, Sparkles, Target, Wrench, CheckCircle2, ChevronLeft, ChevronRight, TrendingUp } from "lucide-react";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { PillBadge, Pagination } from "@/components/ds";
import { EditableHero, EditableCta } from "@/components/cms/EditablePageBlocks";
import { CmsMark } from "@/components/CmsMark";
import { useCmsCollection } from "@/lib/cms/useCmsContent";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { track } from "@/lib/analytics";

import bgCases from "@/assets/bg-cases.jpg";
import ctaCasesBg from "@/assets/cta-cases-bg.jpg";
import imgFineClause from "@/assets/case-fine-clause.jpg";
import imgFineClause2 from "@/assets/case-fine-clause-2.jpg";
import imgFineClause3 from "@/assets/case-fine-clause-3.jpg";
import imgOneStellara from "@/assets/case-onestellara.jpg";
import imgOneStellara2 from "@/assets/case-onestellara-2.jpg";
import imgOneStellara3 from "@/assets/case-onestellara-3.jpg";
import imgAureum from "@/assets/case-aureum.jpg";
import imgAureum2 from "@/assets/case-aureum-2.jpg";
import imgAureum3 from "@/assets/case-aureum-3.jpg";
import imgAiSdr from "@/assets/case-ai-sdr.jpg";
import imgAiSdr2 from "@/assets/case-ai-sdr-2.jpg";
import imgAiSdr3 from "@/assets/case-ai-sdr-3.jpg";
import imgLeadGen from "@/assets/case-lead-gen.jpg";
import imgLeadGen2 from "@/assets/case-lead-gen-2.jpg";
import imgLeadGen3 from "@/assets/case-lead-gen-3.jpg";
import imgFintech from "@/assets/case-fintech.jpg";
import imgFintech2 from "@/assets/case-fintech-2.jpg";
import imgFintech3 from "@/assets/case-fintech-3.jpg";
import imgCrmIntegrations from "@/assets/case-crm-integrations.jpg";
import imgCrmIntegrations2 from "@/assets/case-crm-integrations-2.jpg";
import imgCrmIntegrations3 from "@/assets/case-crm-integrations-3.jpg";
import imgGalaxy from "@/assets/case-galaxy-connext.jpg";
import imgGalaxy2 from "@/assets/case-galaxy-connext-2.jpg";
import imgGalaxy3 from "@/assets/case-galaxy-connext-3.jpg";
import imgSiteParsers from "@/assets/case-site-parsers.jpg";
import imgSiteParsers2 from "@/assets/case-site-parsers-2.jpg";
import imgSiteParsers3 from "@/assets/case-site-parsers-3.jpg";

const PAGE_SIZE = 4;

export const Route = createFileRoute("/cases")({
  head: () => ({
    ...seoMeta({
      title: 'Recent work — Empatix',
      description: 'Selected products and automations we have shipped — Fine Clause, OneStellara, Aureum, AI SDR, lead generation, fintech ops, CRM integrations and more',
      path: '/cases',
      breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Recent work', path: '/cases' }],
    }),
  }),
  component: CasesPage,
});

type CaseItem = {
  id?: string;
  name: string;
  kind: string;
  client: string;
  solution: string;
  chips: string[];
  image: string;
  image2?: string;
  image3?: string;
  details?: string;
  outcomes?: string[];
  demo?: string;
  askLabel?: string;
  askHref?: string;
};

const CASES: CaseItem[] = [
  { name: "Fine Clause", kind: "AI LegalTech / Contract Intelligence", client: "Legal and operations teams spend hours reviewing contracts manually — searching for clauses, risks and obligations across hundreds of pages, with high cost and easy-to-miss details.", solution: "Fine Clause is an AI-powered contract analysis product (web + mobile) that uploads documents, extracts key clauses, detects risks, summarises obligations and answers questions about contract text using private-data AI.", chips: ["AI", "LegalTech", "RAG", "Document AI"], image: imgFineClause, image2: imgFineClause2, image3: imgFineClause3, demo: "https://empatixtech.com" },
  { name: "OneStellara", kind: "AI CRM / BeautyTech", client: "Beauty salon owners juggle clients, appointments, staff schedules, communication and loyalty across messengers, spreadsheets and disconnected tools — losing revenue and retention.", solution: "OneStellara is an all-in-one CRM and business management platform for beauty salons — bookings, client profiles, communication, staff, loyalty and reporting in one system, with AI recommendations and marketing automation on top.", chips: ["CRM", "SaaS", "Automation", "AI"], image: imgOneStellara, image2: imgOneStellara2, image3: imgOneStellara3, demo: "https://empatixtech.com" },
  { name: "Aureum", kind: "AI Mentor / EdTech", client: "People who want structured personal development, learning support or coaching can't always afford a human mentor — and generic chatbots don't feel personal or contextual.", solution: "Aureum is an AI chat mentor application (web + mobile) that delivers interactive guidance, learning assistance and conversational coaching tailored to each user's goals and progress.", chips: ["AI Chat", "EdTech", "Mobile", "Conversational AI"], image: imgAureum, image2: imgAureum2, image3: imgAureum3, demo: "https://empatixtech.com" },
  { name: "AI SDR Automation", kind: "Sales Automation / AI Agent", client: "Outbound sales teams burn hours on lead research, list cleaning, personalised first-touch and CRM updates — slowing pipeline growth and burning out reps.", solution: "We build AI SDR workflows that collect leads, enrich data, generate personalised outreach, run multi-step communication, update CRM records and qualify replies — so reps focus on real conversations.", chips: ["AI Agents", "Sales", "CRM", "Automation"], image: imgAiSdr, image2: imgAiSdr2, image3: imgAiSdr3, demo: "https://empatixtech.com" },
  { name: "Lead Generation Automation", kind: "Data Automation / GrowthTech", client: "Growth teams need a steady, structured flow of qualified leads — but manual sourcing, enrichment and outreach prep is slow, inconsistent and impossible to scale.", solution: "End-to-end lead generation systems built with website parsers, enrichment APIs, n8n / Zapier / Node.js, CRM integrations, Google Sheets and custom dashboards — automating sourcing, structuring and outreach preparation.", chips: ["n8n", "Zapier", "Node.js", "Enrichment"], image: imgLeadGen, image2: imgLeadGen2, image3: imgLeadGen3, demo: "https://empatixtech.com" },
  { name: "Fintech Operations Automation", kind: "Fintech / Admin Automation", client: "Fintech companies carry heavy operational load — admin workflows, transaction handling, reconciliation, onboarding and reporting that grow faster than headcount can.", solution: "We automate fintech operational workflows: admin processes, CRM integrations, transaction-related logic, reconciliation, onboarding pipelines and internal business tools — reducing manual work and operational risk.", chips: ["Fintech", "Operations", "Integrations", "Compliance"], image: imgFintech, image2: imgFintech2, image3: imgFintech3, demo: "https://empatixtech.com" },
  { name: "CRM Integrations", kind: "Business Automation", client: "Businesses run on a stack of disconnected tools — CRM, email, messengers, spreadsheets, internal apps — forcing teams to copy data manually and losing context every time.", solution: "We connect CRMs to the rest of the business stack with custom integrations and automations — bi-directional sync, triggered workflows, dashboards and internal tooling that turn manual ops into controlled digital flows.", chips: ["CRM", "Integrations", "Automation", "Internal Tools"], image: imgCrmIntegrations, image2: imgCrmIntegrations2, image3: imgCrmIntegrations3, demo: "https://empatixtech.com" },
  { name: "Galaxy Connext", kind: "Gamification / Kids Engagement", client: "Brands, sponsors and educational programs want to engage kids through digital experiences — but generic apps don't drive retention or measurable engagement.", solution: "Galaxy Connext is a gamified application concept for kids and engagement-based programs — learning, entertainment and community interaction with sponsor and investor-backed launch potential.", chips: ["Gamification", "Mobile", "Engagement", "Product"], image: imgGalaxy, image2: imgGalaxy2, image3: imgGalaxy3, demo: "https://empatixtech.com" },
  { name: "Site Parsers", kind: "Data Engineering / Market Intelligence", client: "Sales, marketing and analytics teams need fresh structured data from external websites for leads, market analysis and monitoring — and scraping in-house is fragile and expensive.", solution: "Robust web parsers and data pipelines that source, clean and structure data from public sites — feeding lead generation, market intelligence, monitoring and dataset preparation use cases.", chips: ["Scraping", "Data Engineering", "Pipelines", "BI"], image: imgSiteParsers, image2: imgSiteParsers2, image3: imgSiteParsers3, demo: "https://empatixtech.com" },
];

type CmsCaseData = {
  name?: string;
  kind?: string;
  client?: string;
  solution?: string;
  chips?: string;
  image?: string;
  image2?: string;
  image3?: string;
  details?: string;
  outcomes?: string;
  demo?: string;
  askLabel?: string;
  askHref?: string;
};

function CasesPage() {
  const cms = useCmsCollection<CmsCaseData>("cases_page_items");
  const fallbackByName = new Map(CASES.map((c) => [c.name, c]));
  const items: CaseItem[] = cms.length
    ? cms.map((row) => {
        const fb = fallbackByName.get(row.data.name || "");
        return {
          id: row.id,
          name: row.data.name || fb?.name || "Untitled case",
          kind: row.data.kind || fb?.kind || "",
          client: row.data.client || fb?.client || "",
          solution: row.data.solution || fb?.solution || "",
          chips: (row.data.chips || "").split("\n").map((s) => s.trim()).filter(Boolean),
          image: row.data.image || fb?.image || "",
          image2: row.data.image2 || fb?.image2 || undefined,
          image3: row.data.image3 || fb?.image3 || undefined,
          details: row.data.details || undefined,
          outcomes: (row.data.outcomes || "").split("\n").map((s) => s.trim()).filter(Boolean),
          demo: row.data.demo || fb?.demo || undefined,
          askLabel: row.data.askLabel || "Ask about it",
          askHref: row.data.askHref || "/contact",
        };
      })
    : CASES;

  const [page, setPage] = useState(1);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const openCase = useCallback((idx: number) => {
    const c = items[idx];
    if (c) track("case_open", { case_name: c.name, case_kind: c.kind });
    setActiveIdx(idx);
  }, [items]);
  const [filter, setFilter] = useState<string>("All");


  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((c) => {
      const cat = (c.kind || "").split("/")[0].trim();
      if (cat) set.add(cat);
    });
    return ["All", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(
    () => (filter === "All" ? items : items.filter((c) => (c.kind || "").split("/")[0].trim() === filter)),
    [items, filter],
  );

  useEffect(() => { setPage(1); }, [filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const goTo = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    if (next === page) return;
    setPage(next);
    if (typeof window !== "undefined") {
      const el = document.getElementById("cases-grid");
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const active = activeIdx !== null ? items[activeIdx] : null;

  return (
    <SiteLayout>
      <EditableHero sectionKey="cases_page_hero" label="Cases — Hero" bgImage={bgCases} />

      <CmsMark kind="collection" target="cases_page_items" label="Cases — Items" as="div">
      <section id="cases-grid" className="container-x pb-10 scroll-mt-24">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4" data-cms-ignore="">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                  filter === cat
                    ? "border-brand-sky bg-brand-sky/15 text-brand-sky"
                    : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {filtered.length === 0
              ? "No cases"
              : <>Showing <span className="text-foreground">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of {filtered.length}</>}
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {visible.map((c) => {
            const globalIndex = items.indexOf(c);
            return (
              <article
                key={c.id ?? c.name}
                data-cms-ignore=""
                onClick={() => openCase(globalIndex)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openCase(globalIndex);
                  }
                }}
                className="group cursor-pointer overflow-hidden rounded-3xl border border-white/5 bg-card transition duration-500 hover:-translate-y-1 hover:border-white/15 hover:shadow-[0_20px_60px_-20px_rgba(56,189,248,0.25)] focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-sky"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-slate-900 to-black">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 grid place-items-center text-xs uppercase tracking-widest text-white/40">
                      No cover image
                    </div>
                  )}
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                  <div className="absolute left-6 top-6">
                    <span className="display text-xs font-bold tracking-widest text-white/80">
                      CASE {String(globalIndex + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="absolute right-6 top-6 hidden rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur transition group-hover:flex">
                    View details →
                  </div>
                  <div className="absolute bottom-5 left-6 right-6">
                    <p className="text-xs uppercase tracking-wider text-white/80">{c.kind || "New case"}</p>
                    <h2 className="display mt-1 text-2xl font-bold leading-tight text-white md:text-3xl">{c.name}</h2>
                  </div>
                </div>
                <div className="p-7">
                  <p className="text-xs uppercase tracking-wider text-brand-sky">The problem</p>
                  <p className="mt-2 text-sm text-muted-foreground">{c.client}</p>
                  <p className="mt-5 text-xs uppercase tracking-wider text-brand-sky">What we built</p>
                  <p className="mt-2 text-sm text-muted-foreground">{c.solution}</p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {c.chips.map((t) => (
                      <PillBadge key={t} variant="muted" size="md">{t}</PillBadge>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/5 pt-5" data-cms-ignore="">
                    {c.demo ? (
                      <a
                        href={c.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => { e.stopPropagation(); track("demo_click", { case_name: c.name, location: "card" }); }}

                        className="group/btn relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:brightness-110"
                      >
                        <span className="relative z-10 inline-flex items-center gap-2">
                          Live Demo
                          <ExternalLink className="h-3.5 w-3.5 transition group-hover/btn:translate-x-0.5" />
                        </span>
                        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                      </a>
                    ) : (
                      <span
                        aria-disabled="true"
                        title="Demo coming soon"
                        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm font-semibold text-muted-foreground/70"
                      >
                        Live Demo
                        <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    )}
                    {(() => {
                      const href = c.askHref || "/contact";
                      const label = c.askLabel || "Ask about it";
                      const isExternal = /^https?:\/\//i.test(href);
                      const cls = "group/ask inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-brand-sky transition hover:text-foreground";
                      const inner = (
                        <>
                          {label} <ArrowRight className="h-3.5 w-3.5 transition group-hover/ask:translate-x-0.5" />
                        </>
                      );
                      return isExternal ? (
                        <a href={href} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className={cls}>{inner}</a>
                      ) : (
                        <Link to={href} onClick={(e) => e.stopPropagation()} className={cls}>{inner}</Link>
                      );
                    })()}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div data-cms-ignore="">
          <Pagination
            className="mt-12"
            page={page}
            totalPages={totalPages}
            onChange={goTo}
            numberStyle="padded"
          />
        </div>
      </section>
      </CmsMark>

      <CaseModal
        item={active}
        index={activeIdx}
        onClose={() => setActiveIdx(null)}
      />

      <EditableCta sectionKey="cases_page_cta" label="Cases — Bottom CTA" bgImage={ctaCasesBg} align="center" />
    </SiteLayout>
  );
}

function CaseModal({ item, index, onClose }: { item: CaseItem | null; index: number | null; onClose: () => void }) {
  const [heroIdx, setHeroIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSwipeRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const wheelAccumRef = useRef<number>(0);
  const wheelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const open = !!item;

  const gallery = useMemo(
    () => (item ? ([item.image, item.image2, item.image3].filter(Boolean) as string[]) : []),
    [item],
  );

  useEffect(() => {
    wheelAccumRef.current = 0;
    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
  }, [open]);

  useEffect(() => {
    if (!open || gallery.length <= 1 || paused) return;
    const id = setInterval(() => {
      setHeroIdx((i) => (i + 1) % gallery.length);
    }, 4000);
    return () => clearInterval(id);
  }, [open, gallery.length, paused]);

  const pauseFor = (ms = 6000) => {
    setPaused(true);
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => setPaused(false), ms);
  };
  const goto = (i: number) => { setHeroIdx((i + gallery.length) % gallery.length); pauseFor(); };
  const prev = () => goto(heroIdx - 1);
  const next = () => goto(heroIdx + 1);

  const canSwipe = () => {
    const now = Date.now();
    if (now - lastSwipeRef.current < 400) return false;
    lastSwipeRef.current = now;
    return true;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (gallery.length <= 1) return;
    const dx = e.deltaX;
    const dy = e.deltaY;
    if (Math.abs(dx) <= Math.abs(dy)) return;
    e.preventDefault();
    e.stopPropagation();
    pauseFor(6000);
    wheelAccumRef.current += dx;
    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
    wheelTimeoutRef.current = setTimeout(() => { wheelAccumRef.current = 0; }, 220);
    if (Math.abs(wheelAccumRef.current) > 45) {
      if (!canSwipe()) {
        wheelAccumRef.current = 0;
        return;
      }
      if (wheelAccumRef.current > 0) next();
      else prev();
      wheelAccumRef.current = 0;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    pauseFor(6000);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.touches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const start = touchStartRef.current;
    touchStartRef.current = null;
    const t = e.changedTouches[0];
    const dx = start.x - t.clientX;
    const dy = start.y - t.clientY;
    const elapsed = Date.now() - start.time;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40 && elapsed < 600) {
      if (!canSwipe()) return;
      pauseFor(6000);
      if (dx > 0) next();
      else prev();
    }
  };

  useEffect(() => () => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    if (wheelTimeoutRef.current) clearTimeout(wheelTimeoutRef.current);
  }, []);


  if (!item) {
    return (
      <Dialog open={false} onOpenChange={(v) => !v && onClose()}>
        <DialogContent />
      </Dialog>
    );
  }

  const hero = gallery[heroIdx] ?? gallery[0];
  const askHref = item.askHref || "/contact";
  const askLabel = item.askLabel || "Ask about it";
  const askExternal = /^https?:\/\//i.test(askHref);

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { setHeroIdx(0); setPaused(false); onClose(); } }}>
      <DialogContent
        className="!max-w-none w-[min(96vw,1400px)] h-[min(92vh,900px)] gap-0 overflow-hidden border-white/10 bg-[#0b0d12] p-0 sm:rounded-2xl"
        data-cms-ignore=""
      >
        <DialogTitle className="sr-only">{item.name}</DialogTitle>
        <DialogDescription className="sr-only">{item.kind}</DialogDescription>

        <div className="grid h-full grid-rows-[auto_1fr] overflow-hidden md:grid-cols-[1.1fr_1fr] md:grid-rows-1">
          {/* Visual side — carousel */}
          <div
            className="relative flex h-full flex-col touch-pan-y bg-black cursor-grab active:cursor-grabbing"
            style={{ touchAction: "pan-y" }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto md:h-full md:flex-1">
              {gallery.length > 0 ? (
                <div
                  className="absolute inset-0 flex h-full transition-transform duration-700 ease-out"
                  style={{ width: `${gallery.length * 100}%`, transform: `translateX(-${heroIdx * (100 / gallery.length)}%)` }}
                >
                  {gallery.map((src, i) => (
                    <div key={src + i} className="relative h-full" style={{ width: `${100 / gallery.length}%` }}>
                      <img src={src} alt={`${item.name} — view ${i + 1}`} draggable={false} className="absolute inset-0 h-full w-full object-cover select-none" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0 grid place-items-center text-xs uppercase tracking-widest text-white/40">No image</div>
              )}
              <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40" />

              {index !== null && (
                <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">
                  <Sparkles className="h-3 w-3" /> Case {String(index + 1).padStart(2, "0")}
                </div>
              )}

              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/80"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 z-10 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-black/50 text-white backdrop-blur-md transition hover:bg-black/80"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
                    {gallery.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => goto(i)}
                        aria-label={`Go to image ${i + 1}`}
                        className={`h-1.5 rounded-full transition-all ${i === heroIdx ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"}`}
                      />
                    ))}
                  </div>
                </>
              )}

              <div className="absolute bottom-5 left-5 right-5">
                <p className="text-[11px] uppercase tracking-widest text-white/70">{item.kind}</p>
                <h3 className="display mt-1 text-2xl font-bold leading-tight text-white md:text-3xl">{item.name}</h3>
              </div>
            </div>
          </div>

          {/* Content side */}
          <div className="relative flex h-full flex-col overflow-y-auto bg-[#0b0d12]">
            {/* Sticky header with headline metric */}
            <div className="sticky top-0 z-10 border-b border-white/5 bg-[#0b0d12]/95 px-6 py-4 backdrop-blur md:px-8">
              {item.outcomes && item.outcomes[0] && (
                <div className="w-full rounded-xl border border-brand-sky/30 bg-brand-sky/10 px-3 py-1.5 text-left">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-sky/80">Result</p>
                  <p className="text-sm font-bold leading-tight text-brand-sky">{item.outcomes[0]}</p>
                </div>
              )}
            </div>

            <div className="flex-1 p-6 pb-28 md:p-8 md:pb-8">
              {item.chips.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-1.5">
                  {item.chips.map((t) => (
                    <PillBadge key={t} variant="muted" size="md">{t}</PillBadge>
                  ))}
                </div>
              )}

              <Section icon={<Target className="h-3.5 w-3.5" />} label="The problem">
                <p className="text-sm leading-relaxed text-muted-foreground">{item.client}</p>
              </Section>

              <Section icon={<Wrench className="h-3.5 w-3.5" />} label="What we built">
                <p className="text-sm leading-relaxed text-muted-foreground">{item.solution}</p>
              </Section>

              {item.details && (
                <Section icon={<Sparkles className="h-3.5 w-3.5" />} label="Deep dive">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{item.details}</p>
                </Section>
              )}

              {item.outcomes && item.outcomes.length > 0 && (
                <Section icon={<TrendingUp className="h-3.5 w-3.5" />} label="Outcomes">
                  <ul className="space-y-2">
                    {item.outcomes.map((o) => (
                      <li key={o} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-sky" />
                        <span>{o}</span>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}
            </div>

            {/* CTAs — sticky on mobile, inline on desktop */}
            <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-3 border-t border-white/10 bg-[#0b0d12]/95 px-6 py-4 backdrop-blur md:static md:bg-transparent md:px-8 md:py-6">
              {item.demo && (
                <a
                  href={item.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("demo_click", { case_name: item.name, location: "modal" })}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-brand transition hover:brightness-110 md:flex-none"

                >
                  Live Demo <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {askExternal ? (
                <a href={askHref} target="_blank" rel="noreferrer" className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-brand-sky hover:text-brand-sky md:flex-none">
                  {askLabel} <ArrowRight className="h-3.5 w-3.5" />
                </a>
              ) : (
                <Link to={askHref} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-foreground transition hover:border-brand-sky hover:text-brand-sky md:flex-none">
                  {askLabel} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="mb-2 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-brand-sky">
        {icon} {label}
      </div>
      {children}
    </div>
  );
}
