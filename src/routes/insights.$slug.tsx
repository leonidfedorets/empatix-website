import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { ArrowLeft, Link2, Linkedin, Check } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { POSTS, getPost, type Post } from "@/lib/insights-data";
import { IconButton, PillBadge } from "@/components/ds";

export const Route = createFileRoute("/insights/$slug")({
  head: ({ loaderData }) => {
    const p = loaderData as Post | undefined;
    if (!p) {
      return { ...seoMeta({ title: "Article not found — Empatix", description: "The article you're looking for doesn't exist or has been moved. Browse all Empatix insights on AI products, automations and engineering.", path: "/insights", noindex: true }) };
    }
    const isoDate = (() => {
      const d = new Date(p.date);
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    })();
    const base = seoMeta({
      title: `${p.title} — Empatix`,
      description: p.excerpt,
      path: `/insights/${p.slug}`,
      type: "article",
      publishedTime: isoDate,
      modifiedTime: isoDate,
      author: p.author,
      section: p.category,
      tags: p.categories,
    });
    return {
      ...base,
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p.title,
            description: p.excerpt,
            image: [p.image],
            datePublished: isoDate,
            dateModified: isoDate,
            author: { "@type": "Organization", name: p.author },
            publisher: {
              "@type": "Organization",
              name: "Empatix",
              logo: { "@type": "ImageObject", url: "/favicon-512.png" },
            },
            mainEntityOfPage: { "@type": "WebPage", "@id": `/insights/${p.slug}` },
            articleSection: p.category,
            keywords: p.categories.join(", "),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Insights", item: "/insights" },
              { "@type": "ListItem", position: 3, name: p.title, item: `/insights/${p.slug}` },
            ],
          }),
        },
      ],
    };
  },
  loader: ({ params }) => {
    const post = getPost(params.slug);
    if (!post) throw notFound();
    return post;
  },
  notFoundComponent: () => (
    <SiteLayout>
      <div className="container-x py-32 text-center">
        <p className="eyebrow mb-4">404</p>
        <h1 className="display text-3xl font-bold text-white md:text-4xl">Article not found</h1>
        <Link to="/insights" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-brand-sky hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to all insights
        </Link>
      </div>
    </SiteLayout>
  ),
  errorComponent: ({ error }) => (
    <SiteLayout>
      <div className="container-x py-32 text-center">
        <h1 className="display text-3xl font-bold text-white">Something went wrong</h1>
        <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      </div>
    </SiteLayout>
  ),
  component: ArticlePage,
});

function CategoryBadges({ cats, max = 4 }: { cats: string[]; max?: number }) {
  const visible = cats.slice(0, max);
  const extra = cats.length - visible.length;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((c) => (
        <PillBadge key={c} variant="brand">
          {c}
        </PillBadge>
      ))}
      {extra > 0 && <PillBadge variant="muted">+{extra}</PillBadge>}
    </div>
  );
}

function ArticlePage() {
  const post = Route.useLoaderData();
  const related = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <SiteLayout>
      <article className="container-x pt-10 pb-20 md:pt-14">
        {/* Top row */}
        <div className="flex items-center justify-between gap-4">
          <Link
            to="/insights"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-foreground transition hover:text-brand-sky"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            All Articles
          </Link>
          <CopyLinkButton />
        </div>

        <Reveal as="div" className="mt-8">
          <h1 className="display max-w-4xl text-4xl font-bold leading-[1.1] text-white md:text-5xl lg:text-6xl">
            {post.title}
          </h1>
          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <CategoryBadges cats={post.categories} />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {post.date}
            </span>
          </div>
        </Reveal>

        {/* Cover */}
        <Reveal as="div" className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-black">
          <img
            src={post.image}
            alt={post.title}
            className="aspect-[21/9] w-full object-cover"
          />
        </Reveal>

        {/* Body + sidebar */}
        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
          <Reveal as="div" className="max-w-2xl">
            {post.body.map((p: string, i: number) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-base leading-relaxed text-foreground md:text-lg"
                    : "mt-5 text-base leading-relaxed text-muted-foreground"
                }
              >
                {p}
              </p>
            ))}

            <div className="mt-12 flex items-center gap-3">
              <IconButton
                as="a"
                href="https://www.linkedin.com/company/empatixdev/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${post.author} on LinkedIn`}
              >
                <Linkedin className="h-4 w-4" />
              </IconButton>
              <span className="text-sm text-muted-foreground">
                Author:{" "}
                <a
                  href="https://www.linkedin.com/company/empatixdev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground transition hover:text-foreground/80"
                >
                  {post.author}
                </a>
              </span>
            </div>
          </Reveal>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-white/10 bg-card p-6">
              <p className="eyebrow mb-5">Similar articles</p>
              <ul className="divide-y divide-white/5">
                {related.map((r) => (
                  <li key={r.slug} className="py-4 first:pt-0 last:pb-0">
                    <Link
                      to="/insights/$slug"
                      params={{ slug: r.slug }}
                      className="group block"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <CategoryBadges cats={r.categories} max={2} />
                        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          {r.date}
                        </span>
                      </div>
                      <h3 className="mt-3 text-base font-semibold leading-snug text-foreground transition group-hover:text-brand-sky">
                        {r.title}
                      </h3>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </article>
    </SiteLayout>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    if (typeof window === "undefined") return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };
  return (
    <IconButton type="button" onClick={onCopy} aria-label="Copy link">
      {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
    </IconButton>
  );
}
