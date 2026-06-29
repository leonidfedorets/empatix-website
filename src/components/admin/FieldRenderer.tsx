"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "./RichTextEditor";
import { MediaPickerButton } from "./MediaLibrary";
import { IconPicker } from "./IconPicker";
import type { FieldDef } from "@/lib/admin/schemas";
import { SYSTEM_URLS } from "@/lib/admin/systemUrls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatItem = { value: string; label: string };

function StatsField({ value, onChange }: { value: any; onChange: (v: StatItem[]) => void }) {
  const items: StatItem[] = Array.isArray(value)
    ? value.map((s: any) => ({ value: String(s?.value ?? ""), label: String(s?.label ?? "") }))
    : [];
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const update = (i: number, patch: Partial<StatItem>) => {
    const next = items.slice();
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };
  const remove = (i: number) => {
    const next = items.slice();
    next.splice(i, 1);
    onChange(next);
  };
  const add = () => onChange([...items, { value: "", label: "" }]);
  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return;
    const next = items.slice();
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };

  return (
    <div className="min-w-0 space-y-2">
      <ul className="min-w-0 space-y-2">
        {items.map((it, i) => (
          <li
            key={i}
            draggable
            onDragStart={(e) => {
              setDragIdx(i);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (overIdx !== i) setOverIdx(i);
            }}
            onDragLeave={() => {
              if (overIdx === i) setOverIdx(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIdx !== null) move(dragIdx, i);
              setDragIdx(null);
              setOverIdx(null);
            }}
            onDragEnd={() => {
              setDragIdx(null);
              setOverIdx(null);
            }}
            className={`grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-2 rounded-md border bg-background p-2 transition ${
              dragIdx === i ? "opacity-40" : ""
            } ${overIdx === i && dragIdx !== i ? "border-brand-sky" : "border-border"}`}
          >
            <span
              className="mt-2 shrink-0 cursor-grab text-muted-foreground hover:text-foreground active:cursor-grabbing"
              title="Drag to reorder"
              aria-hidden
            >
              <GripVertical className="size-4" />
            </span>
            <div className="grid min-w-0 gap-2 sm:grid-cols-2">
              <Input
                value={it.value}
                placeholder="Value (e.g. 10+ yrs)"
                onChange={(e) => update(i, { value: e.target.value })}
              />
              <Input
                value={it.label}
                placeholder="Label (e.g. IoT & M2M)"
                onChange={(e) => update(i, { label: e.target.value })}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(i)}
              title="Remove stat"
            >
              <Trash2 className="size-4" />
            </Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="mr-1 size-4" /> Add stat
      </Button>
    </div>
  );
}


export function FieldRenderer({
  field,
  value,
  onChange,
  suggestions,
}: {
  field: FieldDef;
  value: any;
  onChange: (v: any) => void;
  suggestions?: string[];
}) {
  const id = `field-${field.key}`;
  const v = value ?? "";
  const listId = suggestions && suggestions.length > 0 ? `${id}-suggestions` : undefined;

  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id} className="break-words">{field.label}</Label>
      {field.type === "url" ? (
        <div className="min-w-0 space-y-2">
          <Input
            id={id}
            value={v}
            placeholder={field.placeholder ?? "https://… or /path"}
            onChange={(e) => onChange(e.target.value)}
          />
          <Select
            value={SYSTEM_URLS.some((u) => u.value === v) ? v : ""}
            onValueChange={(val) => onChange(val)}
          >
          <SelectTrigger className="h-9 min-w-0 text-xs">
              <SelectValue placeholder="Or pick an existing page…" />
            </SelectTrigger>
            <SelectContent>
              {SYSTEM_URLS.map((u) => (
                <SelectItem key={u.value} value={u.value}>
                  {u.label} <span className="text-muted-foreground">— {u.value}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : field.type === "text" ? (
        <>
          <Input
            id={id}
            value={v}
            placeholder={field.placeholder}
            list={listId}
            onChange={(e) => onChange(e.target.value)}
          />
          {listId && (
            <datalist id={listId}>
              {suggestions!.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </>
      ) : field.type === "textarea" ? (
        <Textarea
          id={id}
          value={v}
          placeholder={field.placeholder}
          rows={5}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : field.type === "number" ? (
        <Input
          id={id}
          type="number"
          value={v}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      ) : field.type === "boolean" ? (
        <Switch checked={!!value} onCheckedChange={onChange} />
      ) : field.type === "richtext" ? (
        <RichTextEditor value={v} onChange={onChange} placeholder={field.placeholder} />
      ) : field.type === "image" ? (
        <MediaPickerButton value={v} onChange={onChange} />
      ) : field.type === "icon" ? (
        <IconPicker value={v} onChange={onChange} />
      ) : field.type === "stats" ? (
        <StatsField value={value} onChange={onChange} />
      ) : null}
      {field.help && <p className="break-words text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}
