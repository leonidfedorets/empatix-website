import { z } from "zod";

export const adminPasswordSchema = z.object({
  user_id: z.string().uuid(),
  password: z.string().min(12, "Use at least 12 characters").max(128, "Use at most 128 characters"),
});

export function assertPasswordTarget(roles: string[], targetRoles: string[]) {
  if (!roles.some(role => role === "admin" || role === "super_admin")) {
    throw new Error("Forbidden: administrator required");
  }
  if (targetRoles.includes("super_admin") && !roles.includes("super_admin")) {
    throw new Error("Only a super administrator can modify this account");
  }
}