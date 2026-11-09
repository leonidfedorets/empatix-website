import { describe, expect, it } from "vitest";
import { canEditInsights, isAdministrator, editorPathAllowed } from "../../src/lib/admin/access";
import { articleSchema, safeArticleHtml, validatePublication } from "../../src/lib/admin/insights-validation";
const article = {title: "Test article", slug: "test-article", category: "AI", categories: "AI", image: "https://example.com/photo.jpg", bodyHtml: "<p>Article text</p>", date: "2026-11-05"};
describe("Insights access rules", () => {
  it("Editor can manage Insights", () => expect(canEditInsights(["editor"])).toBe(true));
  it("Editor cannot manage users", () => expect(isAdministrator(["editor"])).toBe(false));
  it("Editor cannot access other pages", () => expect(editorPathAllowed("/admin/editor")).toBe(false));
  it("Editor cannot access users", () => expect(editorPathAllowed("/admin/users")).toBe(false));
  it("Existing administrator retains full access", () => expect(isAdministrator(["admin"])).toBe(true));
  it("Unauthenticated visitor cannot edit", () => expect(canEditInsights([])).toBe(false));
});
describe("Article validation", () => {
  it("Requires a cover to publish", () => expect(() => validatePublication(articleSchema.parse({...article,image: ""}))).toThrow());
  it("Requires article text to publish", () => expect(() => validatePublication(articleSchema.parse({...article,bodyHtml: "<p></p>"}))).toThrow());
  it("Requires a publication date", () => expect(() => validatePublication(articleSchema.parse({...article,date: ""}))).toThrow());
  it("Allows incomplete drafts", () => expect(articleSchema.parse({...article,image: "",bodyHtml: "",date: ""}).image).toBe(""));
  it("Disallows script links", () => expect(safeArticleHtml('<a href="javascript:alert(1)">Unsafe</a>')).not.toContain("javascript:"));
  it("Disallows script execution", () => expect(safeArticleHtml('<script>alert(1)</script><img src="https://example.com/i.jpg" onerror="alert(1)">')).not.toMatch(/script|onerror/));
  it("Cannot embed design overrides", () => expect(safeArticleHtml('<p style="color:red" class="x">Content</p>')).toBe("<p>Content</p>"));
});
