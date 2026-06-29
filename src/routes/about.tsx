import { createFileRoute } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { Sparkles, Target, Users, Compass, Linkedin } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { CountUp } from "@/components/motion/CountUp";
import { CmsMark } from "@/components/CmsMark";
import { EditableHero, EditableCta } from "@/components/cms/EditablePageBlocks";
import { useCmsSection, useCmsCollection } from "@/lib/cms/useCmsContent";
import { ICON_OPTIONS } from "@/components/admin/IconPicker";
import bgAbout from "@/assets/bg-about.jpg";
import ctaPartnerBg from "@/assets/cta-partner-bg.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    ...seoMeta({
      title: 'About Empatix — your AI & automation partner',
      description: 'We help operations and product teams ship AI products, automate the manual work and bring senior technical leadership — from first idea to live software',
      path: '/about',
      breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }],
    }),
  }),
  component: AboutPage,
});

function pickIcon(name: string | undefined) {
  return (name && (ICON_OPTIONS as Record<string, typeof Compass>)[name]) || Compass;
}

void [Sparkles, Target, Users];

type Stat = { value: string; label: string };
const DEFAULT_STATS: Stat[] = [
  { value: "8+", label: "years building products" },
  { value: "40+", label: "shipped products & integrations" },
  { value: "12", label: "industries served" },
  { value: "100%", label: "senior engineers" },
];


const DEFAULT_VALUES = [
  { id: "d-strategy", icon: "Target",   title: "Strategy before tickets",       description: "We start with the business outcome — not a feature list or an hours budget" },
  { id: "d-ai",       icon: "Sparkles", title: "AI that solves real problems",  description: "Practical AI wired into everyday workflows. Not demos that never ship" },
  { id: "d-auto",     icon: "Compass",  title: "Automation across the business", description: "From CRM integrations to internal ops — wherever manual work is quietly hiding" },
  { id: "d-senior",   icon: "Users",    title: "Senior people in the room",     description: "Strategic technology decisions without guesswork, and one team from idea to scale" },
];

const DEFAULT_TEAM = [
  { id: "d-iryna",   name: "Iryna Rymar",      role: "Head of Information Technology", photo: "https://empatixtech.com/wp-content/uploads/2025/05/iryna_rymar.jpg",         linkedin: "https://www.linkedin.com/in/iryna-martyrosian/" },
  { id: "d-denys",   name: "Denys Kiprushev",  role: "CTO",                            photo: "https://empatixtech.com/wp-content/uploads/2025/04/denis-kiprushev_.jpg",   linkedin: "https://www.linkedin.com/in/denis-kiprushev" },
  { id: "d-leonid",  name: "Leonid Fedores",   role: "CIO",                            photo: "https://empatixtech.com/wp-content/uploads/2025/04/leonid-fedores.jpg",     linkedin: "https://www.linkedin.com/in/leonid-fedorets-6b778431" },
  { id: "d-dmitriy", name: "Dmitriy Hrytsyna", role: "Head of Sales",                  photo: "https://empatixtech.com/wp-content/uploads/2025/04/dmitriy-hrytsyna.jpg",  linkedin: "https://linkedin.com/in/dmitriyhrytsyna" },
  { id: "d-eugene",  name: "Eugene Marchenko", role: "Chief Marketing Officer",        photo: "https://empatixtech.com/wp-content/uploads/2025/04/eugene-marchenko.jpg",  linkedin: "https://www.linkedin.com/in/eumarchenko/" },
  { id: "d-olena",   name: "Olena Lypka",      role: "Delivery Manager",               photo: "https://empatixtech.com/wp-content/uploads/2025/04/viktoria-dziuba.jpg",   linkedin: "https://www.linkedin.com/in/olena-lypka/" },
  { id: "d-viktoria",name: "Viktoria Dziuba",  role: "Design Lead",                    photo: "https://empatixtech.com/wp-content/uploads/2025/04/olena-lypka.jpg",       linkedin: "https://www.linkedin.com/in/viktoria-dziuba-9571b9187" },
];

function AboutPage() {
  const intro = useCmsSection<{ para1: string; para2: string; para3: string; stats?: Stat[] }>("about_intro");
  const stats = intro.stats && intro.stats.length ? intro.stats : DEFAULT_STATS;

  const valuesHeader = useCmsSection<{ title: string }>("about_values_header");
  const teamHeader = useCmsSection<{ title: string; description: string }>("team_header");

  const valueRows = useCmsCollection<{ icon: string; title: string; description: string }>("about_values");
  const values = valueRows.length ? valueRows.map((r) => ({ id: r.id, ...r.data })) : DEFAULT_VALUES;

  const teamRows = useCmsCollection<{ name: string; role: string; photo: string; linkedin: string }>("team");
  const team = teamRows.length ? teamRows.map((r) => ({ id: r.id, ...r.data })) : DEFAULT_TEAM;

  return (
    <SiteLayout>
      <EditableHero sectionKey="about_hero" label="About — Hero" bgImage={bgAbout} />

      <CmsMark kind="section" target="about_intro" label="About — Intro" as="section" className="container-x grid gap-12 pb-20 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5 text-lg text-muted-foreground">
          <p>{intro.para1}</p>
          <p>{intro.para2}</p>
          <p>{intro.para3}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 self-start">
          {stats.map((s, i) => (
            <div key={`${s.label}-${i}`} className="rounded-2xl border border-white/5 bg-card p-6 transition duration-300 hover:-translate-y-0.5 hover:border-brand-sky/30">
              <div className="display text-4xl font-bold text-gradient">
                <CountUp value={s.value} />
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </CmsMark>

      <CmsMark kind="collection" target="about_values" label="Why teams choose Empatix" as="section" className="container-x pb-20">
        <h2 className="display text-3xl font-bold md:text-4xl">{valuesHeader.title}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {values.map((v) => {
            const Icon = pickIcon(v.icon);
            return (
              <article
                key={v.id}
                className="group rounded-3xl border border-white/5 bg-card p-8 transition duration-500 hover:-translate-y-1 hover:border-brand-sky/30 hover:shadow-[0_20px_60px_-20px_rgba(56,189,248,0.3)]"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-sky/10 ring-1 ring-brand-sky/20 transition duration-300 group-hover:bg-brand-sky/15 group-hover:ring-brand-sky/40">
                  <Icon className="h-6 w-6 text-brand-sky transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="display mt-5 text-xl font-bold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.description}</p>
              </article>
            );
          })}
        </div>
      </CmsMark>

      <CmsMark kind="collection" target="team" label="Team" as="section" className="container-x pb-20">
        <h2 className="display text-3xl font-bold md:text-4xl">{teamHeader.title}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {teamHeader.description}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((m) => (
            <a
              key={m.id}
              href={m.linkedin || "#"}
              target={m.linkedin ? "_blank" : undefined}
              rel="noopener noreferrer"
              aria-label={m.linkedin ? `${m.name} — open LinkedIn profile` : m.name}
              title={m.linkedin ? `Open ${m.name} on LinkedIn` : m.name}
              className="group relative block cursor-pointer overflow-hidden rounded-3xl border border-white/5 bg-card transition duration-400 hover:-translate-y-1 hover:border-[#0A66C2]/60 hover:shadow-[0_20px_60px_-20px_rgba(10,102,194,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A66C2]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-black">
                {m.photo ? (
                  <img
                    src={m.photo}
                    alt={m.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-105"
                  />
                ) : null}
                {m.linkedin ? (
                  <>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition duration-300 group-hover:opacity-100"
                    />
                    <span className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center opacity-0 transition duration-300 group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-[#0A66C2] shadow-md">
                        <Linkedin className="h-3.5 w-3.5" />
                        View on LinkedIn
                      </span>
                    </span>
                  </>
                ) : null}
              </div>
              <div className="p-5">
                <h3 className="display text-lg font-bold">{m.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{m.role}</p>
              </div>
            </a>
          ))}
        </div>
      </CmsMark>

      <EditableCta sectionKey="about_cta" label="About — Bottom CTA" bgImage={ctaPartnerBg} />
    </SiteLayout>
  );
}
