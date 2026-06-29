import { createFileRoute, Link } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { ArrowRight, Check, Clock, Shield, Layers, UserCheck } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/SiteLayout";
import ctaTeamBg from "@/assets/cta-team-bg.jpg";

// Hidden page — intentionally not linked from the main navigation.
// Shared directly with prospects evaluating team extension / outstaffing.
export const Route = createFileRoute("/team-extension")({
  head: () => ({
    ...seoMeta({
      title: 'Team Extension — Senior Engineers On Demand | Empatix',
      description: 'Extend your engineering team with senior developers, AI engineers and tech leads — embedded into your processes, billed transparently, ready in days',
      path: '/team-extension', noindex: true,
    }),
  }),
  component: TeamExtensionPage,
});

const ROLES = [
  { t: "Senior Full-Stack Engineer", s: "React, Next.js, Node, TypeScript, Postgres" },
  { t: "AI / ML Engineer", s: "LLM apps, RAG, agents, evaluation, vector stores" },
  { t: "Backend Engineer", s: "Node, Python, Go — APIs, integrations, infra" },
  { t: "DevOps / Platform Engineer", s: "AWS, GCP, Kubernetes, CI/CD, observability" },
  { t: "Tech Lead / Architect", s: "System design, technical ownership, mentoring" },
  { t: "Automation Engineer", s: "n8n, Make, Zapier, custom integrations" },
];

const WHY = [
  { icon: Clock, t: "Ready in days", d: "Pre-vetted engineers from our bench — typical kickoff in 5–10 business days" },
  { icon: UserCheck, t: "Senior only", d: "5+ years of hands-on experience. No juniors hiding behind senior rate cards" },
  { icon: Layers, t: "Embedded, not siloed", d: "We join your standups, tools and rituals — and work as part of your team" },
  { icon: Shield, t: "Transparent contracts", d: "Hourly or monthly. Swap any engineer within two weeks if the fit isn't right" },
];

const HOW = [
  "Discovery call — we map the role, seniority and stack you need",
  "Shortlist within 5 business days, with CVs and intro calls",
  "Technical interview with your team — you make the final call",
  "Engineer onboards into your tools, repos and rituals",
  "Weekly reporting, monthly check-in, swap anytime",
];

function TeamExtensionPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Team Extension"
        title={<>Senior engineers, <span className="text-gradient">embedded into your team</span></>}
        description="When you need to ship faster without the overhead of hiring — bring in senior Empatix engineers, embedded into your processes, transparent on cost, ready in days"
      />

      <section className="container-x grid gap-4 pb-20 md:grid-cols-2 lg:grid-cols-4">
        {WHY.map((w) => (
          <article key={w.t} className="rounded-3xl border border-white/5 bg-card p-6">
            <w.icon className="h-6 w-6 text-brand-sky" />
            <h3 className="display mt-4 text-lg font-bold">{w.t}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{w.d}</p>
          </article>
        ))}
      </section>

      <section className="container-x pb-20">
        <h2 className="display text-3xl font-bold md:text-4xl">Roles we cover</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A focused bench of senior engineers and tech leads — most engagements start with 1–3 people
          and scale up as the work grows
        </p>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r.t} className="flex items-start gap-4 rounded-2xl border border-white/5 bg-card p-5">
              <Check className="mt-1 h-5 w-5 shrink-0 text-brand-sky" />
              <div>
                <div className="font-semibold">{r.t}</div>
                <div className="mt-1 text-sm text-muted-foreground">{r.s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-x pb-20">
        <h2 className="display text-3xl font-bold md:text-4xl">How it works</h2>
        <ol className="mt-8 space-y-3">
          {HOW.map((step, i) => (
            <li key={step} className="flex items-start gap-4 rounded-2xl border border-white/5 bg-card p-5">
              <span className="display text-2xl font-bold text-brand-sky/80">0{i + 1}</span>
              <span className="pt-1 text-foreground/90">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x pb-24">
        <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-brand p-10 shadow-brand md:p-14">
          <img
            src={ctaTeamBg}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-30 mix-blend-screen transition-all duration-700 group-hover:scale-105 group-hover:opacity-50"
          />
          <div className="relative grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="display text-3xl font-bold text-white md:text-4xl">
                Need senior engineers next week?
              </h2>
              <p className="mt-3 text-white/80">
                Tell us the role, the stack and your timeline — we'll come back with a shortlist within 5 business days
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white md:justify-self-end"
            >
              Request a shortlist <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
