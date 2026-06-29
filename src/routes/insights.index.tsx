import { createFileRoute, Link } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SiteLayout } from "@/components/SiteLayout";
import { POSTS, INSIGHT_CATEGORIES, type InsightCategory, type Post } from "@/lib/insights-data";
import { PillBadge, FilterPill, Pagination, PaginationMeta } from "@/components/ds";
import { EditableHero, EditableCta } from "@/components/cms/EditablePageBlocks";
import { CmsMark } from "@/components/CmsMark";
import { useCmsCollection } from "@/lib/cms/useCmsContent";
import bgInsights from "@/assets/bg-insights.jpg";
import ctaInsightsBg from "@/assets/cta-insights-bg.jpg";

export const Route = createFileRoute("/insights/")({
  head: () => ({
    ...seoMeta({
      title: "Insights — Empatix",
      description: "Field notes on AI for business, automation ROI, product strategy and CTO-level decisions — from the Empatix team",
      path: "/insights",
      breadcrumbs: [{ name: 'Home', path: '/' }, { name: 'Insights', path: '/insights' }],
    }),
  }),
  component: InsightsPage,
});

const PAGE_SIZE = 5;
type Filter = "All" | InsightCategory;

function PostCard({ p }: { p: Post }) {
  const visible = p.categories.slice(0, 2);
  const extra = p.categories.length - visible.length;
  return (
    <Link
      to="/insights/$slug"
      params={{ slug: p.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-card transition hover:border-brand-sky/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-black">
        <img
          src={p.image}
          alt={p.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105 group-hover:blur-[2px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-black/0 opacity-0 transition duration-300 group-hover:bg-black/40 group-hover:opacity-100"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
          <span className="inline-flex translate-y-2 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black shadow-lg transition duration-300 group-hover:translate-y-0">
            Read article
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {visible.map((c) => (
              <PillBadge key={c} variant="outline">
                {c}
              </PillBadge>
            ))}
            {extra > 0 && <PillBadge variant="muted">+{extra}</PillBadge>}
          </div>
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {p.date}
          </span>
        </div>
        <h2 className="display text-lg font-bold leading-snug">{p.title}</h2>
      </div>
    </Link>
  );
}

function InsightsPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [page, setPage] = useState(1);
  const gridTopRef = useRef<HTMLDivElement>(null);

  const cms = useCmsCollection<{
    slug?: string;
    title?: string;
    excerpt?: string;
    image?: string;
    date?: string;
    categories?: string;
    category?: string;
    readMin?: number;
    author?: string;
  }>("insights_items");

  const allPosts: Post[] = useMemo(() => {
    if (!cms.length) return POSTS;
    const fallbackBySlug = new Map(POSTS.map((p) => [p.slug, p]));
    return cms.map((row, i) => {
      const d = row.data;
      const slug = d.slug || `post-${i + 1}`;
      const fb = fallbackBySlug.get(slug);
      const cats = (d.categories || "")
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean) as InsightCategory[];
      return {
        slug,
        title: d.title || fb?.title || "Untitled",
        excerpt: d.excerpt || fb?.excerpt || "",
        image: d.image || fb?.image || "",
        date: d.date || fb?.date || "",
        categories: cats.length ? cats : (fb?.categories ?? ["AI"]),
        category: d.category || fb?.category || "AI",
        readMin: d.readMin || fb?.readMin || 5,
        author: d.author || fb?.author || "Empatix",
        body: fb?.body ?? [],
      };
    });
  }, [cms]);

  const filtered = useMemo(
    () => (filter === "All" ? allPosts : allPosts.filter((p) => p.categories.includes(filter))),
    [filter, allPosts],
  );


  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  useEffect(() => { setPage(1); }, [filter]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const topRow = pageItems.slice(0, 3);
  const bottomRow = pageItems.slice(3, 5);

  const goToPage = (n: number) => {
    setPage(n);
    if (typeof window !== "undefined") {
      const y = (gridTopRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <SiteLayout>
      <EditableHero sectionKey="insights_hero" label="Insights — Hero" bgImage={bgInsights} />

      <section className="container-x pb-6" ref={gridTopRef}>
        <p className="eyebrow mb-3">Categories</p>
        <div className="flex flex-wrap gap-2.5" data-cms-ignore="true">
          {(["All", ...INSIGHT_CATEGORIES] as Filter[]).map((f) => (
            <FilterPill key={f} active={filter === f} onClick={() => setFilter(f)}>
              {f}
            </FilterPill>
          ))}
        </div>

      </section>

      <CmsMark kind="collection" target="insights_items" label="Insights — Articles" as="section" className="container-x pb-24 pt-6">
        <PaginationMeta
          className="mb-6"
          page={page}
          pageSize={PAGE_SIZE}
          total={filtered.length}
          totalPages={totalPages}
        />

        {pageItems.length === 0 ? (
          <div className="rounded-3xl border border-white/5 bg-card p-12 text-center text-muted-foreground">
            No articles in this category yet — check back soon
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${filter}-${page}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-5"
            >
              {topRow.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {topRow.map((p) => <PostCard key={p.slug} p={p} />)}
                </div>
              )}
              {bottomRow.length > 0 && (
                <div className="grid gap-5 md:grid-cols-2">
                  {bottomRow.map((p) => <PostCard key={p.slug} p={p} />)}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        <div data-cms-ignore="true">
          <Pagination
            className="mt-12"
            page={page}
            totalPages={totalPages}
            onChange={goToPage}
          />
        </div>

      </CmsMark>


      <EditableCta sectionKey="insights_cta" label="Insights — Bottom CTA" bgImage={ctaInsightsBg} />
    </SiteLayout>
  );
}