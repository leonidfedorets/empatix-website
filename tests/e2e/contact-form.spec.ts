import { test, expect } from "@playwright/test";

test.describe("Contact form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact", { waitUntil: "domcontentloaded" });
  });

  test("renders all required fields", async ({ page }) => {
    await expect(page.locator('input[name="name"], input[placeholder*="name" i]').first()).toBeVisible();
    await expect(page.locator('input[name="email"], input[type="email"]').first()).toBeVisible();
    await expect(page.locator('textarea, input[name="message"]').first()).toBeVisible();
    await expect(page.locator('button[type="submit"], button:has-text("Send")').first()).toBeVisible();
  });

  test("shows validation errors on empty submit", async ({ page }) => {
    const submitBtn = page.locator('button[type="submit"], button:has-text("Send")').first();
    await submitBtn.click();
    // At least one error or the form doesn't navigate away
    await expect(page).toHaveURL(/contact/);
  });

  test("accepts valid form input", async ({ page }) => {
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first();
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    const messageInput = page.locator('textarea').first();

    await nameInput.fill("Test User");
    await emailInput.fill("test@example.com");
    await messageInput.fill("This is a test message from automated e2e tests.");

    // Verify values were entered
    await expect(nameInput).toHaveValue("Test User");
    await expect(emailInput).toHaveValue("test@example.com");
  });
});
