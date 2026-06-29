# Visual Regression Tests

Playwright-based visual regression suite. Catches layout shifts, content
overlap with decorative elements, and broken responsive stacking.

## What is covered

- **Routes:** `/`, `/about`, `/services`, `/ai-solutions`, `/industries`,
  `/how-we-work`, `/team-extension`, `/cases`, `/insights`, `/contact`.
- **Breakpoints:** 390, 414, 768, 1024, 1280, 1440, 1920 px wide.
- Per page-per-breakpoint full-page screenshot + horizontal-overflow assertion
  + runtime-error check.

Total: 10 routes × 7 viewports = 70 baseline snapshots.

## Commands

```bash
# Run comparison against baselines (fails on visual diff > 0.5%)
bun run test:visual

# Update baselines after an intentional UI change — REVIEW the diff before committing
bun run test:visual:update

# Open the HTML report (diffs visualized side by side)
bunx playwright show-report
```

The first run produces baselines. Commit `tests/visual/__screenshots__/`.
Subsequent runs compare against those baselines and fail on regression.

## Stability

Each test:
- waits for `document.fonts.ready`,
- disables animations / transitions / `scroll-behavior`,
- forces hidden-on-load reveal wrappers visible,
- runs with `prefers-reduced-motion: reduce` and forced dark scheme.

Threshold: `maxDiffPixelRatio: 0.005` (0.5%) — tight enough to catch real
layout shifts, loose enough to ignore subpixel anti-aliasing noise.

## CI

Set `E2E_BASE_URL` to skip the bundled `bun run dev` and point at any
running deployment (preview URL, staging, etc.).

```bash
E2E_BASE_URL=https://preview.example.com bun run test:visual
```
