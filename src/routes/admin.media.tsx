import { createFileRoute } from "@tanstack/react-router";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export const Route = createFileRoute("/admin/media")({
  ssr: false,
  component: MediaPage,
});

function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Media Library</h1>
        <p className="text-sm text-muted-foreground">
          Upload and manage images used across the public site.
        </p>
      </div>
      <MediaLibrary />
    </div>
  );
}
