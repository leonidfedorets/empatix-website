import { createFileRoute } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { LegalPage } from "@/components/LegalPage";
import content from "@/content/legal/cookies.md?raw";
import bgImage from "@/assets/legal-cookies-bg.jpg";

export const Route = createFileRoute("/cookies")({
  head: () => ({
    ...seoMeta({
      title: "Cookie Policy — Empatix",
      description: "How Empatix uses cookies and similar technologies on its websites and branded third-party pages",
      path: "/cookies",
    }),
  }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Cookie Policy" content={content} bgImage={bgImage} />
  ),
});
