import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Link, useLocation } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/SiteLayout";

const LEGAL_NAV = [
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Use" },
  { to: "/cookies", label: "Cookie Policy" },
  { to: "/gdpr", label: "GDPR" },
] as const;

function LegalNav() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Legal pages" className="container-x -mt-6 pb-4">
      <ul className="flex flex-wrap gap-2">
        {LEGAL_NAV.map((item) => {
          const active = pathname === item.to;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={
                  "inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition " +
                  (active
                    ? "border-brand-sky/40 bg-brand-sky/10 text-foreground"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:bg-white/5 hover:text-foreground")
                }
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function LegalPage({
  eyebrow,
  title,
  updated,
  content,
  bgImage,
}: {
  eyebrow: string;
  title: string;
  updated?: string;
  content: string;
  bgImage?: string;
}) {
  return (
    <SiteLayout>
      <PageHero
        eyebrow={eyebrow}
        title={<span>{title}</span>}
        description={updated ? `Last updated: ${updated}` : undefined}
        bgImage={bgImage}
        bgOpacityClass="opacity-30"
      />

      <LegalNav />


      <section className="container-x pb-24">
        <article className="max-w-none text-[15px] leading-relaxed text-muted-foreground">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="display mb-6 mt-12 text-3xl font-bold text-foreground first:mt-0">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="display mb-3 mt-10 text-2xl font-bold text-foreground first:mt-0">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="display mb-2 mt-8 text-xl font-bold text-foreground">{children}</h3>
              ),
              h4: ({ children }) => (
                <h4 className="display mb-2 mt-6 text-base font-bold text-foreground">{children}</h4>
              ),
              p: ({ children }) => <p className="my-4">{children}</p>,
              ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6">{children}</ul>,
              ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6">{children}</ol>,
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              a: ({ href, children }) => (
                <a
                  href={href}
                  target={href?.startsWith("http") ? "_blank" : undefined}
                  rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-brand-sky underline-offset-4 hover:underline"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              hr: () => <hr className="my-10 border-white/10" />,
              blockquote: ({ children }) => (
                <blockquote className="my-6 border-l-2 border-brand-sky/60 pl-4 italic">{children}</blockquote>
              ),
              code: ({ children }) => (
                <code className="rounded bg-white/5 px-1.5 py-0.5 text-[13px] text-foreground">{children}</code>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </section>
    </SiteLayout>
  );
}

// Helper so route files can declare the page in one line
export type LegalContent = { eyebrow: string; title: string; updated?: string; content: string };

export function legalRoute(data: LegalContent): ReactNode {
  return <LegalPage {...data} />;
}
