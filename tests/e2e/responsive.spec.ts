import { test, expect, type Page } from "@playwright/test";

/**
 * Functional responsive tests — checks layout integrity across viewports.
 * Complements the visual regression suite in tests/visual/.
 */

const CRITICAL_ROUTES = [
  { path: "/", name: "home" },
  { path: "/services", name: "services" },
  { path: "/contact", name: "contact" },
];

const BREAKPOINTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

async function checkLayout(page: Page, path: string, viewportName: string) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(path, { waitUntil: "domcontentloaded" });

  // No horizontal scroll
  const overflow = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(
    overflow.scroll,
    `Horizontal overflow on ${path} @${viewportName} (scrollWidth=${overflow.scroll})`,
  ).toBeLessThanOrEqual(overflow.client + 1);

  // Header visible
  await expect(page.locator("header").first()).toBeVisible();

  // Footer visible (scroll to bottom)
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.locator("footer").first()).toBeVisible();

  expect(errors, `JS errors on ${path} @${viewportName}:\n${errors.join("\n")}`).toEqual([]);
}

for (const bp of BREAKPOINTS) {
  test.describe(`@${bp.name} (${bp.width}px)`, () => {
    test.use({ viewport: { width: bp.width, height: bp.height } });

    for (const route of CRITICAL_ROUTES) {
      test(`${route.name} layout is correct`, async ({ page }) => {
        await checkLayout(page, route.path, bp.name);
      });
    }
  });
}
