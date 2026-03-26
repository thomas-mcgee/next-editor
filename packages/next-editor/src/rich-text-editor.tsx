"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

const STORAGE_KEY = "ne-admin-theme";

export type UploadImageHandler = (file: File) => Promise<string>;

export type RichTextEditorProps = {
  name: string;
  initialValue?: string;
  placeholder?: string;
  uploadImage?: UploadImageHandler;
  uploadUrl?: string;
  onChange?: (value: string) => void;
  toolbarMode?: "default" | "minimal";
  shellClassName?: string;
  editorClassName?: string;
  loadingClassName?: string;
  statusClassName?: string;
};

type LexxyEditorElement = HTMLElement & {
  value: string;
  focus: () => void;
  contents?: {
    insertHtml: (html: string, options?: { tag?: string }) => void;
  };
};

type LexxyFileAcceptEvent = Event & {
  detail: {
    file: File;
  };
};

export function RichTextEditor({
  name,
  initialValue = "",
  placeholder = "Start writing...",
  uploadImage,
  uploadUrl = "/api/uploads/image",
  onChange,
  toolbarMode = "default",
  shellClassName,
  editorClassName,
  loadingClassName,
  statusClassName,
}: RichTextEditorProps) {
  const editorRef = useRef<LexxyEditorElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState<string>();
  const [html, setHtml] = useState(initialValue);
  const resolvedTheme = useResolvedNeTheme();
  const themeStyle = useMemo<CSSProperties>(
    () => ({
      colorScheme: resolvedTheme,
      color: "var(--ne-fg, var(--foreground, var(--lexxy-color-ink)))",
      backgroundColor:
        "var(--ne-surface, var(--surface, var(--lexxy-color-canvas)))",
      ["--lexxy-color-canvas" as string]:
        "var(--ne-surface, var(--surface, var(--lexxy-color-ink-inverted)))",
      ["--lexxy-color-text" as string]:
        "var(--ne-fg, var(--foreground, var(--lexxy-color-ink)))",
      ["--lexxy-color-ink" as string]:
        "var(--ne-fg, var(--foreground, oklch(20% 0 0)))",
      ["--lexxy-color-ink-inverted" as string]:
        "var(--ne-bg, var(--background, white))",
      ["--lexxy-color-ink-medium" as string]:
        "var(--ne-muted, var(--muted, oklch(40% 0 0)))",
      ["--lexxy-color-ink-lighter" as string]:
        "var(--ne-border-strong, var(--border-strong, oklch(85% 0 0)))",
      ["--lexxy-color-ink-lightest" as string]:
        "var(--ne-surface-muted, var(--surface-muted, oklch(96% 0 0)))",
      ["--lexxy-color-table-header-bg" as string]:
        "var(--ne-surface-muted, var(--surface-muted, var(--lexxy-color-ink-lightest)))",
      ["--lexxy-shadow" as string]: "var(--ne-shadow-soft, 0 2px 8px rgba(0, 0, 0, 0.1))",
    }),
    [resolvedTheme],
  );

  useEffect(() => {
    let isMounted = true;

    void import("@37signals/lexxy").then(() => {
      if (isMounted) {
        setIsReady(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    editor.value = initialValue;
    setHtml(initialValue);

    const handleFileAccept = async (event: Event) => {
      const customEvent = event as LexxyFileAcceptEvent;
      const file = customEvent.detail.file;

      customEvent.preventDefault();

      if (!file.type.startsWith("image/")) {
        setMessage("Only image uploads are supported.");
        return;
      }

      try {
        setMessage(`Uploading ${file.name}...`);

        const url = uploadImage
          ? await uploadImage(file)
          : await uploadEditorImage(file, uploadUrl);

        editor.focus();
        editor.contents?.insertHtml(
          `<img src="${escapeAttribute(url)}" alt="${escapeAttribute(file.name)}">`,
        );
        setMessage(undefined);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Image upload failed.",
        );
      }
    };

    const handleChange = () => {
      const nextValue = editor.value;
      setHtml(nextValue);
      onChange?.(nextValue);
      setMessage(undefined);
    };

    editor.addEventListener("lexxy:file-accept", handleFileAccept);
    editor.addEventListener("lexxy:change", handleChange);

    return () => {
      editor.removeEventListener("lexxy:file-accept", handleFileAccept);
      editor.removeEventListener("lexxy:change", handleChange);
    };
  }, [initialValue, isReady, onChange, uploadImage, uploadUrl]);

  return (
    <div
      className={joinClassNames(
        "next-editor-lexxy",
        toolbarMode === "minimal" ? "next-editor-lexxy--minimal" : undefined,
        shellClassName,
      )}
      style={themeStyle}
    >
      <input type="hidden" name={name} value={html} />
      {isReady ? (
        <lexxy-editor
          ref={editorRef}
          className={joinClassNames(
            "next-editor-lexxy__editor",
            editorClassName,
          )}
          placeholder={placeholder}
        />
      ) : (
        <div
          className={joinClassNames(
            "next-editor-lexxy__loading",
            loadingClassName,
          )}
        >
          Loading editor...
        </div>
      )}
      {message ? (
        <p
          className={joinClassNames("next-editor-lexxy__status", statusClassName)}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

export async function uploadEditorImage(file: File, uploadUrl: string) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const result = (await response.json()) as {
    ok: boolean;
    url?: string;
    error?: string;
  };

  if (!response.ok || !result.ok || !result.url) {
    throw new Error(result.error ?? "Image upload failed.");
  }

  return result.url;
}

function escapeAttribute(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

function useResolvedNeTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const configured =
        stored === "light" || stored === "dark" || stored === "system"
          ? stored
          : document.documentElement.dataset.neTheme;
      const nextTheme =
        configured === "dark" || (configured === "system" && media.matches)
          ? "dark"
          : "light";
      setTheme(nextTheme);
    };

    syncTheme();

    media.addEventListener("change", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      media.removeEventListener("change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  return theme;
}
