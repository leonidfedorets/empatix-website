import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { listInsights, deleteInsight } from "@/lib/admin/insights.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import { seoMeta } from "@/lib/seo";
export const Route = createFileRoute("/admin/insights")({ ssr: false,
  head: () => seoMeta({title: "Insights articles — Empatix Admin", description: "Create, edit and publish Empatix Insights articles.", path: "/admin/insights", noindex: true}),
  component: InsightsAdmin,
});
function InsightsAdmin() {
  const location = useLocation();
  if (location.pathname !== "/admin/insights") return <Outlet />;
  return <ArticleList />;
}
function ArticleList() {
  const list = useServerFn(listInsights); const remove = useServerFn(deleteInsight); const qc = useQueryClient();
  const [search, setSearch] = useState(""); const [status, setStatus] = useState("all");
  const [busy, setBusy] = useState<string | null>(null);
  const {data: items = [], isLoading, error} = useQuery({queryKey: ["admin", "insights"], queryFn: () => list()});
  const rows = items.filter(row => (status === "all" || row.status === status) && String((row.data as any).title || "").toLowerCase().includes(search.toLowerCase()));
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase text-muted-foreground">Empatix</p><h1 className="text-2xl font-semibold">Insights</h1></div><Button asChild><Link to="/admin/insights/$id" params={{id: "new"}}><Plus className="size-4" />New article</Link></Button></div>
    <div className="flex flex-wrap gap-3"><Input aria-label="Search articles" placeholder="Search articles…" value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" /><div className="flex gap-1">{["all", "draft", "published"].map(s => <Button key={s} variant={status === s ? "secondary" : "ghost"} onClick={() => setStatus(s)}>{s === "all" ? "All articles" : s === "draft" ? "Drafts" : "Published"}</Button>)}</div></div>
    {error && <p role="alert" className="text-destructive">{error.message}</p>}
    {isLoading ? <p>Loading articles…</p> : rows.length === 0 ? <div className="py-20 text-center text-muted-foreground"><FileText className="mx-auto mb-3 size-8" />No articles found</div> : <div className="divide-y divide-border border-y border-border">{rows.map(row => {const d = row.data as any; return <div key={row.id} className="flex flex-wrap items-center gap-4 py-4">
      {d.image ? <img src={d.image} alt={d.imageAlt || ""} className="h-16 w-24 rounded-md object-cover" /> : <div className="flex h-16 w-24 items-center justify-center rounded-md bg-muted"><FileText className="size-5" /></div>}
      <div className="min-w-0 flex-1"><Link to="/admin/insights/$id" params={{id: row.id}} className="font-semibold hover:text-primary">{d.title || "Untitled"}</Link><p className="mt-1 text-xs text-muted-foreground">{d.category} · {d.date || "No publication date"}</p></div>
      <span className="text-xs text-muted-foreground">{row.status === "published" ? "Published" : "Draft"}</span>
      <Button asChild variant="outline" size="icon" title="Edit article"><Link to="/admin/insights/$id" params={{id: row.id}} aria-label={`Edit ${d.title}`}><Pencil className="size-4" /></Link></Button>
      <Button variant="ghost" size="icon" title="Delete article" aria-label={`Delete ${d.title}`} disabled={busy === row.id} onClick={async () => {if (!confirm(`Delete “${d.title}”? This cannot be undone.`)) return; setBusy(row.id); try {await remove({data: {id: row.id}}); await qc.invalidateQueries({queryKey: ["admin", "insights"]}); toast.success("Article deleted");} catch(e) {toast.error(e instanceof Error ? e.message : "Could not delete");} finally {setBusy(null);}}}><Trash2 className="size-4" /></Button>
    </div>})}</div>}
  </div>;
}
