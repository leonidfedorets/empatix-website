import { createFileRoute } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { LegalPage } from "@/components/LegalPage";
import content from "@/content/legal/gdpr.md?raw";
import bgImage from "@/assets/legal-gdpr-bg.jpg";

export const Route = createFileRoute("/gdpr")({
  head: () => ({
    ...seoMeta({
      title: "GDPR — Empatix",
      description: "How Empatix approaches data privacy and complies with the EU General Data Protection Regulation (GDPR)",
      path: "/gdpr",
    }),
  }),
  component: () => (
    <LegalPage eyebrow="Legal" title="GDPR" content={content} bgImage={bgImage} />
  ),
});
