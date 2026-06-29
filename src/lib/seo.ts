const SITE_ORIGIN = "https://empatix-website.vercel.app";

export const OG_DEFAULT_URL = `${SITE_ORIGIN}/og-default.jpg`;

function absoluteUrl(path: string) {
  if (!path) return SITE_ORIGIN + "/";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return SITE_ORIGIN + (path.startsWith("/") ? path : `/${path}`);
}

/**
 * Build the standard SEO meta + links for a route.
 * Title and description still come from each route's head() for clarity.
 */
export function seoMeta(opts: {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  type?: "website" | "article";
  noindex?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  breadcrumbs?: Array<{ name: string; path: string }>;
}) {
  const image = opts.ogImage ?? OG_DEFAULT_URL;
  const type = opts.type ?? "website";
  const meta: Array<Record<string, string>> = [
    { title: opts.title },
    { name: "description", content: opts.description },
    { property: "og:title", content: opts.title },
    { property: "og:description", content: opts.description },
    { property: "og:type", content: type },
    { property: "og:url", content: opts.path },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1216" },
    { property: "og:image:height", content: "640" },
    { property: "og:image:alt", content: opts.title },
    { property: "og:site_name", content: "Empatix" },
    { property: "og:locale", content: "en_US" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: opts.title },
    { name: "twitter:description", content: opts.description },
    { name: "twitter:image", content: image },
    { name: "twitter:image:alt", content: opts.title },
  ];
  if (type === "article") {
    if (opts.publishedTime) meta.push({ property: "article:published_time", content: opts.publishedTime });
    if (opts.modifiedTime) meta.push({ property: "article:modified_time", content: opts.modifiedTime });
    if (opts.author) meta.push({ property: "article:author", content: opts.author });
    if (opts.section) meta.push({ property: "article:section", content: opts.section });
    (opts.tags ?? []).forEach((t) => meta.push({ property: "article:tag", content: t }));
  }
  if (opts.noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  const links = opts.noindex ? [] : [{ rel: "canonical", href: absoluteUrl(opts.path) }];
  const scripts: Array<{ type: string; children: string }> = [];
  if (opts.breadcrumbs && opts.breadcrumbs.length > 0) {
    scripts.push({
      type: "application/ld+json",
      children: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: opts.breadcrumbs.map((b, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: b.name,
          item: absoluteUrl(b.path),
        })),
      }),
    });
  }
  return { meta, links, scripts };
}
