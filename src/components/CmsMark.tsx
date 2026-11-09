import { createElement, type ElementType, type ReactNode } from "react";

/**
 * Marks a block on the public site as CMS-editable.
 * In normal viewing it's a transparent wrapper.
 * When the page is loaded inside the /admin/editor iframe (?cms=1),
 * CmsOverlay turns these into clickable hotspots that open the right editor.
 */
export function CmsMark({
  kind,
  target,
  label,
  as = "div",
  className,
  children,
}: {
  kind: "section" | "collection";
  /** Section key (e.g. "hero") or collection key (e.g. "services") from src/lib/admin/schemas.ts */
  target: string;
  /** Human-readable label shown in the editor panel header */
  label: string;
  as?: ElementType;
  className?: string;
  children: ReactNode;
}) {
  return createElement(
    as,
    {
      className,
      "data-cms-kind": kind,
      "data-cms-target": target,
      "data-cms-label": label,
    },
    children,
  );
}
