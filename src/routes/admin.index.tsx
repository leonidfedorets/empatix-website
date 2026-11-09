import { adminMeta } from "@/lib/admin/admin-meta";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => adminMeta("Admin home", "Access Empatix Insights administration."),
  beforeLoad: () => {
    throw redirect({ to: "/admin/insights" });
  },
});
