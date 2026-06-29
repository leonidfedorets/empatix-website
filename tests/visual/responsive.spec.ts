import { test, expect, type Page } from "@playwright/test";

/**
 * Visual regression matrix: key routes × responsive breakpoints.
 *
 * Catches:
 *  - Layout shifts and reflows after refactors
 *  - Content overlapping decorative elements
 *  - Broken stacking at tablet/mobile
 *  - Header / footer / hero regressions
 */

// Key user-facing routes. Each gets its own baseline per breakpoint.
const ROUTES: { path: string; name: string }[] = [
  { path: "/", name: "home" },
  { path: "/about", name: "about" },
  { path: "/services", name: "services" },
  { path: "/ai-solutions", name: "ai-solutions" },
  { path: "/industries", name: "industries" },
  { path: "/how-we-work", name: "how-we-work" },
  { path: "/team-extension", name: "team-extension" },
  { path: "/cases", name: "cases" },
  { path: "/insights", name: "insights" },
  { path: "/contact", name: "contact" },
];

// Breakpoints aligned with the project's responsive rules
// (Mobile <768, Tablet 768–1279, Desktop 1280–1599, Desktop XL 1600+).
const VIEWPORTS: { name: string; width: number; height: number }[] = [
  { name: "mobile-390", width: 390, height: 844 },   // iPhone-class
  { name: "mobile-414", width: 414, height: 896 },   // large phones
  { name: "tablet-768", width: 768, height: 1024 },  // tablet breakpoint edge
  { name: "tablet-1024", width: 1024, height: 1366 }, // landscape tablet
  { name: "desktop-1280", width: 1280, height: 900 }, // desktop edge
  { name: "desktop-1440", width: 1440, height: 900 }, // standard desktop
  { name: "desktop-1920", width: 1920, height: 1080 }, // desktop XL
];

async function stabilize(page: Page) {
  // Wait for web fonts so glyph metrics don't shift screenshot to screenshot.
  await page.evaluate(async () => {
    // @ts-expect-error - document.fonts is a standard browser API
    if (document.fonts?.ready) await document.fonts.ready;
  });

  // Kill animations, transitions, and motion-driven transforms that would
  // otherwise produce flaky diffs.
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      [style*="opacity: 0"], [style*="opacity:0"] { opacity: 1 !important; }
      html { scroll-behavior: auto !important; }
    `,
  });

  // Freeze JS-driven animations (framer-motion, marquees, etc.) by neutering
  // requestAnimationFrame after the current frame settles.
  await page.evaluate(() => {
    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.requestAnimationFrame = () => 0 as unknown as number;
          resolve();
        });
      });
    });
  });

  // Give layout one frame to settle after style injection / rAF freeze.
  await page.waitForTimeout(200);
}

for (const vp of VIEWPORTS) {
  test.describe(`@${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    for (const route of ROUTES) {
      test(`${route.name} (${vp.width}×${vp.height})`, async ({ page }) => {
        // Hard JS errors are real bugs — fail on them. Console warnings (incl.
        // React hydration noise and 404 asset chatter) are ignored so they
        // don't drown out actual visual regressions.
        const pageErrors: string[] = [];
        page.on("pageerror", (e) => pageErrors.push(e.message));

        await page.goto(route.path, { waitUntil: "domcontentloaded" });
        await stabilize(page);

        // Sanity: no horizontal overflow at this breakpoint.
        const overflow = await page.evaluate(() => {
          const de = document.documentElement;
          return { scroll: de.scrollWidth, client: de.clientWidth };
        });
        expect(
          overflow.scroll,
          `horizontal overflow on ${route.path} @${vp.width}px (scrollWidth=${overflow.scroll}, clientWidth=${overflow.client})`,
        ).toBeLessThanOrEqual(overflow.client + 1);

        // Full-page screenshot baseline. Path is viewport-scoped so each
        // breakpoint keeps its own baseline file under __snapshots__/<vp>/.
        await expect(page).toHaveScreenshot([vp.name, `${route.name}.png`], {
          fullPage: true,
        });

        expect(pageErrors, pageErrors.join("\n")).toEqual([]);
      });
    }
  });
}
