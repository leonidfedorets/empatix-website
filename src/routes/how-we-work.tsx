import { createFileRoute } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { SiteLayout } from "@/components/SiteLayout";
import { CmsMark } from "@/components/CmsMark";
import { EditableHero, EditableCta } from "@/components/cms/EditablePageBlocks";
import { useCmsCollection } from "@/lib/cms/useCmsContent";
import bgHow from "@/assets/bg-how-we-work.jpg";
import ctaProcessBg from "@/assets/cta-process-bg.jpg";

export const Route = createFileRoute("/how-we-work")({
  head: () => ({
    ...seoMeta({
      title: 'How we work — Empatix',
      description: 'A transparent four-step way of working — discovery, concept, build and launch — with weekly demos and clear deliverables at every stage',
      path: '/how-we-work',
      breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'How we work', path: '/how-we-work' }],
    }),
  }),
  component: HowWeWorkPage,
});

const DEFAULT_STEPS = [
  { id: "d-01", number: "01", title: "Discovery",   body: "A free 30-minute call to understand the business goal, the people doing the work and where automation or AI could pay back. For larger products, we follow up with a paid discovery package — requirements, architecture, roadmap and estimate", deliverables: "Business goals & success metrics\nUser flows & feature scope\nArchitecture sketch\nRoadmap & estimate" },
  { id: "d-02", number: "02", title: "Concept",     body: "We shape the solution before code — UX/UI, system design, data model and integrations — so the team builds the right thing the first time", deliverables: "UX/UI design\nSolution architecture\nIntegration & data plan\nMVP scope" },
  { id: "d-03", number: "03", title: "Build",       body: "Engineering, AI, automation, integrations and QA — shipped in weekly demos so you always see working software, not slide decks", deliverables: "Sprint demos\nCode, infrastructure & docs\nQA & security checks\nProduction deployment" },
  { id: "d-04", number: "04", title: "Launch & support", body: "We take you live, watch the metrics and keep iterating — with CTO-level guidance available as long as you need it", deliverables: "Monitoring & alerting\nIteration backlog\nSupport SLA\nFractional CTO advisory" },
];

function splitLines(s: string | undefined): string[] {
  return (s ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function HowWeWorkPage() {
  const rows = useCmsCollection<{ number: string; title: string; body: string; deliverables: string }>("how_we_work_steps");
  const items = rows.length ? rows.map((r) => ({ id: r.id, ...r.data })) : DEFAULT_STEPS;

  return (
    <SiteLayout>
      <EditableHero sectionKey="how_we_work_hero" label="How We Work — Hero" bgImage={bgHow} />
      <CmsMark kind="collection" target="how_we_work_steps" label="How We Work — Steps" as="section" className="container-x space-y-4 pb-24">
        {items.map((s) => (
          <article
            key={s.id}
            className="grid gap-8 rounded-3xl border border-white/5 bg-card p-8 transition duration-500 hover:border-brand-sky/20 md:grid-cols-[200px_1fr] md:p-12"
          >
            <div>
              <span className="display text-5xl font-bold text-brand-sky/80 [text-shadow:0_0_30px_rgba(56,189,248,0.25)]">{s.number}</span>
              <h2 className="display mt-3 text-2xl font-bold">{s.title}</h2>
            </div>
            <div>
              <p className="text-muted-foreground">{s.body}</p>
              {splitLines(s.deliverables).length > 0 && (
                <>
                  <h3 className="eyebrow mt-6">Deliverables</h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {splitLines(s.deliverables).map((o) => (
                      <li key={o} className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-sm transition-colors duration-300 hover:border-brand-sky/30 hover:bg-white/[0.04]">{o}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </article>
        ))}
      </CmsMark>
      <EditableCta sectionKey="how_we_work_cta" label="How We Work — Bottom CTA" bgImage={ctaProcessBg} />
    </SiteLayout>
  );
}
