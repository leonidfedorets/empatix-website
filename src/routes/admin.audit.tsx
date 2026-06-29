import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { adminListAudit } from "@/lib/admin/audit.functions";

export const Route = createFileRoute("/admin/audit")({
  ssr: false,
  component: AuditPage,
});

type AuditRow = {
  id: string;
  created_at: string;
  actor_email?: string | null;
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  diff?: { before?: unknown; after?: unknown } | Record<string, unknown> | null;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function computeFieldDiffs(before: unknown, after: unknown) {
  const b = isPlainObject(before) ? before : {};
  const a = isPlainObject(after) ? after : {};
  const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)])).sort();
  const changes: { key: string; before: unknown; after: unknown }[] = [];
  for (const k of keys) {
    const bv = b[k];
    const av = a[k];
    if (JSON.stringify(bv) !== JSON.stringify(av)) {
      changes.push({ key: k, before: bv, after: av });
    }
  }
  return changes;
}

function DiffView({ row }: { row: AuditRow }) {
  const diff = row.diff as any;
  if (!diff) {
    return <p className="text-xs text-muted-foreground">No details recorded.</p>;
  }

  const hasBeforeAfter = isPlainObject(diff) && ("before" in diff || "after" in diff);

  if (!hasBeforeAfter) {
    return (
      <pre className="overflow-x-auto rounded-md bg-muted/40 p-3 text-xs">
        {JSON.stringify(diff, null, 2)}
      </pre>
    );
  }

  const before = diff.before;
  const after = diff.after;

  // Create-only
  if (before == null && after != null) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-emerald-500">Created</p>
        <KeyValueGrid data={isPlainObject(after) ? after : { value: after }} tone="add" />
      </div>
    );
  }

  // Delete-only
  if (after == null && before != null) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-red-500">Deleted</p>
        <KeyValueGrid data={isPlainObject(before) ? before : { value: before }} tone="remove" />
      </div>
    );
  }

  const changes = computeFieldDiffs(before, after);
  if (changes.length === 0) {
    return <p className="text-xs text-muted-foreground">No field changes.</p>;
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full text-xs">
        <thead className="bg-muted/40 text-left uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="w-1/4 px-3 py-1.5">Field</th>
            <th className="w-3/8 px-3 py-1.5">Before</th>
            <th className="w-3/8 px-3 py-1.5">After</th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c) => (
            <tr key={c.key} className="border-t border-border align-top">
              <td className="px-3 py-1.5 font-mono text-foreground/80">{c.key}</td>
              <td className="px-3 py-1.5">
                <pre className="whitespace-pre-wrap break-words rounded bg-red-500/10 px-2 py-1 text-red-400">
                  {formatValue(c.before)}
                </pre>
              </td>
              <td className="px-3 py-1.5">
                <pre className="whitespace-pre-wrap break-words rounded bg-emerald-500/10 px-2 py-1 text-emerald-400">
                  {formatValue(c.after)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeyValueGrid({ data, tone }: { data: Record<string, unknown>; tone: "add" | "remove" }) {
  const cls =
    tone === "add"
      ? "bg-emerald-500/10 text-emerald-400"
      : "bg-red-500/10 text-red-400";
  const entries = Object.entries(data);
  if (entries.length === 0) {
    return <p className="text-xs text-muted-foreground">No fields.</p>;
  }
  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full text-xs">
        <tbody>
          {entries.map(([k, v]) => (
            <tr key={k} className="border-t border-border first:border-t-0 align-top">
              <td className="w-1/4 px-3 py-1.5 font-mono text-foreground/80">{k}</td>
              <td className="px-3 py-1.5">
                <pre className={`whitespace-pre-wrap break-words rounded px-2 py-1 ${cls}`}>
                  {formatValue(v)}
                </pre>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function actionBadgeClass(action: string) {
  if (action.includes("create") || action.includes("insert"))
    return "bg-emerald-500/15 text-emerald-400";
  if (action.includes("delete") || action.includes("remove"))
    return "bg-red-500/15 text-red-400";
  if (action.includes("update") || action.includes("upsert") || action.includes("change"))
    return "bg-amber-500/15 text-amber-400";
  return "bg-muted text-foreground/70";
}

function AuditPage() {
  const fn = useServerFn(adminListAudit);
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "audit"],
    queryFn: () => fn({ data: { limit: 200 } }),
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const rows = data as AuditRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Every content change is recorded here. Click a row to see what was changed.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="w-8 px-2 py-2"></th>
              <th className="px-4 py-2">When</th>
              <th className="px-4 py-2">Actor</th>
              <th className="px-4 py-2">Action</th>
              <th className="px-4 py-2">Entity</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-4 py-4 text-muted-foreground" colSpan={5}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-muted-foreground" colSpan={5}>
                  No activity yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const isOpen = !!expanded[row.id];
                return (
                  <Fragment key={row.id}>
                    <tr
                      className="cursor-pointer border-t border-border hover:bg-muted/30"
                      onClick={() =>
                        setExpanded((p) => ({ ...p, [row.id]: !p[row.id] }))
                      }
                    >
                      <td className="px-2 py-2 text-muted-foreground">
                        {isOpen ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </td>
                      <td className="px-4 py-2 text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2">
                        {row.actor_email ?? row.actor_id ?? "system"}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${actionBadgeClass(
                            row.action,
                          )}`}
                        >
                          {row.action}
                        </span>
                      </td>
                      <td className="px-4 py-2 font-mono text-xs">
                        {row.entity_type}
                        {row.entity_id ? ` · ${row.entity_id.slice(0, 8)}…` : ""}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="border-t border-border bg-muted/10">
                        <td></td>
                        <td className="px-4 py-3" colSpan={4}>
                          <DiffView row={row} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
