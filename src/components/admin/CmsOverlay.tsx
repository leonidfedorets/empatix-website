import { useEffect } from "react";
import { cmsPreviewStore } from "@/lib/cms/previewStore";

/**
 * Mounted globally in __root. Activates only when the page is loaded inside
 * the admin editor iframe (URL has ?cms=1). Adds hover outlines on every
 * [data-cms-kind] element and forwards clicks to the parent admin window.
 *
 * Also disables in-page navigation while editing so clicking a link inside
 * a card opens the editor instead of navigating away.
 */
export function CmsOverlay() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("cms") !== "1") return;
    if (window.parent === window) return; // not in iframe

    const styleEl = document.createElement("style");
    styleEl.textContent = `
      [data-cms-kind] { position: relative; outline-offset: 2px; cursor: pointer; }
      [data-cms-kind]:hover { outline: 2px dashed hsl(217 91% 60% / .9); }
      [data-cms-kind][data-cms-hover]::before {
        content: attr(data-cms-label);
        position: absolute; top: 0; left: 0; transform: translateY(-100%);
        background: hsl(217 91% 60%); color: white; padding: 2px 8px;
        font-size: 11px; font-weight: 600; letter-spacing: .02em;
        border-radius: 4px 4px 0 0; pointer-events: none; z-index: 9999;
        font-family: ui-sans-serif, system-ui, sans-serif;
      }
      html[data-cms-editing] { overflow-x: hidden; }
    `;
    document.head.appendChild(styleEl);
    document.documentElement.setAttribute("data-cms-editing", "1");

    const findMark = (el: EventTarget | null): HTMLElement | null => {
      let node = el as HTMLElement | null;
      while (node && node !== document.body) {
        if (node.dataset && node.dataset.cmsIgnore != null) return null;
        if (node.dataset && node.dataset.cmsKind) return node;
        node = node.parentElement;
      }
      return null;
    };

    const onOver = (e: MouseEvent) => {
      const mark = findMark(e.target);
      if (mark) mark.setAttribute("data-cms-hover", "1");
    };
    const onOut = (e: MouseEvent) => {
      const mark = findMark(e.target);
      if (mark) mark.removeAttribute("data-cms-hover");
    };
    const onClick = (e: MouseEvent) => {
      const mark = findMark(e.target);
      if (!mark) return;
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage(
        {
          source: "empatix-cms",
          type: "select",
          kind: mark.dataset.cmsKind,
          target: mark.dataset.cmsTarget,
          label: mark.dataset.cmsLabel,
        },
        window.location.origin,
      );
    };

    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("mouseout", onOut, true);
    document.addEventListener("click", onClick, true);

    // Receive live-preview updates from the admin editor while the user is
    // typing. Nothing here touches the network — the store just overlays
    // values on top of the React Query cache.
    const onPreview = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const m: any = e.data;
      if (!m || m.source !== "empatix-cms-preview") return;
      if (m.type === "section") cmsPreviewStore.setSection(m.key, m.data ?? null);
      else if (m.type === "collection") cmsPreviewStore.setCollection(m.key, m.rows ?? null);
      else if (m.type === "clear-section") cmsPreviewStore.clearSection(m.key);
      else if (m.type === "clear-collection") cmsPreviewStore.clearCollection(m.key);
      else if (m.type === "clear-all") cmsPreviewStore.clearAll();
    };
    window.addEventListener("message", onPreview);

    // Announce ready so parent can show overlay UI.
    window.parent.postMessage(
      { source: "empatix-cms", type: "ready", path: window.location.pathname },
      window.location.origin,
    );

    return () => {
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("mouseout", onOut, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("message", onPreview);
      document.documentElement.removeAttribute("data-cms-editing");
      cmsPreviewStore.clearAll();
      styleEl.remove();
    };
  }, []);

  return null;
}
