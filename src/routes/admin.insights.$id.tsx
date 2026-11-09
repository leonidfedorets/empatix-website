import { createFileRoute, Link, useNavigate, useBlocker } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { listInsights, saveInsight } from "@/lib/admin/insights.functions";
import { slugify } from "@/lib/admin/insights-validation";
import { articleFromData } from "@/lib/insights-content";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { MediaPickerButton } from "@/components/admin/MediaLibrary";
import { ArticleView } from "@/components/ArticleView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { INSIGHT_CATEGORIES } from "@/lib/insights-data";
import { ArrowLeft, Eye, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { seoMeta } from "@/lib/seo";
export const Route = createFileRoute("/admin/insights/$id")({ssr: false,
  head: () => seoMeta({title: "Article editor — Empatix Admin", description: "Edit article content, images and publication settings for Empatix Insights.", path: "/admin/insights", noindex: true}),
  component: ArticleEditor,
});
const initial = {title: "", slug: "", category: "AI", categories: "AI", image: "", imageAlt: "", bodyHtml: "", date: "", excerpt: "", seoTitle: "", metaDescription: "", author: "Empatix", readMin: 5};
function ArticleEditor() {
  const {id} = Route.useParams(); const navigate = useNavigate(); const qc = useQueryClient();
  const list = useServerFn(listInsights); const save = useServerFn(saveInsight);
  const {data: rows, isLoading, error} = useQuery({queryKey: ["admin", "insights"], queryFn: () => list()});
  const [article, setArticle] = useState(initial); const [version, setVersion] = useState<number | undefined>();
  const [status, setStatus] = useState("draft"); const [loaded, setLoaded] = useState(""); const [dirty, setDirty] = useState(false);
  const [preview, setPreview] = useState(false); const [busy, setBusy] = useState(false); const [slugEdited, setSlugEdited] = useState(false);
  useEffect(() => {
    if (loaded === id || !rows) return;
    if (id === "new") {setArticle(initial); setVersion(undefined); setStatus("draft"); setLoaded(id); setDirty(false); setSlugEdited(false); return;}
    const row = rows.find(r => r.id === id); if (!row) return;
    const d = row.data as any; const post = articleFromData(d);
    const body = post.body.map(p => `<p>${p.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>`).join("");
    const date = d.date && !Number.isNaN(Date.parse(d.date)) ? new Date(d.date).toISOString().slice(0,10) : "";
    setArticle({...initial, ...d, bodyHtml: d.bodyHtml ?? body, date}); setVersion(row.version); setStatus(row.status); setLoaded(id); setDirty(false); setSlugEdited(true);
  }, [rows, id, loaded]);
  const allowSaveNavigation = useRef(false);
  const editRevision = useRef(0);
  useBlocker({
    shouldBlockFn: () => {
      if (allowSaveNavigation.current) return false;
      if (busy) { toast.info("Please wait until saving finishes before leaving."); return true; }
      return dirty && !window.confirm("Leave without saving changes?");
    },
    enableBeforeUnload: dirty || busy,
    disabled: !dirty && !busy,
  });
  const change = (key: keyof typeof initial, value: string | number) => {editRevision.current++; setArticle(a => ({...a,[key]:value})); setDirty(true);};
  const persist = async (nextStatus: "draft" | "published") => {
    setBusy(true);
    if (id === "new") setSlugEdited(true);
    const savedRevision = editRevision.current;
    try {
      const row = await save({data: { ...(id !== "new" ? {id, version} : {}), status: nextStatus, article}});
      setVersion(row.version); setStatus(row.status); setDirty(editRevision.current !== savedRevision); setSlugEdited(true);
      await qc.invalidateQueries({queryKey: ["admin", "insights"]}); await qc.invalidateQueries({queryKey: ["cms", "collection", "insights_items"]});
      toast.success(nextStatus === "published" ? "Article published" : "Draft saved");
      if (id === "new") {setLoaded(row.id); allowSaveNavigation.current = true; try {await navigate({to: "/admin/insights/$id", params: {id: row.id}, replace: true});} finally {allowSaveNavigation.current = false;}}
    } catch(e) {toast.error(e instanceof Error ? e.message : "Could not save article");} finally {setBusy(false);}
  };
  if (isLoading || (id !== "new" && loaded !== id && rows?.some(r => r.id === id))) return <p>Loading article…</p>;
  if (error) return <p role="alert">{error.message}</p>;
  if (id !== "new" && rows && !rows.some(r => r.id === id)) return <p>Article not found</p>;
  const categories = [...new Set([...INSIGHT_CATEGORIES, ...(rows || []).map(r => String((r.data as any).category))])];
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Link to="/admin/insights" className="inline-flex items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4" />All articles</Link><span className="text-xs text-muted-foreground">{busy ? "Saving… Please wait before leaving." : dirty ? "Unsaved changes" : status === "published" ? "Published" : "Draft"}</span></div>
    <div className="flex flex-wrap items-center justify-between gap-4"><h1 className="text-2xl font-semibold">{id === "new" ? "New article" : "Edit article"}</h1><div className="flex flex-wrap gap-2"><Button variant="outline" onClick={() => setPreview(true)}><Eye className="size-4" />Preview</Button><Button variant="outline" disabled={busy} onClick={() => persist("draft")}><Save className="size-4" />{status === "published" ? "Unpublish & save draft" : "Save draft"}</Button><Button disabled={busy} onClick={() => persist("published")}><Send className="size-4" />{busy ? "Saving…" : "Publish"}</Button></div></div>
    <fieldset disabled={busy} className="grid min-w-0 gap-8 xl:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6">
        <div className="space-y-2"><Label htmlFor="title">Title</Label><Input id="title" maxLength={200} value={article.title} placeholder="Article title" onChange={e => {const title = e.target.value; editRevision.current++; setArticle(a => ({...a,title,...(!slugEdited ? {slug: slugify(title)} : {})})); setDirty(true);}} /></div>
        <div className="space-y-2"><Label htmlFor="slug">URL (slug)</Label><Input id="slug" value={article.slug} onChange={e => {setSlugEdited(true); change("slug",e.target.value);}} /><p className="break-all text-xs text-muted-foreground">/insights/{article.slug || "article-url"}</p></div>
        <div className="space-y-2"><Label>Cover image</Label><MediaPickerButton articleMode value={article.image} onChange={url => change("image",url)} /></div>
        <div className="space-y-2"><Label htmlFor="alt">Cover image description</Label><Input id="alt" maxLength={300} value={article.imageAlt} onChange={e => change("imageAlt",e.target.value)} /></div>
        <div className="space-y-2"><Label>Article text</Label><RichTextEditor articleMode value={article.bodyHtml} onChange={html => change("bodyHtml",html)} placeholder="Write your article…" /></div>
        <div className="space-y-2"><Label htmlFor="excerpt">Excerpt</Label><Textarea id="excerpt" value={article.excerpt} maxLength={1000} onChange={e => change("excerpt",e.target.value)} /></div>
      </div>
      <aside className="space-y-6 border-t border-border pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
        <div className="space-y-2"><Label htmlFor="category">Category</Label><Input id="category" list="categories" value={article.category} onChange={e => {change("category",e.target.value); change("categories",e.target.value);}} /><datalist id="categories">{categories.map(c => <option key={c} value={c} />)}</datalist></div>
        <div className="space-y-2"><Label htmlFor="tags">Categories (one per line)</Label><Textarea id="tags" value={article.categories} onChange={e => change("categories",e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="date">Publication date</Label><Input id="date" type="date" value={article.date} onChange={e => change("date",e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="seo">SEO title</Label><Input id="seo" maxLength={200} value={article.seoTitle} onChange={e => change("seoTitle",e.target.value)} /></div>
        <div className="space-y-2"><Label htmlFor="description">Meta description</Label><Textarea id="description" maxLength={500} value={article.metaDescription} onChange={e => change("metaDescription",e.target.value)} /></div>
        {status === "published" && <Button asChild variant="outline"><Link to="/insights/$slug" params={{slug: article.slug}} target="_blank">View published article</Link></Button>}
      </aside>
    </fieldset>
    <Dialog open={preview} onOpenChange={setPreview}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-6xl"><DialogHeader><DialogTitle>Article preview</DialogTitle></DialogHeader><ArticleView post={articleFromData(article)} related={(rows || []).filter(r => r.id !== id && r.status === "published").slice(0,3).map(r => articleFromData(r.data as any))} /></DialogContent></Dialog>
  </div>;
}
