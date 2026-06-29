import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const adminListAudit = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        limit: z.number().int().min(1).max(500).default(100),
        entity_type: z.string().optional(),
      })
      .parse(d ?? {}),
  )
  .handler(async ({ data, context }) => {
    // RLS on audit_log already restricts SELECT to admins via private.is_admin.

    let q = context.supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (data.entity_type) q = q.eq("entity_type", data.entity_type);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
