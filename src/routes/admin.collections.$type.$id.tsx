import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { getCollection } from "@/lib/admin/schemas";
import { adminGetItem, adminUpdateItem } from "@/lib/admin/content.functions";
import { Button } from "@/components/ui/button";
import { FieldRenderer } from "@/components/admin/FieldRenderer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/collections/$type/$id")({
  ssr: false,
  component: ItemEditor,
});

function ItemEditor() {
  const { type, id } = Route.useParams();
  const def = getCollection(type);
  if (!def) throw notFound();

  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetItem);
  const saveFn = useServerFn(adminUpdateItem);

  const query = useQuery({
    queryKey: ["admin", "item", id],
    queryFn: () => getFn({ data: { id } }),
  });

  const initialData = useMemo(
    () => ({ ...def.defaults, ...((query.data as any)?.data ?? {}) }),
    [query.data, def.defaults],
  );
  const initialOrder = (query.data as any)?.sort_order ?? 0;

  const [values, setValues] = useState<Record<string, any>>(initialData);
  const [sortOrder, setSortOrder] = useState<number>(initialOrder);

  useEffect(() => {
    setValues(initialData);
    setSortOrder(initialOrder);
  }, [initialData, initialOrder]);

  const save = useMutation({
    mutationFn: () => saveFn({ data: { id, data: values, sort_order: sortOrder } }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "item", id] });
      qc.invalidateQueries({ queryKey: ["admin", "collection", type] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (query.isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {def.label} — Item
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            {values[def.titleField] || "Untitled"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: `/admin/collections/${type}` })}>
            Back
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
        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort order</Label>
          <Input
            id="sort_order"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="max-w-[120px]"
          />
        </div>
      </div>
    </div>
  );
}
