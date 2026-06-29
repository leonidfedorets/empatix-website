import { test, expect } from "@playwright/test";

test.describe("Admin panel access control", () => {
  test("redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
    // Should land on login or redirect back to home — not show the admin dashboard
    const url = page.url();
    const isLoginOrHome = /login|\/admin\/login|\/$/.test(url);
    expect(isLoginOrHome, `Expected redirect to login but got: ${url}`).toBe(true);
  });

  test("admin login page renders email/password fields", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"]').first()).toBeVisible();
  });

  test("admin login rejects wrong credentials", async ({ page }) => {
    await page.goto("/admin/login", { waitUntil: "domcontentloaded" });
    await page.locator('input[type="email"]').fill("wrong@example.com");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.locator('button[type="submit"]').click();

    // After failed login, should stay on login page or show error
    await page.waitForTimeout(2000);
    const url = page.url();
    expect(url).toContain("login");
  });
});
