import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { getSection } from "@/lib/admin/schemas";
import { adminGetSection, adminUpsertSection } from "@/lib/admin/content.functions";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/admin/FieldRenderer";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/content/$section")({
  ssr: false,
  component: SectionEditor,
});

function SectionEditor() {
  const { section: key } = Route.useParams();
  const def = getSection(key);
  if (!def) throw notFound();

  const qc = useQueryClient();
  const getFn = useServerFn(adminGetSection);
  const saveFn = useServerFn(adminUpsertSection);
  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["admin", "section", key],
    queryFn: () => getFn({ data: { key } }),
  });

  const initial = useMemo(
    () => ({ ...def.defaults, ...((query.data as any)?.data ?? {}) }),
    [query.data, def.defaults],
  );

  const [values, setValues] = useState<Record<string, any>>(initial);
  useEffect(() => setValues(initial), [initial]);

  const save = useMutation({
    mutationFn: () => saveFn({ data: { key, data: values } }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "section", key] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (query.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Section</p>
          <h1 className="text-2xl font-semibold tracking-tight">{def.label}</h1>
          <p className="text-sm text-muted-foreground">{def.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/admin" })}>
            Cancel
          </Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="space-y-5 rounded-lg border border-border bg-card p-6">
        {def.fields.map((f) => (
          <FieldRenderer
            key={f.key}
            field={f}
            value={values[f.key]}
            onChange={(v) => setValues((prev) => ({ ...prev, [f.key]: v }))}
          />
        ))}
      </div>

      {(query.data as any)?.updated_at && (
        <p className="text-xs text-muted-foreground">
          Last saved {new Date((query.data as any).updated_at).toLocaleString()} · version{" "}
          {(query.data as any).version}
        </p>
      )}
    </div>
  );
}
