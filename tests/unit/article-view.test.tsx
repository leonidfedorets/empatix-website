import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: { children: React.ReactNode; to: string }) =>
    React.createElement("a", { ...props, href: to }, children),
}));

import { ArticleView } from "../../src/components/ArticleView";
import { articleFromData } from "../../src/lib/insights-content";

describe("article preview", () => {
  it("sanitizes malicious legacy HTML at the rendering boundary", () => {
    const post = articleFromData({
      slug: "legacy", title: "Legacy", category: "AI", image: "https://example.com/image.jpg",
      bodyHtml: '<p>Safe <strong>formatting</strong></p><img src="https://example.com/image.jpg" onerror="alert(1)"><a href="javascript:alert(1)">link</a><script>alert(1)</script>',
    });
    const html = renderToStaticMarkup(React.createElement(ArticleView, { post }));
    expect(html).toContain("Safe <strong>formatting</strong>");
    expect(html).not.toMatch(/onerror|javascript:|<script/i);
  });
});
