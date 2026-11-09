import { createFileRoute, Outlet } from "@tanstack/react-router";
import { seoMeta } from "@/lib/seo";

export const Route = createFileRoute("/insights")({
  head: () => seoMeta({ title: "Insights library — Empatix", description: "Empatix articles on AI, product engineering and business automation.", path: "/insights" }),
  component: () => <Outlet />,
});
