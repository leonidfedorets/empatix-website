import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function getRoles(ctx: { supabase: any; userId: string }): Promise<string[]> {
  const { data, error } = await ctx.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", ctx.userId);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r: any) => r.role as string);
}

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const roles = await getRoles(ctx);
  if (!roles.includes("admin") && !roles.includes("super_admin")) {
    throw new Error("Forbidden: admin required");
  }
  return roles;
}

async function assertSuperAdmin(ctx: { supabase: any; userId: string }) {
  const roles = await getRoles(ctx);
  if (!roles.includes("super_admin")) throw new Error("Forbidden: super_admin required");
}

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 200 });
    if (error) throw new Error(error.message);
    const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id,role");
    const roleByUser = new Map<string, string[]>();
    (roles ?? []).forEach((r: any) => {
      const arr = roleByUser.get(r.user_id) ?? [];
      arr.push(r.role);
      roleByUser.set(r.user_id, arr);
    });
    return list.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      disabled: !!u.banned_until,
      roles: roleByUser.get(u.id) ?? [],
    }));
  });

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        email: z.string().email(),
        password: z.string().min(12),
        role: z.enum(["admin", "super_admin"]),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const myRoles = await assertAdmin(context as any);
    if (data.role === "super_admin" && !myRoles.includes("super_admin")) {
      throw new Error("Only super_admin can grant super_admin role");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error) throw new Error(error.message);
    if (!created.user) throw new Error("Failed to create user");
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: data.role });
    if (rErr) throw new Error(rErr.message);
    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      actor_email: (context.claims as any).email,
      entity_type: "user",
      entity_id: created.user.id,
      action: "create",
      diff: { email: data.email, role: data.role },
    });
    return { id: created.user.id };
  });

async function targetIsSuperAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (data ?? []).some((r: any) => r.role === "super_admin");
}

export const adminSetUserDisabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ user_id: z.string().uuid(), disabled: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const myRoles = await assertAdmin(context as any);
    if (data.user_id === context.userId) throw new Error("Cannot disable yourself");
    if (!myRoles.includes("super_admin") && (await targetIsSuperAdmin(data.user_id))) {
      throw new Error("Only super_admin can modify a super_admin user");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      ban_duration: data.disabled ? "876000h" : "none",
    } as any);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      actor_email: (context.claims as any).email,
      entity_type: "user",
      entity_id: data.user_id,
      action: data.disabled ? "disable" : "enable",
    });
    return { ok: true };
  });

export const adminDeleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ user_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const myRoles = await assertAdmin(context as any);
    if (data.user_id === context.userId) throw new Error("Cannot delete yourself");
    if (!myRoles.includes("super_admin") && (await targetIsSuperAdmin(data.user_id))) {
      throw new Error("Only super_admin can delete a super_admin user");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      actor_email: (context.claims as any).email,
      entity_type: "user",
      entity_id: data.user_id,
      action: "delete",
    });
    return { ok: true };
  });

export const adminSetUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        user_id: z.string().uuid(),
        role: z.enum(["admin", "super_admin"]),
        grant: z.boolean(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const myRoles = await assertAdmin(context as any);
    const iAmSuper = myRoles.includes("super_admin");
    if (data.role === "super_admin" && !iAmSuper) {
      throw new Error("Only super_admin can grant or revoke super_admin role");
    }
    if (!iAmSuper && (await targetIsSuperAdmin(data.user_id))) {
      throw new Error("Only super_admin can modify a super_admin user");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.grant) {
      await supabaseAdmin
        .from("user_roles")
        .upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" });
    } else {
      if (data.user_id === context.userId && data.role === "super_admin") {
        throw new Error("Cannot revoke your own super_admin role");
      }
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", data.role);
    }
    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      actor_email: (context.claims as any).email,
      entity_type: "user_role",
      entity_id: data.user_id,
      action: data.grant ? "grant" : "revoke",
      diff: { role: data.role },
    });
    return { ok: true };
  });

/** Returns the current user's roles. Used by the admin layout to gate UI. */
export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => r.role as string);
  });
