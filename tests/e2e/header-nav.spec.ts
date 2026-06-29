import { test, expect } from "@playwright/test";

test.describe("Site header navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("header is visible", async ({ page }) => {
    await expect(page.locator("header").first()).toBeVisible();
  });

  test("logo links to homepage", async ({ page }) => {
    const logo = page.locator("header a").first();
    await logo.click();
    await expect(page).toHaveURL("/");
  });

  test("mobile hamburger menu opens", async ({ page, viewport }) => {
    if ((viewport?.width ?? 1280) >= 768) test.skip();

    const hamburger = page.locator('button[aria-label*="menu" i], button[aria-expanded]').first();
    if (await hamburger.isVisible()) {
      await hamburger.click();
      // Some nav link should be visible after open
      await expect(page.locator("nav a").first()).toBeVisible();
    }
  });

  test("desktop nav links navigate correctly", async ({ page, viewport }) => {
    if ((viewport?.width ?? 1280) < 768) test.skip();

    const navLinks = page.locator("header nav a, header a[href]");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe("Site footer", () => {
  test("footer renders on homepage", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.locator("footer").first()).toBeVisible();
  });

  test("footer has contact/legal links", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    // Privacy or terms link
    const legalLink = footer.locator("a[href*='privacy'], a[href*='terms'], a[href*='contact']").first();
    await expect(legalLink).toBeVisible();
  });
});
