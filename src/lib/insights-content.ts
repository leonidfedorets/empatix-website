import { POSTS, type Post, type InsightCategory } from "@/lib/insights-data";

export type ArticlePost = Post & { bodyHtml?: string; seoTitle?: string; metaDescription?: string; imageAlt?: string };
export function articleFromData(data: Record<string, any>): ArticlePost {
  const fallback = POSTS.find((p) => p.slug === data.slug);
  const categories = String(data.categories || data.category || "AI").split("\n").filter(Boolean) as InsightCategory[];
  return {
    slug: data.slug, title: data.title || fallback?.title || "Untitled", excerpt: data.excerpt ?? fallback?.excerpt ?? "",
    image: data.image || fallback?.image || "", imageAlt: data.imageAlt || data.title,
    date: data.date || fallback?.date || "", categories, category: data.category || categories[0] || "AI",
    readMin: data.readMin || 5, author: data.author || "Empatix",
    body: Array.isArray(data.body) ? data.body : fallback?.body || [], bodyHtml: data.bodyHtml,
    seoTitle: data.seoTitle, metaDescription: data.metaDescription,
  };
}