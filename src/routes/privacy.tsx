import { createFileRoute } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";
import { LegalPage } from "@/components/LegalPage";
import content from "@/content/legal/privacy.md?raw";
import bgImage from "@/assets/legal-privacy-bg.jpg";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    ...seoMeta({
      title: "Privacy Policy — Empatix",
      description: "How Empatix collects, uses, shares and protects personal information across its websites and marketing initiatives",
      path: "/privacy",
    }),
  }),
  component: () => (
    <LegalPage eyebrow="Legal" title="Privacy Policy" content={content} bgImage={bgImage} />
  ),
});
