import { describe, expect, it } from "vitest";
import { adminPasswordSchema, assertPasswordTarget } from "../../src/lib/admin/password-policy";

describe("Administrator password changes", () => {
  it("Rejects passwords shorter than the existing 12-character minimum", () => {
    expect(adminPasswordSchema.safeParse({ user_id: "e62f3cb0-a60f-4b20-81ce-a23c2c05f86b", password: "a".repeat(11) }).success).toBe(false);
    expect(adminPasswordSchema.safeParse({ user_id: "e62f3cb0-a60f-4b20-81ce-a23c2c05f86b", password: "a".repeat(12) }).success).toBe(true);
  });
  it("Denies editors", () => expect(() => assertPasswordTarget(["editor"], ["editor"])).toThrow("administrator required"));
  it("Denies visitors", () => expect(() => assertPasswordTarget([], ["editor"])).toThrow("administrator required"));
  it("Allows administrators to reset editor passwords", () => expect(() => assertPasswordTarget(["admin"], ["editor"])).not.toThrow());
  it("Protects super administrators from ordinary administrators", () => expect(() => assertPasswordTarget(["admin"], ["super_admin"])).toThrow("Only a super administrator"));
  it("Allows super administrators to reset other super administrators", () => expect(() => assertPasswordTarget(["super_admin"], ["super_admin"])).not.toThrow());
});