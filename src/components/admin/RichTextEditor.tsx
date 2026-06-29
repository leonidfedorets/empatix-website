"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading2, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export function RichTextEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image,
      Placeholder.configure({ placeholder: placeholder ?? "Write…" }),
    ],
    content: value || "",
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    `h-8 px-2 ${active ? "bg-accent text-accent-foreground" : ""}`;

  return (
    <div className="min-w-0 rounded-md border border-input bg-background">
      <div className="flex min-w-0 flex-wrap items-center gap-1 border-b border-input p-1">
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="size-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" className={btn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={btn(editor.isActive("link"))}
          onClick={() => {
            const prev = editor.getAttributes("link").href as string | undefined;
            const url = window.prompt("Link URL", prev ?? "https://");
            if (url === null) return;
            if (url === "") editor.chain().focus().unsetLink().run();
            else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
        >
          <LinkIcon className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => {
            const url = window.prompt("Image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          <ImageIcon className="size-4" />
        </Button>
        <div className="ml-auto flex shrink-0 gap-1">
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => editor.chain().focus().undo().run()}>
            <Undo2 className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="h-8 px-2" onClick={() => editor.chain().focus().redo().run()}>
            <Redo2 className="size-4" />
          </Button>
        </div>
      </div>
      <EditorContent
        editor={editor}
        className="prose prose-sm dark:prose-invert min-h-[160px] max-w-none overflow-hidden break-words p-3 focus:outline-none [&_.ProseMirror]:min-h-[140px] [&_.ProseMirror]:break-words [&_.ProseMirror]:outline-none [&_.ProseMirror_*]:max-w-full"
      />
    </div>
  );
}
