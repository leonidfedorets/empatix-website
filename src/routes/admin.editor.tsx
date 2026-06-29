import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Monitor,
  Smartphone,
  Tablet,
  RefreshCw,
  ExternalLink,
  X,
  Save,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  MousePointerClick,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FieldRenderer } from "@/components/admin/FieldRenderer";
import { getCollection, getSection } from "@/lib/admin/schemas";
import {
  adminCreateItem,
  adminDeleteItem,
  adminGetSection,
  adminListItems,
  adminUpdateItem,
  adminUpsertSection,
} from "@/lib/admin/content.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/editor")({
  ssr: false,
  component: VisualEditor,
});

type Selection =
  | { kind: "section"; target: string; label: string }
  | { kind: "collection"; target: string; label: string }
  | null;

type Device = "desktop" | "tablet" | "mobile";

type CollectionEditorRow = {
  id: string;
  data: Record<string, any>;
  sort_order?: number | null;
  status?: "draft" | "published" | string | null;
};

function rowOrder(row: CollectionEditorRow, fallback: number) {
  return typeof row.sort_order === "number" ? row.sort_order : fallback * 10;
}

function mergeCollectionRows(base: CollectionEditorRow[], overlay: CollectionEditorRow[]) {
  const byId = new Map<string, CollectionEditorRow>();
  [...base, ...overlay].forEach((row, index) => {
    if (!row?.id) return;
    const prev = byId.get(row.id);
    byId.set(row.id, {
      ...prev,
      ...row,
      data: { ...(prev?.data ?? {}), ...(row.data ?? {}) },
      sort_order: rowOrder(row, index),
    });
  });
  return Array.from(byId.values()).sort((a, b) => rowOrder(a, 0) - rowOrder(b, 0));
}

function toPreviewRows(rows: CollectionEditorRow[]) {
  return rows
    .filter((row) => (row.status ?? "published") === "published")
    .map((row, index) => ({
      id: row.id,
      data: row.data ?? {},
      sort_order: rowOrder(row, index),
    }));
}

function getNextCollectionDefaults(defaults: Record<string, unknown>, rows: CollectionEditorRow[]) {
  const next = { ...defaults };
  if (typeof next.number === "string") {
    const maxNumber = rows.reduce((max, row) => {
      const value = Number.parseInt(String(row.data?.number ?? ""), 10);
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0);
    next.number = String(maxNumber + 1).padStart(2, "0");
  }
  return next;
}

const DEVICE_WIDTH: Record<Device, string> = {
  desktop: "100%",
  tablet: "820px",
  mobile: "390px",
};

function VisualEditor() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [path, setPath] = useState<string>("/");
  const [device, setDevice] = useState<Device>("desktop");
  const [selection, setSelection] = useState<Selection>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Listen for clicks from the iframe.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return;
      const msg = e.data;
      if (!msg || msg.source !== "empatix-cms") return;
      if (msg.type === "select") {
        setSelection({ kind: msg.kind, target: msg.target, label: msg.label });
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const reloadIframe = () => setRefreshKey((k) => k + 1);
  // Realtime keeps text edits in sync without a reload, but status changes
  // (publish/hide) and reorders can be missed by anon RLS filters, so we
  // force a reload after admin mutations to guarantee the preview matches.
  const onSaved = reloadIframe;

  // Push a preview message into the iframe. Used for live previews of
  // in-progress edits before the user clicks Save.
  const sendPreview = (msg: Record<string, unknown>) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage({ source: "empatix-cms-preview", ...msg }, window.location.origin);
  };

  return (
    <div className="-mx-4 -mt-4 flex h-[calc(100vh-3.5rem)] min-w-0 flex-col overflow-hidden md:-mx-8 md:-mt-8">
      {/* Top toolbar */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-b border-border bg-card/40 px-4 py-2 sm:flex sm:gap-3">
        <div className="flex min-w-0 items-center gap-1 text-sm">
          <span className="shrink-0 text-muted-foreground">Page:</span>
          <select
            className="min-w-0 rounded-md border border-border bg-background px-2 py-1 text-sm"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          >
            <option value="/">Home</option>
            <option value="/services">Services</option>
            <option value="/ai-solutions">AI Solutions</option>
            <option value="/cases">Products & Cases</option>
            <option value="/industries">Industries</option>
            <option value="/how-we-work">How We Work</option>
            <option value="/about">About</option>
            <option value="/insights">Insights</option>
            <option value="/contact">Contact</option>
          </select>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-border p-0.5 sm:ml-3">
          {([
            ["desktop", Monitor],
            ["tablet", Tablet],
            ["mobile", Smartphone],
          ] as const).map(([d, Icon]) => (
            <button
              key={d}
              onClick={() => setDevice(d)}
              className={`flex h-7 w-8 items-center justify-center rounded ${
                device === d ? "bg-accent text-accent-foreground" : "text-muted-foreground"
              }`}
              title={d}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>

        <div className="col-span-2 flex min-w-0 items-center justify-end gap-2 sm:col-span-1 sm:ml-auto">
          <Button size="sm" variant="ghost" onClick={reloadIframe} title="Reload preview">
            <RefreshCw className="size-4" />
          </Button>
          <a
            href={path}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 min-w-0 items-center gap-1 rounded-md border border-border px-3 text-sm hover:bg-accent"
          >
            <ExternalLink className="size-4 shrink-0" /> <span className="truncate">Open</span>
          </a>
        </div>
      </div>

      {/* Body: iframe + side panel */}
      <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
        <div className="flex min-w-0 flex-1 items-stretch justify-center overflow-auto bg-muted/30 p-4">
          <div
            className="h-full overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all"
            style={{ width: DEVICE_WIDTH[device], maxWidth: "100%" }}
          >
            <iframe
              ref={iframeRef}
              key={`${path}?${refreshKey}`}
              src={`${path}?cms=1`}
              title="Live preview"
              className="h-full w-full"
            />
          </div>
        </div>

        {/* Side panel */}
        <aside className="flex w-[min(420px,42vw)] min-w-80 shrink-0 flex-col overflow-hidden border-l border-border bg-card">
          {!selection ? (
            <EmptyPanel />
          ) : selection.kind === "section" ? (
            <SectionPanel
              key={`section-${selection.target}`}
              target={selection.target}
              label={selection.label}
              onClose={() => {
                sendPreview({ type: "clear-section", key: selection.target });
                setSelection(null);
              }}
              onSaved={onSaved}
              sendPreview={sendPreview}
            />
          ) : (
            <CollectionPanel
              key={`collection-${selection.target}`}
              target={selection.target}
              label={selection.label}
              onClose={() => {
                sendPreview({ type: "clear-collection", key: selection.target });
                setSelection(null);
              }}
              onSaved={onSaved}
              sendPreview={sendPreview}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function EmptyPanel() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <MousePointerClick className="mb-3 size-8 text-muted-foreground" />
      <p className="text-sm font-medium">Click any block on the page</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Hover shows what's editable. Click opens its editor here.
      </p>
      <Link to="/admin" className="mt-4 text-xs text-brand-sky hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}

function PanelHeader({ label, kind, onClose }: { label: string; kind: string; onClose: () => void }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-b border-border p-4">
      <div className="min-w-0">
        <p className="break-words text-xs uppercase tracking-wider text-muted-foreground">{kind}</p>
        <h2 className="break-words text-base font-semibold leading-snug">{label}</h2>
      </div>
      <Button size="icon" variant="ghost" onClick={onClose} className="-mr-2 -mt-1 shrink-0">
        <X className="size-4" />
      </Button>
    </div>
  );
}

function SectionPanel({
  target,
  label,
  onClose,
  onSaved,
  sendPreview,
}: {
  target: string;
  label: string;
  onClose: () => void;
  onSaved: () => void;
  sendPreview: (msg: Record<string, unknown>) => void;
}) {
  const def = getSection(target);
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetSection);
  const saveFn = useServerFn(adminUpsertSection);

  const query = useQuery({
    queryKey: ["admin", "section", target],
    queryFn: () => getFn({ data: { key: target } }),
    enabled: !!def,
  });

  const initial = useMemo(
    () => ({ ...(def?.defaults ?? {}), ...(((query.data as any)?.data ?? {}) as Record<string, any>) }),
    [query.data, def],
  );
  const [values, setValues] = useState<Record<string, any>>(initial);
  useEffect(() => setValues(initial), [initial]);

  // Live preview is pushed only on user edits (see onChange below), never
  // on initial mount — otherwise schema defaults would briefly overwrite
  // the real data in the iframe while the query is still loading.
  const updateField = (key: string, v: any) => {
    setValues((p) => {
      const next = { ...p, [key]: v };
      sendPreview({ type: "section", key: target, data: next });
      return next;
    });
  };

  const save = useMutation({
    mutationFn: () => saveFn({ data: { key: target, data: values } }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin", "section", target] });
      sendPreview({ type: "clear-section", key: target });
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });


  if (!def) {
    return (
      <>
        <PanelHeader label={label} kind="Section" onClose={onClose} />
        <div className="p-4 text-sm text-muted-foreground">
          No schema defined for <code>{target}</code>. Add it to{" "}
          <code>src/lib/admin/schemas.ts</code>.
        </div>
      </>
    );
  }

  return (
    <>
      <PanelHeader label={def.label} kind="Section" onClose={onClose} />
        <ScrollArea className="min-w-0 flex-1">
          <div className="min-w-0 space-y-5 p-4">
            <p className="break-words text-xs text-muted-foreground">{def.description}</p>
          {def.fields.map((f) => (
            <FieldRenderer
              key={f.key}
              field={f}
              value={values[f.key]}
              onChange={(v) => updateField(f.key, v)}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="grid grid-cols-2 gap-2 border-t border-border p-3 sm:flex sm:items-center sm:justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
          <Save className="mr-1 size-4" />
          {save.isPending ? "Saving…" : "Save"}
        </Button>
      </div>
    </>
  );
}

function CollectionPanel({
  target,
  label,
  onClose,
  onSaved,
  sendPreview,
}: {
  target: string;
  label: string;
  onClose: () => void;
  onSaved: () => void;
  sendPreview: (msg: Record<string, unknown>) => void;
}) {
  const def = getCollection(target);
  const qc = useQueryClient();
  const listFn = useServerFn(adminListItems);
  const createFn = useServerFn(adminCreateItem);
  const updateFn = useServerFn(adminUpdateItem);
  const deleteFn = useServerFn(adminDeleteItem);

  const list = useQuery({
    queryKey: ["admin", "collection", target],
    queryFn: () => listFn({ data: { collection: target } }),
    enabled: !!def,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [localRows, setLocalRows] = useState<CollectionEditorRow[]>([]);
  const rows = useMemo(
    () => mergeCollectionRows(((list.data as CollectionEditorRow[] | undefined) ?? []), localRows),
    [list.data, localRows],
  );
  const editing = rows.find((r) => r.id === editingId) ?? null;

  const initial = useMemo<Record<string, any>>(
    () => ({ ...(def?.defaults ?? {}), ...((editing?.data ?? {}) as Record<string, any>) }),
    [editing, def],
  );
  const [values, setValues] = useState<Record<string, any>>(initial);
  useEffect(() => setValues(initial), [initial]);

  // Keep collection preview overrides after returning to the list view, so
  // just-created rows do not disappear while the public preview cache catches up.

  const updateField = (key: string, v: any) => {
    setValues((p) => {
      const next = { ...p, [key]: v };
      if (editingId) {
        let nextRows = rows.map((r) =>
          r.id === editingId
            ? { ...r, data: next, sort_order: r.sort_order ?? 0 }
            : { ...r, data: r.data, sort_order: r.sort_order ?? 0 },
        );
        // If the editing row hasn't shown up in list.data yet (just-created),
        // make sure it's still in the preview so the new card stays visible.
        if (!nextRows.some((r) => r.id === editingId)) {
          nextRows = [...nextRows, { id: editingId, data: next, sort_order: nextRows.length * 10 }];
        }
        sendPreview({ type: "collection", key: target, rows: toPreviewRows(nextRows) });
      }
      return next;
    });
  };



  const create = useMutation({
    mutationFn: () =>
      createFn({
        data: {
          collection: target,
          data: getNextCollectionDefaults(def?.defaults ?? {}, rows),
          sort_order: rows.length ? Math.max(...rows.map((row, index) => rowOrder(row, index))) + 10 : 0,
          status: "published",
        },
      }),
    onSuccess: (row: any) => {
      qc.invalidateQueries({ queryKey: ["admin", "collection", target] });
      // Push a live preview override so the iframe shows the new row
      // immediately, without waiting for the realtime refetch.
      const createdRow: CollectionEditorRow = {
        id: row.id,
        data: { ...getNextCollectionDefaults(def?.defaults ?? {}, rows), ...((row.data ?? {}) as Record<string, any>) },
        sort_order: row.sort_order ?? (rows.length ? Math.max(...rows.map((r, index) => rowOrder(r, index))) + 10 : 0),
        status: row.status ?? "published",
      };
      const nextRows = mergeCollectionRows(rows, [createdRow]);
      setLocalRows((prev) => mergeCollectionRows(prev, [createdRow]));
      sendPreview({ type: "collection", key: target, rows: toPreviewRows(nextRows) });
      setEditingId(row.id);
    },
    onError: (e: Error) => toast.error(e.message),
  });


  const save = useMutation({
    mutationFn: () => updateFn({ data: { id: editingId!, data: values } }),
    onSuccess: (row: any) => {
      toast.success("Saved");
      // Push a fresh preview override that includes the saved row so the
      // iframe shows the new/updated card immediately, without waiting for
      // a realtime refetch. Falls back to merged values for the edited row.
      const savedId = editingId!;
      const currentRow = rows.find((r) => r.id === savedId);
      const savedRow: CollectionEditorRow = {
        ...(currentRow ?? {}),
        ...(row ?? {}),
        id: savedId,
        data: (row?.data as Record<string, any> | undefined) ?? values,
        sort_order: row?.sort_order ?? currentRow?.sort_order ?? rows.length * 10,
        status: row?.status ?? currentRow?.status ?? "published",
      };
      const nextRows = mergeCollectionRows(rows, [savedRow]);
      setLocalRows((prev) => mergeCollectionRows(prev, [savedRow]));
      sendPreview({ type: "collection", key: target, rows: toPreviewRows(nextRows) });
      qc.invalidateQueries({ queryKey: ["admin", "collection", target] });
      // Return to the list view after saving.
      setEditingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });


  const remove = useMutation({
    mutationFn: (id: string) => deleteFn({ data: { id } }),
    onSuccess: (_result, id) => {
      const nextRows = rows.filter((row) => row.id !== id);
      setLocalRows((prev) => prev.filter((row) => row.id !== id));
      sendPreview({ type: "collection", key: target, rows: toPreviewRows(nextRows) });
      qc.invalidateQueries({ queryKey: ["admin", "collection", target] });
      setEditingId(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "draft" | "published" }) =>
      updateFn({ data: { id, status } }),
    onSuccess: (row: any) => {
      const changedRow = row as CollectionEditorRow;
      const nextRows = mergeCollectionRows(rows, [changedRow]);
      setLocalRows((prev) => mergeCollectionRows(prev, [changedRow]));
      sendPreview({ type: "collection", key: target, rows: toPreviewRows(nextRows) });
      qc.invalidateQueries({ queryKey: ["admin", "collection", target] });
    },
  });

  const reorder = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      await Promise.all(
        orderedIds.map((id, idx) => updateFn({ data: { id, sort_order: idx * 10 } })),
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "collection", target] });
      // No iframe reload — the live preview override already reflects the new order.
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const ids = rows.map((r) => r.id as string);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) return;
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    setDragId(null);
    setOverId(null);
    // Optimistically update the cache so the list reorders instantly.
    qc.setQueryData(["admin", "collection", target], (prev: any[] | undefined) => {
      if (!prev) return prev;
      const map = new Map(prev.map((r) => [r.id, r]));
      return ids.map((id, idx) => ({ ...map.get(id), sort_order: idx * 10 }));
    });
    const map = new Map(rows.map((row) => [row.id, row]));
    const nextRows = ids.map((id, idx) => ({ ...map.get(id)!, sort_order: idx * 10 }));
    setLocalRows(nextRows);
    sendPreview({ type: "collection", key: target, rows: toPreviewRows(nextRows) });
    reorder.mutate(ids);
  }

  if (!def) {
    return (
      <>
        <PanelHeader label={label} kind="Collection" onClose={onClose} />
        <div className="p-4 text-sm text-muted-foreground">
          No schema defined for <code>{target}</code>.
        </div>
      </>
    );
  }

  // Item editor mode
  if (editing) {
    return (
      <>
        <PanelHeader
          label={(values[def.titleField] as string) || `Edit ${def.label.replace(/s$/, "")}`}
          kind={def.label}
          onClose={() => setEditingId(null)}
        />
        <ScrollArea className="min-w-0 flex-1">
          <div className="min-w-0 space-y-5 p-4">
            {def.fields.map((f) => {
              let suggestions: string[] | undefined;
              if (f.suggestionsFromSiblings) {
                const seen = new Set<string>();
                rows.forEach((r) => {
                  const val = (r.data as Record<string, any> | undefined)?.[f.key];
                  if (typeof val === "string" && val.trim() && r.id !== editing.id) {
                    seen.add(val.trim());
                  }
                });
                suggestions = Array.from(seen).sort();
              }
              return (
                <FieldRenderer
                  key={f.key}
                  field={f}
                  value={values[f.key]}
                  onChange={(v) => updateField(f.key, v)}
                  suggestions={suggestions}
                />
              );
            })}
          </div>
        </ScrollArea>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 border-t border-border p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm("Delete this item?")) remove.mutate(editing.id);
            }}
            className="min-w-0 justify-self-start text-destructive hover:text-destructive"
          >
            <Trash2 className="mr-1 size-4 shrink-0" />
            Delete
          </Button>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
              Back
            </Button>
            <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
              <Save className="mr-1 size-4" />
              {save.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </>
    );
  }

  // List mode
  return (
    <>
      <PanelHeader label={def.label} kind="Collection" onClose={onClose} />
      <ScrollArea className="min-w-0 flex-1">
        <div className="min-w-0 p-3">
          <p className="break-words px-1 pb-3 text-xs text-muted-foreground">{def.description}</p>
          {def.headerSection ? (
            <CollectionHeaderEditor
              target={def.headerSection}
              sendPreview={sendPreview}
              onSaved={onSaved}
            />
          ) : null}
          {list.isLoading ? (
            <p className="px-1 text-sm text-muted-foreground">Loading…</p>
          ) : rows.length ? (
            <ul className="min-w-0 space-y-1">
              {rows.map((row) => (
                <li
                  key={row.id}
                  draggable
                  onDragStart={(e) => {
                    setDragId(row.id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (overId !== row.id) setOverId(row.id);
                  }}
                  onDragLeave={() => {
                    if (overId === row.id) setOverId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    handleDrop(row.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setOverId(null);
                  }}
                  className={`group grid min-w-0 items-center gap-2 rounded-md border bg-background p-2 transition ${
                    def.imageField
                      ? "grid-cols-[auto_auto_minmax(0,1fr)_auto_auto]"
                      : "grid-cols-[auto_minmax(0,1fr)_auto_auto]"
                  } ${dragId === row.id ? "opacity-40" : ""} ${overId === row.id && dragId !== row.id ? "border-brand-sky" : "border-border"}`}
                >
                  <span
                    className="shrink-0 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
                    title="Drag to reorder"
                    aria-hidden
                  >
                    <GripVertical className="size-4" />
                  </span>
                  {def.imageField ? (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded border border-border bg-muted">
                      {row.data?.[def.imageField] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={row.data[def.imageField] as string}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                  ) : null}
                  <button
                    onClick={() => setEditingId(row.id)}
                     className="min-w-0 truncate text-left text-sm leading-snug hover:underline"
                  >
                    <span className="block truncate">
                      {(row.data?.[def.titleField] as string) || (
                        <span className="italic text-muted-foreground">untitled</span>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() =>
                      toggle.mutate({
                        id: row.id,
                        status: row.status === "published" ? "draft" : "published",
                      })
                    }
                    title={row.status === "published" ? "Published — click to hide" : "Hidden — click to publish"}
                    className="shrink-0 text-muted-foreground hover:text-foreground"
                  >
                    {row.status === "published" ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this item?")) remove.mutate(row.id);
                    }}
                    title="Delete"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No items yet
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex items-center justify-end gap-2 border-t border-border p-3">
        <Button size="sm" onClick={() => create.mutate()} disabled={create.isPending}>
          <Plus className="mr-1 size-4" />
          New item
        </Button>
      </div>
    </>
  );
}

function CollectionHeaderEditor({
  target,
  sendPreview,
  onSaved,
}: {
  target: string;
  sendPreview: (msg: Record<string, unknown>) => void;
  onSaved: () => void;
}) {
  const def = getSection(target);
  const qc = useQueryClient();
  const getFn = useServerFn(adminGetSection);
  const saveFn = useServerFn(adminUpsertSection);
  const [open, setOpen] = useState(true);

  const query = useQuery({
    queryKey: ["admin", "section", target],
    queryFn: () => getFn({ data: { key: target } }),
    enabled: !!def,
  });

  const initial = useMemo(
    () => ({ ...(def?.defaults ?? {}), ...(((query.data as any)?.data ?? {}) as Record<string, any>) }),
    [query.data, def],
  );
  const [values, setValues] = useState<Record<string, any>>(initial);
  useEffect(() => setValues(initial), [initial]);

  const save = useMutation({
    mutationFn: () => saveFn({ data: { key: target, data: values } }),
    onSuccess: () => {
      toast.success("Header saved");
      qc.invalidateQueries({ queryKey: ["admin", "section", target] });
      sendPreview({ type: "clear-section", key: target });
      onSaved();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!def) return null;

  return (
    <div className="mb-3 rounded-md border border-border bg-background/40">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <span>Header</span>
        <span>{open ? "−" : "+"}</span>
      </button>
      {open ? (
        <div className="min-w-0 space-y-4 border-t border-border p-3">
          {def.fields.map((f) => (
            <FieldRenderer
              key={f.key}
              field={f}
              value={values[f.key]}
              onChange={(v) =>
                setValues((p) => {
                  const next = { ...p, [f.key]: v };
                  sendPreview({ type: "section", key: target, data: next });
                  return next;
                })
              }
            />
          ))}
          <div className="flex justify-end">
            <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
              <Save className="mr-1 size-4" />
              {save.isPending ? "Saving…" : "Save header"}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
