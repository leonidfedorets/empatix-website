import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequestHeader } from "@tanstack/react-start/server";
import { adminPasswordSchema, assertPasswordTarget } from "./password-policy";

async function getRoles(ctx: any): Promise<string[]> {
  const { data: user, error: userError } = await ctx.supabase.auth.getUser();
  if (userError || !user.user) throw new Error("Unauthorized");
  const { data: access, error: accessError } = await ctx.supabase.from("admin_access").select("active").eq("user_id", ctx.userId).maybeSingle();
  if (accessError || access?.active === false) throw new Error("Access revoked");
  const { data, error } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  return (data || []).map((r: any) => r.role);
}
async function assertAdmin(ctx: any) {
  const roles = await getRoles(ctx);
  if (!roles.some(r => r === "admin" || r === "super_admin")) throw new Error("Forbidden: administrator required");
  return roles;
}
async function authorizedTarget(ctx: any, userId: string) {
  const roles = await assertAdmin(ctx);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: target, error } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  if (target?.some(r => r.role === "super_admin") && !roles.includes("super_admin")) throw new Error("Only a super administrator can modify this account");
  return { supabaseAdmin, roles };
}
function recoveryUrl() {
  const origin = getRequestHeader("origin");
  const base = origin && origin.startsWith("https://") && !/localhost|lovableproject\.com|id-preview/.test(origin)
    ? origin : process.env["SITE_URL"] || "https://empathic-site-studio.lovable.app";
  return `${base}/admin/reset-password`;
}
export const getMyRoles = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(({ context }) => getRoles(context));
export const adminListUsers = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  await assertAdmin(context);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(error.message);
  const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id,role");
  const { data: access } = await supabaseAdmin.from("admin_access").select("user_id,active");
  return list.users.map(u => ({ id: u.id, email: u.email, created_at: u.created_at,
    disabled: !!u.banned_until && new Date(u.banned_until).getTime() > Date.now() || access?.some(a => a.user_id === u.id && !a.active) || false,
    roles: (roles || []).filter(r => r.user_id === u.id).map(r => r.role), invited: !!u.invited_at && !u.last_sign_in_at }));
});
export const adminCreateUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ email: z.string().trim().email(), role: z.enum(["editor", "admin", "super_admin"]) }).parse(d))
  .handler(async ({ data, context }) => {
    const roles = await assertAdmin(context);
    if (data.role === "super_admin" && !roles.includes("super_admin")) throw new Error("Only super administrators can grant this role");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: invited, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, { redirectTo: recoveryUrl() });
    if (error) throw new Error(error.message);
    if (!invited.user) throw new Error("Invitation failed");
    const { error: roleError } = await supabaseAdmin.from("user_roles").insert({ user_id: invited.user.id, role: data.role });
    if (roleError) {
      await supabaseAdmin.auth.admin.deleteUser(invited.user.id);
      throw new Error(roleError.message);
    }
    return { id: invited.user.id };
  });
export const adminSendPasswordEmail = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await authorizedTarget(context, data.user_id);
    const { data: target, error: targetError } = await supabaseAdmin.auth.admin.getUserById(data.user_id);
    if (targetError || !target.user?.email) throw new Error("User not found");
    const { error } = await supabaseAdmin.auth.resetPasswordForEmail(target.user.email, { redirectTo: recoveryUrl() });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const adminSetUserDisabled = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ user_id: z.string().uuid(), disabled: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await authorizedTarget(context, data.user_id);
    if (data.user_id === context.userId) throw new Error("Cannot block your own account");
    const { error: accessError } = await supabaseAdmin.from("admin_access").upsert({ user_id: data.user_id, active: !data.disabled });
    if (accessError) throw new Error(accessError.message);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, { ban_duration: data.disabled ? "876000h" : "none" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const adminSetUserPassword = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => adminPasswordSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin, roles } = await authorizedTarget(context, data.user_id);
    const { data: targetRoles, error: roleError } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", data.user_id);
    if (roleError) throw new Error(roleError.message);
    assertPasswordTarget(roles, (targetRoles || []).map(row => row.role));
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, { password: data.password });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const adminDeleteUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await authorizedTarget(context, data.user_id);
    if (data.user_id === context.userId) throw new Error("Cannot delete your own account");
    const { error: accessError } = await supabaseAdmin.from("admin_access").upsert({ user_id: data.user_id, active: false });
    if (accessError) throw new Error(accessError.message);
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
export const adminSetUserRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ user_id: z.string().uuid(), role: z.enum(["editor", "admin", "super_admin"]), grant: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin, roles } = await authorizedTarget(context, data.user_id);
    if (data.role === "super_admin" && !roles.includes("super_admin")) throw new Error("Only super administrators can change this role");
    if (data.user_id === context.userId && !data.grant) throw new Error("Cannot revoke your own role");
    const result = data.grant
      ? await supabaseAdmin.from("user_roles").upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" })
      : await supabaseAdmin.from("user_roles").delete().eq("user_id", data.user_id).eq("role", data.role);
    if (result.error) throw new Error(result.error.message);
    return { ok: true };
  });
