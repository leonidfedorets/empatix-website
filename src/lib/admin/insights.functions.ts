import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { articleSchema, safeArticleHtml, validatePublication } from "./insights-validation";

async function authorize(ctx: any) {
  const { data: user, error: userError } = await ctx.supabase.auth.getUser();
  if (userError || !user.user) throw new Error("Unauthorized");
  const { data, error } = await ctx.supabase.rpc("can_edit_insights");
  if (error || !data) throw new Error("Forbidden");
}

export const listInsights = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await authorize(context);
  const { data, error } = await context.supabase.from("content_items").select("*").eq("collection", "insights_items").order("sort_order");
  if (error) throw new Error(error.message);
  return data || [];
});

export const saveInsight = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid().optional(), version: z.number().optional(), status: z.enum(["draft", "published"]), article: articleSchema }).parse(input))
  .handler(async ({ data, context }) => {
    await authorize(context);
    if (data.status === "published") validatePublication(data.article);
    const before = data.id ? await context.supabase.from("content_items").select("*").eq("id", data.id).eq("collection", "insights_items").single() : null;
    if (data.id && (!before?.data || before.error)) throw new Error("Article not found");
    const version = before?.data?.version || 0;
    if (data.version !== undefined && data.version !== version) throw new Error("This article was changed by another editor. Reload before saving.");
    const payload = { data: { ...(before?.data?.data as any || {}), ...data.article }, status: data.status, version: version + 1, updated_by: context.userId };
    const result = data.id
      ? await context.supabase.from("content_items").update(payload).eq("id", data.id).eq("collection", "insights_items").eq("version", version).select().single()
      : await context.supabase.from("content_items").insert({ ...payload, collection: "insights_items", sort_order: 0 }).select().single();
    if (result.error) throw new Error(result.error.code === "23505" ? "This URL is already used by another article" : result.error.message);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("audit_log").insert({ actor_id: context.userId, entity_type: "collection:insights_items", entity_id: result.data.id, action: before ? "update" : "create", diff: { before: before?.data?.data, after: result.data.data } });
    return result.data;
  });

export const deleteInsight = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await authorize(context);
    const { error } = await context.supabase.from("content_items").delete().eq("id", data.id).eq("collection", "insights_items");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const publicInsights = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  const url = process.env["SUPABASE_URL"];
  if (!key || !url) throw new Error("Content configuration unavailable");
  const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key); return fetch(input, { ...init, headers });
  } } });
  const { data, error } = await sb.from("content_items").select("id,data,sort_order").eq("collection", "insights_items").eq("status", "published").order("sort_order");
  if (error) throw new Error(error.message);
  return (data || []).map(row => ({ ...row, data: { ...row.data, ...(row.data.bodyHtml ? { bodyHtml: safeArticleHtml(row.data.bodyHtml) } : {}) } }));
});