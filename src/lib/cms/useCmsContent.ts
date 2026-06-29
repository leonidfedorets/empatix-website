import { useEffect, useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { publicGetSection, publicListItems } from "@/lib/admin/content.functions";
import { getSection, getCollection } from "@/lib/admin/schemas";
import { cmsPreviewStore } from "@/lib/cms/previewStore";

/**
 * Subscribes the React Query cache to realtime CMS changes so every page
 * that uses `useCmsSection` / `useCmsCollection` updates the instant an
 * admin saves in the editor. Mounted once at the app root.
 */
export function useCmsRealtime() {
  const qc = useQueryClient();
  useEffect(() => {
    const channel = supabase
      .channel("cms-public")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "content_sections" },
        (payload) => {
          const row = (payload.new ?? payload.old) as { key?: string } | null;
          if (row?.key) {
            qc.invalidateQueries({ queryKey: ["cms", "section", row.key] });
          } else {
            qc.invalidateQueries({ queryKey: ["cms", "section"] });
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "content_items" },
        (payload) => {
          const row = (payload.new ?? payload.old) as { collection?: string } | null;
          if (row?.collection) {
            qc.invalidateQueries({ queryKey: ["cms", "collection", row.collection] });
          } else {
            qc.invalidateQueries({ queryKey: ["cms", "collection"] });
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);
}

/**
 * Reads a CMS section from the DB and merges it with the schema defaults.
 * If the DB has no row yet, the hardcoded defaults are returned, so the
 * public site never goes blank.
 */
export function useCmsSection<T extends Record<string, unknown>>(key: string): T {
  const def = getSection(key);
  const fn = useServerFn(publicGetSection);
  const q = useQuery({
    queryKey: ["cms", "section", key],
    queryFn: () => fn({ data: { key } }),
    staleTime: 30_000,
  });
  const override = useSyncExternalStore(
    cmsPreviewStore.subscribe,
    () => cmsPreviewStore.getSection(key),
    () => undefined,
  );
  return {
    ...(def?.defaults ?? {}),
    ...((q.data ?? {}) as Record<string, unknown>),
    ...((override ?? {}) as Record<string, unknown>),
  } as T;
}

/**
 * Reads a CMS collection. Returns an empty array while loading.
 */
export function useCmsCollection<T extends Record<string, unknown>>(
  key: string,
): { id: string; data: T; sort_order: number }[] {
  // touch the schema for early failure when keys go out of sync
  getCollection(key);
  const fn = useServerFn(publicListItems);
  const q = useQuery({
    queryKey: ["cms", "collection", key],
    queryFn: () => fn({ data: { collection: key } }),
    staleTime: 30_000,
  });
  const override = useSyncExternalStore(
    cmsPreviewStore.subscribe,
    () => cmsPreviewStore.getCollection(key),
    () => undefined,
  );
  if (override) return override as { id: string; data: T; sort_order: number }[];
  return (q.data ?? []) as { id: string; data: T; sort_order: number }[];
}
