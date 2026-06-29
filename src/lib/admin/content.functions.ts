import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function assertAdmin(ctx: any) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .in("role", ["admin", "super_admin"])
    .limit(1)
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

async function logAudit(
  ctx: any,
  entry: { entity_type: string; entity_id?: string | null; action: string; diff?: unknown },
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  await supabaseAdmin.from("audit_log").insert({
    actor_id: ctx.userId,
    actor_email: ctx.claims?.email ?? null,
    entity_type: entry.entity_type,
    entity_id: entry.entity_id ?? null,
    action: entry.action,
    diff: (entry.diff as any) ?? null,
  });
}

// ---------- Sections ----------

export const adminListSections = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("content_sections")
      .select("*")
      .order("key");
    if (error) throw new Error(error.message);
    return (data ?? []) as any;
  });

export const adminGetSection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ key: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("content_sections")
      .select("*")
      .eq("key", data.key)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as any;
  });

export const adminUpsertSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ key: z.string().min(1).max(64), data: z.record(z.unknown()) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: existing } = await context.supabase
      .from("content_sections")
      .select("data,version")
      .eq("key", data.key)
      .maybeSingle();
    const nextVersion = ((existing?.version as number | undefined) ?? 0) + 1;
    const { data: row, error } = await context.supabase
      .from("content_sections")
      .upsert({
        key: data.key,
        data: data.data as any,
        updated_by: context.userId,
        version: nextVersion,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await logAudit(context, {
      entity_type: "content_section",
      entity_id: data.key,
      action: existing ? "update" : "create",
      diff: { before: existing?.data ?? null, after: data.data },
    });
    return row as any;
  });

// ---------- Collections ----------

export const adminListItems = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ collection: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: rows, error } = await context.supabase
      .from("content_items")
      .select("*")
      .eq("collection", data.collection)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (rows ?? []) as any;
  });

export const adminGetItem = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("content_items")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row as any;
  });

export const adminCreateItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        collection: z.string().min(1),
        data: z.record(z.unknown()),
        sort_order: z.number().int().default(0),
        status: z.enum(["draft", "published"]).default("published"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("content_items")
      .insert({
        collection: data.collection,
        data: data.data as any,
        sort_order: data.sort_order,
        status: data.status,
        updated_by: context.userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    await logAudit(context, {
      entity_type: `collection:${data.collection}`,
      entity_id: row.id,
      action: "create",
      diff: { after: data.data },
    });
    return row as any;
  });

export const adminUpdateItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        data: z.record(z.unknown()).optional(),
        sort_order: z.number().int().optional(),
        status: z.enum(["draft", "published"]).optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: before } = await context.supabase
      .from("content_items")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (!before) throw new Error("Not found");
    const update: any = {
      updated_by: context.userId,
      version: ((before.version as number | undefined) ?? 0) + 1,
    };
    if (data.data !== undefined) update.data = data.data;
    if (data.sort_order !== undefined) update.sort_order = data.sort_order;
    if (data.status !== undefined) update.status = data.status;
    const { data: row, error } = await context.supabase
      .from("content_items")
      .update(update)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    await logAudit(context, {
      entity_type: `collection:${before.collection}`,
      entity_id: data.id,
      action: "update",
      diff: { before: before.data, after: row.data },
    });
    return row as any;
  });

export const adminDeleteItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { data: before } = await context.supabase
      .from("content_items")
      .select("collection,data")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await context.supabase.from("content_items").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    if (before) {
      await logAudit(context, {
        entity_type: `collection:${before.collection}`,
        entity_id: data.id,
        action: "delete",
        diff: { before: before.data },
      });
    }
    return { ok: true };
  });

// ---------- Public reads ----------

export const publicGetSection = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ key: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data: row } = await sb
      .from("content_sections")
      .select("data")
      .eq("key", data.key)
      .maybeSingle();
    return ((row as any)?.data ?? null) as Record<string, any> | null;
  });

export const publicListItems = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ collection: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const sb = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const { data: rows } = await sb
      .from("content_items")
      .select("id,data,sort_order")
      .eq("collection", data.collection)
      .eq("status", "published")
      .order("sort_order", { ascending: true });
    return (rows ?? []) as any[];
  });
