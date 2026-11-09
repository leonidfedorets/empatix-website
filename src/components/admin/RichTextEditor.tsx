"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Heading2, Heading3, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MediaLibrary } from "./MediaLibrary";

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  articleMode = false,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  articleMode?: boolean;
}) {
  const [imagesOpen, setImagesOpen] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false, heading: { levels: [2, 3] } }),
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
        <Button title="Bold" aria-label="Bold" type="button" variant="ghost" size="sm" className={btn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="size-4" />
        </Button>
        <Button title="Italic" aria-label="Italic" type="button" variant="ghost" size="sm" className={btn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="size-4" />
        </Button>
        <Button title="Heading 2" aria-label="Heading 2" type="button" variant="ghost" size="sm" className={btn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="size-4" />
        </Button>
        <Button title="Heading 3" aria-label="Heading 3" type="button" variant="ghost" size="sm" className={btn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="size-4" /></Button>
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
          title="Add image" aria-label="Add image"
          onClick={() => {
            if (articleMode) { setImagesOpen(true); return; }
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
      <Dialog open={imagesOpen} onOpenChange={setImagesOpen}><DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl"><DialogHeader><DialogTitle>Add article image</DialogTitle></DialogHeader><MediaLibrary selectMode articleMode onSelect={url => { editor.chain().focus().setImage({src: url, alt: ""}).run(); setImagesOpen(false); }} /></DialogContent></Dialog>
    </div>
  );
}
