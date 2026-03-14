"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import FileHandler from "@tiptap/extension-file-handler";

type RichTextEditorProps = {
  name: string;
  initialValue?: string;
  placeholder?: string;
};

export function RichTextEditor({
  name,
  initialValue = "",
  placeholder = "Start writing...",
}: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>();
  const [html, setHtml] = useState(initialValue);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const insertImageFromUrl = () => {
    const url = window.prompt("Image URL");
    if (!url) {
      return;
    }

    editor?.chain().focus().setImage({ src: url }).run();
  };

  const uploadImageFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/uploads/image", {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as { ok: boolean; url?: string; error?: string };
    if (!response.ok || !result.ok || !result.url) {
      throw new Error(result.error ?? "Image upload failed.");
    }

    return result.url;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const file = Array.from(files)[0];
    if (!file) {
      return;
    }

    try {
      setMessage("Uploading image...");
      const url = await uploadImageFile(file);
      editor?.chain().focus().setImage({ src: url }).run();
      setMessage(undefined);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Uploads are unavailable until B2 is configured.",
      );
    }
  };

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      FileHandler.configure({
        allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
        onDrop: (_editor, files) => {
          void handleFiles(files);
        },
        onPaste: (_editor, files) => {
          void handleFiles(files);
        },
      }),
    ],
    content: initialValue,
    onUpdate: ({ editor: currentEditor }) => {
      setHtml(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "demo-richtext-editor",
      },
    },
  });

  const setLink = () => {
    const previousUrl = editor?.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "");

    if (url === null) {
      return;
    }

    if (url === "") {
      editor?.chain().focus().unsetLink().run();
      return;
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const basicToolbarItems: Array<{
    label: string;
    action: () => void;
    active?: boolean;
    disabled?: boolean;
  }> = [
    {
      label: "Bold",
      action: () => editor?.chain().focus().toggleBold().run(),
      active: editor?.isActive("bold"),
    },
    {
      label: "Italic",
      action: () => editor?.chain().focus().toggleItalic().run(),
      active: editor?.isActive("italic"),
    },
    {
      label: "Bullet List",
      action: () => editor?.chain().focus().toggleBulletList().run(),
      active: editor?.isActive("bulletList"),
    },
    {
      label: "Numbered List",
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      active: editor?.isActive("orderedList"),
    },
    {
      label: "Blockquote",
      action: () => editor?.chain().focus().toggleBlockquote().run(),
      active: editor?.isActive("blockquote"),
    },
    {
      label: "Link",
      action: setLink,
      active: editor?.isActive("link"),
    },
    {
      label: "Image URL",
      action: insertImageFromUrl,
    },
  ];

  const advancedToolbarItems: Array<{
    label: string;
    action: () => void;
    active?: boolean;
    disabled?: boolean;
  }> = [
    {
      label: "Paragraph",
      action: () => editor?.chain().focus().setParagraph().run(),
      active: editor?.isActive("paragraph"),
    },
    {
      label: "H1",
      action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor?.isActive("heading", { level: 1 }),
    },
    {
      label: "H2",
      action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor?.isActive("heading", { level: 2 }),
    },
    {
      label: "H3",
      action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
      active: editor?.isActive("heading", { level: 3 }),
    },
    {
      label: "Strike",
      action: () => editor?.chain().focus().toggleStrike().run(),
      active: editor?.isActive("strike"),
    },
    {
      label: "Code",
      action: () => editor?.chain().focus().toggleCode().run(),
      active: editor?.isActive("code"),
    },
    {
      label: "Code Block",
      action: () => editor?.chain().focus().toggleCodeBlock().run(),
      active: editor?.isActive("codeBlock"),
    },
    {
      label: "Divider",
      action: () => editor?.chain().focus().setHorizontalRule().run(),
    },
    {
      label: "Line Break",
      action: () => editor?.chain().focus().setHardBreak().run(),
    },
    {
      label: "Remove Link",
      action: () => editor?.chain().focus().unsetLink().run(),
      disabled: !editor?.isActive("link"),
    },
    {
      label: "Clear Inline Formatting",
      action: () => editor?.chain().focus().unsetAllMarks().run(),
    },
    {
      label: "Clear Block Formatting",
      action: () => editor?.chain().focus().clearNodes().run(),
    },
    {
      label: "Undo",
      action: () => editor?.chain().focus().undo().run(),
      disabled: !editor?.can().chain().focus().undo().run(),
    },
    {
      label: "Redo",
      action: () => editor?.chain().focus().redo().run(),
      disabled: !editor?.can().chain().focus().redo().run(),
    },
  ];

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          border: "1px solid var(--border-strong)",
          borderBottom: 0,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          background: "var(--surface)",
          padding: 10,
        }}
      >
        {basicToolbarItems.map(({ label, action, active, disabled }) => (
          <button
            key={label}
            type="button"
            onClick={action}
            disabled={disabled}
            style={toolbarButtonStyle(Boolean(active), Boolean(disabled))}
          >
            {label}
          </button>
        ))}
        {showAdvanced
          ? advancedToolbarItems.map(({ label, action, active, disabled }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                disabled={disabled}
                style={toolbarButtonStyle(Boolean(active), Boolean(disabled))}
              >
                {label}
              </button>
            ))
          : null}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          style={toolbarButtonStyle(false, false)}
        >
          Upload Image
        </button>
        <button
          type="button"
          onClick={() => setShowAdvanced((current) => !current)}
          style={toolbarButtonStyle(showAdvanced, false, true)}
        >
          {showAdvanced ? "Hide Advanced" : "Show Advanced"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            if (event.target.files) {
              void handleFiles(event.target.files);
              event.target.value = "";
            }
          }}
        />
      </div>
      <div
        style={{
          border: "1px solid var(--border-strong)",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          background: "var(--surface)",
          padding: 16,
        }}
      >
        <EditorContent editor={editor} />
      </div>
      <p className="mt-3 text-sm" style={{ color: "var(--muted)" }}>
        Supports basic rich text plus image URLs now. File upload is wired to an
        app endpoint and will work once B2 is configured.
      </p>
      {message ? (
        <p
          className="mt-3 rounded-xl px-4 py-3 text-sm"
          style={{
            background: "var(--surface-muted)",
            color: "var(--foreground)",
            border: "1px solid var(--border-strong)",
          }}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

function toolbarButtonStyle(
  active: boolean,
  disabled: boolean,
  invertWhenActive = false,
) {
  const isInverted = invertWhenActive && active;

  return {
    border: "1px solid var(--border-strong)",
    borderRadius: 10,
    background: isInverted
      ? "var(--foreground)"
      : active
        ? "var(--surface-muted)"
        : "transparent",
    color: disabled
      ? "var(--muted)"
      : isInverted
        ? "var(--background)"
        : "var(--foreground)",
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 600,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
  } as const;
}
