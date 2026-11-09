export function adminMeta(title: string, description: string) {
  return { meta: [
    { title: `${title} — Empatix Admin` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — Empatix Admin` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex, nofollow" },
  ] };
}