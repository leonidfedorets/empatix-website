import { createFileRoute } from "@tanstack/react-router";

/**
 * Public read-only proxy for media files stored in the private `media` bucket.
 * Uses the service role server-side to fetch the file, then streams the bytes
 * back to the browser with a long cache header.
 *
 * Public buckets are blocked at the workspace level, so this proxy is how we
 * expose admin-uploaded media to the public site.
 */
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Bad request", { status: 400 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });
        const contentType = data.type || "application/octet-stream";
        return new Response(data, {
          status: 200,
          headers: {
            "content-type": contentType,
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
