"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import {
  adminListMedia,
  adminUploadMedia,
  adminDeleteMedia,
  adminUpdateMediaAlt,
} from "@/lib/admin/media.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, X, Image as ImageIcon, Copy, Info } from "lucide-react";
import { toast } from "sonner";
import {
  compressImageFile,
  validateImageFile,
  IMAGE_MAX_BYTES,
  IMAGE_MAX_DIMENSION,
} from "@/lib/admin/imageCompress";

export function MediaLibrary({
  selectMode = false,
  onSelect,
}: {
  selectMode?: boolean;
  onSelect?: (url: string) => void;
}) {
  const qc = useQueryClient();
  const list = useServerFn(adminListMedia);
  const upload = useServerFn(adminUploadMedia);
  const del = useServerFn(adminDeleteMedia);
  const updateAlt = useServerFn(adminUpdateMediaAlt);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [filter, setFilter] = useState("");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: () => list(),
  });

  const altMutation = useMutation({
    mutationFn: ({ id, alt }: { id: string; alt: string }) => updateAlt({ data: { id, alt } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Alt text saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const compressed = await compressImageFile(file);
      const fd = new FormData();
      fd.append("file", compressed);
      const saving = (compressed.size < file.size)
        ? ` (-${Math.round((1 - compressed.size / file.size) * 100)}%)`
        : "";
      return { result: await upload({ data: fd }), saving };
    },
    onSuccess: ({ saving }) => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success(`Uploaded${saving}`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const err = validateImageFile(f);
      if (err) {
        toast.error(`${f.name}: ${err.message}`);
        return;
      }
      uploadMutation.mutate(f);
    });
  };

  const filtered = (items as any[]).filter(
    (m) =>
      !filter ||
      (m.alt?.toLowerCase().includes(filter.toLowerCase()) ||
        m.storage_path?.toLowerCase().includes(filter.toLowerCase())),
  );

  return (
    <div className="min-w-0 space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`min-w-0 rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border"
        }`}
      >
        <Upload className="mx-auto mb-2 size-6 text-muted-foreground" />
        <p className="break-words text-sm text-muted-foreground">
          Drag and drop images here, or
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="ml-1 text-primary underline"
          >
            browse
          </button>
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploadMutation.isPending && (
          <p className="mt-2 text-xs text-muted-foreground">Uploading…</p>
        )}
      </div>

      <div className="min-w-0 rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        <div className="mb-1 flex min-w-0 items-center gap-1.5 font-medium text-foreground">
          <Info className="size-3.5 shrink-0" /> <span className="break-words">Image recommendations</span>
        </div>
        <ul className="list-inside list-disc space-y-0.5 break-words">
          <li>Formats: JPG, PNG, WebP, SVG (logos) or GIF</li>
          <li>Max file size: {IMAGE_MAX_BYTES / 1024 / 1024} MB</li>
          <li>Large photos are auto-resized to {IMAGE_MAX_DIMENSION}px on the longest side and re-encoded as WebP</li>
          <li>For case covers use 16:9 (e.g. 1600×900), for logos use transparent PNG/SVG</li>
          <li>Compress before uploading when possible (TinyPNG, Squoosh) — faster site, better SEO</li>
        </ul>
      </div>


      <Input
        placeholder="Filter by name or alt text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="max-w-sm"
      />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No media yet
        </p>
      ) : (
        <div className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((m: any) => (
            <MediaCard
              key={m.id}
              item={m}
              selectMode={selectMode}
              onSelect={onSelect}
              onSaveAlt={(alt) => altMutation.mutate({ id: m.id, alt })}
              onDelete={() => {
                if (confirm("Delete this file?")) deleteMutation.mutate(m.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MediaCard({
  item,
  selectMode,
  onSelect,
  onSaveAlt,
  onDelete,
}: {
  item: any;
  selectMode?: boolean;
  onSelect?: (url: string) => void;
  onSaveAlt: (alt: string) => void;
  onDelete: () => void;
}) {
  const [alt, setAlt] = useState<string>(item.alt ?? "");
  const dirty = alt !== (item.alt ?? "");
  return (
    <div className="group relative min-w-0 overflow-hidden rounded-md border border-border bg-card">
      <div className="aspect-square bg-muted">
        {item.mime?.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.public_url} alt={item.alt ?? ""} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImageIcon className="size-6 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="min-w-0 space-y-2 p-2 text-xs">
        <p className="truncate text-muted-foreground" title={item.storage_path}>
          {item.storage_path.split("/").pop()}
          {item.size_bytes ? ` · ${(item.size_bytes / 1024).toFixed(0)} KB` : ""}
        </p>
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Alt text (SEO)
          </label>
          <Input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Describe the image…"
            maxLength={300}
            className="h-8 text-xs"
          />
          {dirty ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-1 h-7 w-full text-xs"
              onClick={() => onSaveAlt(alt.trim())}
            >
              Save alt
            </Button>
          ) : null}
        </div>
      </div>
      <div className="absolute inset-x-0 top-0 flex justify-end gap-1 p-1 opacity-0 transition-opacity group-hover:opacity-100">
        {selectMode && (
          <Button size="sm" onClick={() => onSelect?.(item.public_url)} className="h-7">
            Select
          </Button>
        )}
        <Button
          size="icon"
          variant="secondary"
          className="h-7 w-7"
          onClick={() => {
            navigator.clipboard.writeText(item.public_url);
            toast.success("URL copied");
          }}
        >
          <Copy className="size-3.5" />
        </Button>
        <Button size="icon" variant="destructive" className="h-7 w-7" onClick={onDelete}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function MediaPickerButton({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const list = useServerFn(adminListMedia);
  const updateAlt = useServerFn(adminUpdateMediaAlt);

  const { data: items = [] } = useQuery({
    queryKey: ["admin", "media"],
    queryFn: () => list(),
  });
  const allItems = items as any[];
  const recent = allItems.slice(0, 8);
  const currentAsset = value ? allItems.find((m) => m.public_url === value) : null;
  const [altDraft, setAltDraft] = useState<string>(currentAsset?.alt ?? "");
  // Resync alt draft when the selected asset changes.
  const currentAltKey = `${currentAsset?.id ?? ""}:${currentAsset?.alt ?? ""}`;
  const [lastAltKey, setLastAltKey] = useState(currentAltKey);
  if (lastAltKey !== currentAltKey) {
    setLastAltKey(currentAltKey);
    setAltDraft(currentAsset?.alt ?? "");
  }

  const altMutation = useMutation({
    mutationFn: ({ id, alt }: { id: string; alt: string }) => updateAlt({ data: { id, alt } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "media"] });
      toast.success("Alt text saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-w-0 space-y-2">
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Image URL"
        />
        <Button type="button" variant="outline" onClick={() => setOpen(true)}>
          Library
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange("")}>
            <X className="size-4" />
          </Button>
        )}
      </div>

      {value && (
        <div className="space-y-2 rounded border border-border p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={currentAsset?.alt ?? ""} className="max-h-40 w-auto rounded" />
          {currentAsset ? (
            <div className="min-w-0">
              <label className="mb-1 block break-words text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Alt text (SEO) — describe the image for screen readers and search engines
              </label>
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2">
                <Input
                  value={altDraft}
                  onChange={(e) => setAltDraft(e.target.value)}
                  placeholder="e.g. Fine Clause AI contract analysis dashboard"
                  maxLength={300}
                  className="h-8 text-xs"
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={altDraft === (currentAsset.alt ?? "") || altMutation.isPending}
                  onClick={() => altMutation.mutate({ id: currentAsset.id, alt: altDraft.trim() })}
                  className="h-8"
                >
                  Save
                </Button>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {currentAsset.size_bytes ? `${(currentAsset.size_bytes / 1024).toFixed(0)} KB · ` : ""}
                {currentAsset.mime ?? ""}
              </p>
            </div>
          ) : (
            <p className="break-words text-[10px] text-muted-foreground">
              External URL — alt text is stored only for images uploaded to your library.
            </p>
          )}
        </div>
      )}

      {recent.length > 0 && (
        <div>
          <p className="mb-1 break-words text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Recent uploads
          </p>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {recent.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onChange(m.public_url)}
                title={m.alt || m.storage_path.split("/").pop()}
                className={`h-14 w-14 shrink-0 overflow-hidden rounded border transition ${
                  value === m.public_url ? "border-brand-sky ring-1 ring-brand-sky" : "border-border hover:border-brand-sky/50"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.public_url} alt={m.alt ?? ""} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/60 p-6"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-5xl rounded-lg border border-border bg-card p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Pick an image</h3>
              <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <MediaLibrary
              selectMode
              onSelect={(url) => {
                onChange(url);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
