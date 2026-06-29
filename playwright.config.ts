import { defineConfig, devices } from "@playwright/test";

/**
 * Visual regression config.
 * Baselines live next to each spec under `tests/visual/__screenshots__/`.
 *
 * Usage:
 *   bun run test:visual           — run comparison against baselines
 *   bun run test:visual:update    — refresh baselines after intentional UI changes
 */
export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  outputDir: "test-results",
  timeout: 60_000,
  expect: {
    // Pixel-diff threshold. Anti-aliasing & subpixel rounding shift a few pixels
    // between runs; 0.5% is tight enough to catch real layout shifts.
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      animations: "disabled",
      caret: "hide",
      scale: "css",
      // Some pages have JS-driven motion (marquees, framer-motion infinite
      // loops). Give the stability check enough time to find two matching
      // consecutive frames.
      timeout: 20_000,
    },
  },
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:8080",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    colorScheme: "dark",
    reducedMotion: "reduce",
    deviceScaleFactor: 1,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          // Use the sandbox-bundled Chromium so we don't need `playwright install`.
          executablePath:
            process.env.PLAYWRIGHT_CHROMIUM_PATH ??
            "/chromium-1194/chrome-linux/chrome",
        },
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "bun run dev",
        url: "http://localhost:8080",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
