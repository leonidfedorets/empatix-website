import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId)
    .in("role", ["admin", "super_admin"])
    .limit(1)
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden");
}

export const adminListMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { data, error } = await context.supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminUploadMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => {
    if (!(d instanceof FormData)) throw new Error("FormData required");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const file = data.get("file");
    const alt = (data.get("alt") as string | null) ?? null;
    if (!(file instanceof File)) throw new Error("Missing file");
    if (file.size > 15 * 1024 * 1024) throw new Error("File too large (max 15MB)");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ext = (file.name.split(".").pop() ?? "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
    const safeName = `${crypto.randomUUID()}.${ext}`;
    const path = `${new Date().getFullYear()}/${safeName}`;
    const bytes = new Uint8Array(await file.arrayBuffer());

    const { error: upErr } = await supabaseAdmin.storage
      .from("media")
      .upload(path, bytes, { contentType: file.type, upsert: false });
    if (upErr) throw new Error(upErr.message);

    const publicUrl = `/api/public/media/${path}`;
    const { data: row, error } = await supabaseAdmin
      .from("media_assets")
      .insert({
        storage_path: path,
        public_url: publicUrl,
        mime: file.type,
        size_bytes: file.size,
        alt,
        uploaded_by: context.userId,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteMedia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("media_assets")
      .select("storage_path")
      .eq("id", data.id)
      .maybeSingle();
    if (row?.storage_path) {
      await supabaseAdmin.storage.from("media").remove([row.storage_path]);
    }
    await supabaseAdmin.from("media_assets").delete().eq("id", data.id);
    return { ok: true };
  });

export const adminUpdateMediaAlt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid(), alt: z.string().max(300) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { error } = await context.supabase
      .from("media_assets")
      .update({ alt: data.alt })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
