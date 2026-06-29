import { createFileRoute } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import {
  ArrowRight,
  Bot,
  FileSearch,
  MessageSquareCode,
  GraduationCap,
  Sparkles,
  Database,
  Upload,
  Layers,
  Search,
  ScanLine,
  Filter,
  LayoutDashboard,
  Plug,
  Brain,
  Send,
  Map as MapIcon,
  Eye,
  Server,
  ShieldCheck,
  KeyRound,
  BarChart3,
} from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CmsMark } from "@/components/CmsMark";
import { EditableHero, EditableCta } from "@/components/cms/EditablePageBlocks";
import { useCmsCollection } from "@/lib/cms/useCmsContent";
import { ICON_OPTIONS } from "@/components/admin/IconPicker";
import bgAi from "@/assets/bg-ai-solutions.jpg";
import ctaAiPocBg from "@/assets/cta-ai-poc-bg.jpg";
import aiDecorRag from "@/assets/ai-3d-rag.png";
import aiDecorContract from "@/assets/ai-3d-contract.png";
import aiDecorSdr from "@/assets/ai-3d-sdr.png";
import aiDecorMentor from "@/assets/ai-3d-mentor.png";
import aiDecorPrivate from "@/assets/ai-3d-private.png";
import aiDecorCopilot from "@/assets/ai-3d-copilot.png";

const DECOR_BY_ICON: Record<string, string> = {
  FileSearch: aiDecorRag,
  Sparkles: aiDecorContract,
  Bot: aiDecorSdr,
  GraduationCap: aiDecorMentor,
  Database: aiDecorPrivate,
  MessageSquareCode: aiDecorCopilot,
};

export const Route = createFileRoute("/ai-solutions")({
  head: () => ({
    ...seoMeta({
      title: 'AI that earns its place — Empatix',
      description: 'Practical AI inside real workflows: RAG assistants, contract analysis, AI SDR agents and mentors — built on your own data, shipped with metrics',
      path: '/ai-solutions',
      breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'AI solutions', path: '/ai-solutions' }],
    }),
  }),
  component: AiSolutionsPage,
});

// Local icon registry: lucide icons commonly used for AI cards (in addition
// to the shared IconPicker registry). Keeps tree-shaking happy.
const EXTRA_ICONS = {
  FileSearch, MessageSquareCode, GraduationCap, Upload, Search,
  ScanLine, Filter, LayoutDashboard, Plug, Send,
  Map: MapIcon, KeyRound, BarChart3,
} as const;

function pickIcon(name: string | undefined) {
  if (!name) return Sparkles;
  const local = (EXTRA_ICONS as Record<string, typeof Sparkles>)[name];
  if (local) return local;
  const shared = (ICON_OPTIONS as Record<string, typeof Sparkles>)[name];
  return shared || Sparkles;
}

function splitLines(s: string | undefined): string[] {
  return (s ?? "").split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function parseStepsLegacy(s: string | undefined): { icon: string; label: string }[] {
  return splitLines(s).slice(0, 3).map((line) => {
    const [icon, label] = line.split("|").map((p) => p.trim());
    return { icon: icon || "Sparkles", label: label || icon || "Step" };
  });
}

function buildSteps(card: Record<string, unknown>): { icon: string; label: string }[] {
  const structured = [1, 2, 3]
    .map((i) => {
      const icon = (card[`step${i}Icon`] as string) || "";
      const label = (card[`step${i}Label`] as string) || "";
      return icon || label ? { icon: icon || "Sparkles", label: label || icon || "Step" } : null;
    })
    .filter(Boolean) as { icon: string; label: string }[];
  if (structured.length) return structured;
  return parseStepsLegacy(card.steps as string | undefined);
}

void [Bot, Database, Brain, Eye, Server, ShieldCheck];

const DEFAULT_SOLUTIONS = [
  {
    id: "d-rag",
    icon: "FileSearch",
    title: "RAG assistants",
    summary: "Answers with citations, from your own docs",
    metric: "~25m",
    metricLabel: "research per case (was ~3h)",
    tags: "Docs\nSearch",
    steps: "Upload|Ingest\nLayers|Index\nSearch|Cite",
  },
  {
    id: "d-contract",
    icon: "Sparkles",
    title: "Contract analysis",
    summary: "Clauses, risks and dates pulled automatically",
    metric: "10×",
    metricLabel: "faster first-pass review",
    tags: "Legal\nExtract",
    steps: "ScanLine|Extract\nFilter|Classify\nLayoutDashboard|Review",
  },
  {
    id: "d-sdr",
    icon: "Bot",
    title: "AI SDR agents",
    summary: "Qualifies, drafts and updates the CRM",
    metric: "3×",
    metricLabel: "more qualified meetings",
    tags: "Sales\nCRM",
    steps: "Plug|Connect\nBrain|Train\nSend|Approve",
  },
  {
    id: "d-mentor",
    icon: "GraduationCap",
    title: "AI mentors & support",
    summary: "24/7 tutor on your own content",
    metric: "60%",
    metricLabel: "L1 tickets deflected",
    tags: "Support\nTutor",
    steps: "Map|Map\nBot|Persona\nEye|Embed",
  },
  {
    id: "d-private",
    icon: "Database",
    title: "Private-data AI",
    summary: "Inference inside your VPC, governed",
    metric: "100%",
    metricLabel: "in-VPC inference",
    tags: "Security\nVPC",
    steps: "Server|Deploy\nShieldCheck|Govern\nKeyRound|Audit",
  },
  {
    id: "d-copilot",
    icon: "MessageSquareCode",
    title: "Workflow copilots",
    summary: "Copilots inside the tools you already use",
    metric: "7h/wk",
    metricLabel: "saved per operator",
    tags: "Embedded\nOps",
    steps: "Eye|Observe\nLayers|Embed\nBarChart3|Measure",
  },
];

function AiSolutionsPage() {
  const rows = useCmsCollection<Record<string, string>>("ai_solutions_cards");
  const items: Array<Record<string, string> & { id: string }> = rows.length
    ? rows.map((r) => ({ id: r.id, ...r.data }))
    : (DEFAULT_SOLUTIONS as Array<Record<string, string> & { id: string }>);

  return (
    <SiteLayout>
      <EditableHero sectionKey="ai_solutions_hero" label="AI Solutions — Hero" bgImage={bgAi} />

      <CmsMark kind="collection" target="ai_solutions_cards" label="AI Solutions — Cards" as="div">
        <section className="container-x py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {items.map((card) => {
              const Icon = pickIcon(card.icon);
              const tags = splitLines(card.tags);
              const steps = buildSteps(card as unknown as Record<string, unknown>);
              return (
                <article
                  key={card.id}
                  className="group relative isolate flex min-h-[460px] flex-col overflow-hidden rounded-3xl border border-white/5 bg-card transition-all duration-500 hover:-translate-y-1 hover:border-brand-sky/40"
                >
                  <div className="relative h-44 overflow-hidden bg-gradient-to-br from-card via-card to-brand-deep/40">
                    {/* Luminous glass depth — glow and blurred image layers */}
                    <div className="pointer-events-none absolute inset-0 z-0">
                      <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-sky/20 blur-[80px] mix-blend-screen opacity-70 transition-opacity duration-700 group-hover:opacity-100" />
                      <div className="absolute right-1/4 top-1/3 h-40 w-40 rounded-full bg-brand-sky/10 blur-[40px] mix-blend-overlay" />
                      <div className="absolute bottom-0 right-0 -mb-12 -mr-12 h-48 w-48 rotate-12 rounded-full border border-white/5 bg-gradient-to-tr from-white/5 to-transparent backdrop-blur-[2px]" />
                      <div className="absolute bottom-8 right-8 h-24 w-24 rotate-[35deg] rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]" />
                    </div>

                    {(card.image || DECOR_BY_ICON[card.icon]) && (
                      <>
                        {/* Blurred glow duplicate */}
                        <img
                          src={card.image || DECOR_BY_ICON[card.icon]}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          width={1024}
                          height={1024}
                          className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-[0.35] mix-blend-screen transition-all duration-700 group-hover:scale-110 group-hover:opacity-[0.55]"
                          style={{ filter: "blur(14px) saturate(1.25)" }}
                        />
                        {/* Soft-edged main image */}
                        <img
                          src={card.image || DECOR_BY_ICON[card.icon]}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          width={1024}
                          height={1024}
                          className="pointer-events-none absolute left-1/2 top-1/2 z-[1] h-52 w-52 -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-[0.24] mix-blend-screen transition-all duration-700 group-hover:scale-110 group-hover:opacity-[0.42]"
                          style={{
                            maskImage: "radial-gradient(circle at center, black 40%, transparent 75%)",
                            WebkitMaskImage: "radial-gradient(circle at center, black 40%, transparent 75%)",
                            filter: "blur(2px) drop-shadow(0 0 24px color-mix(in srgb, var(--brand-sky) 35%, transparent))",
                          }}
                        />
                      </>
                    )}

                    <div aria-hidden className="absolute inset-0 z-[5] bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(125,200,255,0.14),transparent_60%)] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                    <div aria-hidden className="pointer-events-none absolute -inset-x-1/2 -inset-y-1/4 z-[5] -translate-x-full bg-gradient-to-r from-transparent via-brand-sky/15 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full" />
                    <div aria-hidden className="absolute inset-0 z-[5] opacity-30 [background-image:linear-gradient(rgba(125,160,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(125,160,255,0.07)_1px,transparent_1px)] [background-size:32px_32px]" />
                    <div aria-hidden className="absolute inset-0 z-[5] bg-gradient-to-b from-transparent via-card/30 to-card" />

                    <div className="absolute left-5 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-sky/30 bg-card/70 backdrop-blur-md transition-transform duration-500 group-hover:scale-110">
                      <Icon className="h-6 w-6 text-brand-sky drop-shadow-[0_0_12px_rgb(59_130_246/0.5)]" />
                    </div>

                    <div className="absolute right-5 top-5 z-10 flex gap-1.5">
                      {tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/15 bg-card/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/80 backdrop-blur-md">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h2 className="display absolute bottom-4 left-5 right-5 z-10 text-[1.4rem] font-bold leading-tight text-foreground">
                      {card.title}
                    </h2>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-sm text-muted-foreground">{card.summary}</p>
                    <div className="mt-5 flex items-end gap-3 border-t border-white/5 pt-5">
                      <span className="display text-5xl font-extrabold leading-none text-brand-sky drop-shadow-[0_0_24px_rgb(59_130_246/0.35)]">
                        {card.metric}
                      </span>
                      <span className="pb-1 text-xs leading-snug text-muted-foreground">
                        {card.metricLabel}
                      </span>
                    </div>
                    {steps.length > 0 && (
                      <div className="mt-auto pt-6">
                        <div className="flex items-center gap-2">
                          {steps.map((step, idx) => {
                            const StepIcon = pickIcon(step.icon);
                            return (
                              <div key={`${step.label}-${idx}`} className="flex flex-1 items-center gap-2">
                                <div className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-white/8 bg-background/40 px-2 py-2.5 backdrop-blur-sm transition-colors group-hover:border-brand-sky/25">
                                  <StepIcon className="h-4 w-4 text-brand-sky" />
                                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/75">
                                    {step.label}
                                  </span>
                                </div>
                                {idx < steps.length - 1 && (
                                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground/50" aria-hidden />
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </CmsMark>

      <EditableCta sectionKey="ai_solutions_cta" label="AI Solutions — Bottom CTA" bgImage={ctaAiPocBg} />
    </SiteLayout>
  );
}
