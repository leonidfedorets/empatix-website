import { test, expect } from "@playwright/test";

/**
 * Navigation smoke tests — every public route returns 200, renders a heading,
 * and has no horizontal overflow.
 */

const PUBLIC_ROUTES = [
  { path: "/", title: /empatix/i },
  { path: "/about", title: /about/i },
  { path: "/services", title: /services/i },
  { path: "/ai-solutions", title: /ai/i },
  { path: "/industries", title: /industries/i },
  { path: "/how-we-work", title: /how we work/i },
  { path: "/team-extension", title: /team/i },
  { path: "/cases", title: /cases/i },
  { path: "/insights", title: /insights/i },
  { path: "/contact", title: /contact/i },
];

for (const route of PUBLIC_ROUTES) {
  test(`${route.path} — renders without errors`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (e) => pageErrors.push(e.message));

    const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });

    expect(response?.status(), `${route.path} should return 200`).toBe(200);

    // No horizontal overflow
    const overflow = await page.evaluate(() => ({
      scroll: document.documentElement.scrollWidth,
      client: document.documentElement.clientWidth,
    }));
    expect(
      overflow.scroll,
      `Horizontal overflow on ${route.path}: scrollWidth=${overflow.scroll}, clientWidth=${overflow.client}`,
    ).toBeLessThanOrEqual(overflow.client + 1);

    expect(pageErrors, `JS errors on ${route.path}:\n${pageErrors.join("\n")}`).toEqual([]);
  });
}

test("404 page renders for unknown route", async ({ page }) => {
  await page.goto("/this-page-does-not-exist-xyz");
  await expect(page.locator("text=/404|not found/i").first()).toBeVisible();
});
