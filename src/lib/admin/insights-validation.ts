import { z } from "zod";
import sanitizeHtml from "sanitize-html";

export const safeArticleHtml = (html: string) => sanitizeHtml(html, {
  allowedTags: ["p", "br", "h2", "h3", "strong", "b", "em", "i", "ul", "ol", "li", "a", "img"],
  allowedAttributes: { a: ["href", "rel", "target"], img: ["src", "alt", "title"] },
  allowedSchemes: ["https", "http", "mailto"], allowProtocolRelative: false,
  transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }) },
});

export const articleSchema = z.object({
  title: z.string().trim().min(1).max(200), slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(180),
  category: z.string().trim().min(1).max(100), categories: z.string().max(500),
  image: z.string().max(2000).refine(v => !v || v.startsWith("/api/public/media/") || /^https:\/\//.test(v), "Use an uploaded image or HTTPS URL"),
  imageAlt: z.string().max(300).default(""), bodyHtml: z.string().max(200000).transform(safeArticleHtml),
  date: z.string().max(40).refine(v => !v || !Number.isNaN(Date.parse(v)), "Invalid publication date"),
  excerpt: z.string().max(1000).default(""), seoTitle: z.string().max(200).default(""), metaDescription: z.string().max(500).default(""),
  author: z.string().max(100).default("Empatix"), readMin: z.number().int().min(1).max(120).default(5),
});

export function validatePublication(data: z.infer<typeof articleSchema>) {
  if (!data.image || !data.date || !sanitizeHtml(data.bodyHtml, { allowedTags: [], allowedAttributes: {} }).trim()) {
    throw new Error("Add a cover image, publication date and article text before publishing");
  }
}

export function slugify(title: string) {
  return title.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}