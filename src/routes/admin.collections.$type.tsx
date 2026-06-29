import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCollection } from "@/lib/admin/schemas";
import {
  adminListItems,
  adminCreateItem,
  adminDeleteItem,
  adminUpdateItem,
} from "@/lib/admin/content.functions";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/collections/$type")({
  ssr: false,
  component: CollectionList,
});

function CollectionList() {
  const { type } = Route.useParams();
  const def = getCollection(type);
  if (!def) throw notFound();

  const navigate = useNavigate();
  const qc = useQueryClient();
  const listFn = useServerFn(adminListItems);
  const createFn = useServerFn(adminCreateItem);
  const updateFn = useServerFn(adminUpdateItem);
  const deleteFn = useServerFn(adminDeleteItem);

  const list = useQuery({
    queryKey: ["admin", "collection", type],
    queryFn: () => listFn({ data: { collection: type } }),
  });

  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          collection: type,
          data: def.defaults,
          sort_order: (list.data?.length ?? 0) * 10,
          status: "published",
        },
      }),
    onSuccess: (row) => {
      qc.invalidateQueries({ queryKey: ["admin", "collection", type] });
      navigate({ to: `/admin/collections/${type}/${(row as any).id}` });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "collection", type] });
      toast.success("Deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "draft" | "published" }) =>
      updateFn({ data: { id, status } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "collection", type] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Collection</p>
          <h1 className="text-2xl font-semibold tracking-tight">{def.label}</h1>
          <p className="text-sm text-muted-foreground">{def.description}</p>
        </div>
        <Button onClick={() => create.mutate()} disabled={create.isPending}>
          <Plus className="mr-1 size-4" />
          New
        </Button>
      </div>

      {list.isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (list.data ?? []).length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">No items yet</p>
          <Button className="mt-3" onClick={() => create.mutate()}>
            <Plus className="mr-1 size-4" />
            Create first item
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2 w-32">Status</th>
                <th className="px-4 py-2 w-40">Updated</th>
                <th className="px-4 py-2 w-32"></th>
              </tr>
            </thead>
            <tbody>
              {(list.data as any[]).map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-4 py-2">
                    <Link
                      to={`/admin/collections/${type}/${row.id}`}
                      className="font-medium hover:underline"
                    >
                      {row.data?.[def.titleField] || <span className="italic text-muted-foreground">untitled</span>}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() =>
                        toggleStatus.mutate({
                          id: row.id,
                          status: row.status === "published" ? "draft" : "published",
                        })
                      }
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                        row.status === "published"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {row.status === "published" ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
                      {row.status}
                    </button>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {new Date(row.updated_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm("Delete this item?")) remove.mutate(row.id);
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
