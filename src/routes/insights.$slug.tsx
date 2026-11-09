import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { ArrowLeft, Link2, Linkedin, Check } from "lucide-react";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { Reveal } from "@/components/motion/Reveal";
import { articleFromData, type ArticlePost } from "@/lib/insights-content";
import { publicInsights } from "@/lib/admin/insights.functions";
import { ArticleView } from "@/components/ArticleView";
import { IconButton, PillBadge } from "@/components/ds";

export const Route = createFileRoute("/insights/$slug")({
  head: ({ loaderData }) => {
    const p = (loaderData as { post: ArticlePost; related: ArticlePost[] } | undefined)?.post;
    if (!p) {
      return { ...seoMeta({ title: "Article not found — Empatix", description: "The article you're looking for doesn't exist or has been moved. Browse all Empatix insights on AI products, automations and engineering.", path: "/insights", noindex: true }) };
    }
    const isoDate = (() => {
      const d = new Date(p.date);
      return isNaN(d.getTime()) ? undefined : d.toISOString();
    })();
    const base = seoMeta({
      title: p.seoTitle || `${p.title} — Empatix`,
      description: p.metaDescription || p.excerpt,
      ...(p.image.startsWith("https://") ? { ogImage: p.image } : {}),
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
  loader: async ({ params }): Promise<{ post: ArticlePost; related: ArticlePost[] }> => {
    const rows = await publicInsights();
    const posts = rows.map(row => articleFromData(row.data));
    const post = posts.find(p => p.slug === params.slug);
    if (!post) throw notFound();
    return { post, related: posts.filter(p => p.slug !== post.slug).slice(0, 3) };
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
        <p className="mt-3 text-sm text-muted-foreground">{error instanceof Error ? error.message : "Something went wrong"}</p>
      </div>
    </SiteLayout>
  ),
  component: ArticlePage,
});

function ArticlePage() {
  const { post, related } = Route.useLoaderData() as { post: ArticlePost; related: ArticlePost[] };
  return <SiteLayout><ArticleView post={post} related={related} /></SiteLayout>;
}
