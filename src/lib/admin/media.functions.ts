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

async function assertArticleAccess(ctx: any) {
  const { data, error } = await ctx.supabase.rpc("can_edit_insights");
  if (error || !data) throw new Error("Forbidden");
}

export const adminListMedia = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertArticleAccess(context);
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
    await assertArticleAccess(context);
    const file = data.get("file");
    const alt = (data.get("alt") as string | null) ?? null;
    if (!(file instanceof File)) throw new Error("Missing file");
    if (file.size > 15 * 1024 * 1024) throw new Error("File too large (max 15MB)");
    const types = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!types.includes(file.type)) throw new Error("Unsupported image format");
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    const editorOnly = !roles?.some(r => r.role === "admin" || r.role === "super_admin");
    if (editorOnly && file.type === "image/svg+xml") throw new Error("For article images use JPG, PNG, WebP or GIF");
    const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const ascii = new TextDecoder().decode(signature);
    const valid = file.type === "image/jpeg" ? signature[0] === 255 && signature[1] === 216
      : file.type === "image/png" ? signature[0] === 137 && ascii.slice(1,4) === "PNG"
      : file.type === "image/webp" ? ascii.startsWith("RIFF") && ascii.slice(8) === "WEBP"
      : file.type === "image/gif" ? ascii.startsWith("GIF8") : true;
    if (!valid) throw new Error("Invalid image file");

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
    await assertArticleAccess(context);
    const { data: roles } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    const admin = roles?.some(r => r.role === "admin" || r.role === "super_admin");
    const { data: asset } = await context.supabase.from("media_assets").select("uploaded_by").eq("id", data.id).single();
    if (!admin && asset?.uploaded_by !== context.userId) throw new Error("You can edit descriptions of your own uploads only");
    const { error } = await context.supabase
      .from("media_assets")
      .update({ alt: data.alt })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
