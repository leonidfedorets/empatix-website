import { createFileRoute } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { LegalPage } from "@/components/LegalPage";
import content from "@/content/legal/terms.md?raw";
import bgImage from "@/assets/legal-terms-bg.jpg";

export const Route = createFileRoute("/terms")({
  head: () => ({
    ...seoMeta({
      title: "Terms of Use — Empatix",
      description: "Terms and conditions governing access to and use of the Empatix website and services",
      path: "/terms",
    }),
  }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Terms of Use" content={content} bgImage={bgImage} />
  ),
});
