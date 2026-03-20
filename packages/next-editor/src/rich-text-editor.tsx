"use client";

import { useEffect, useRef, useState } from "react";

export type UploadImageHandler = (file: File) => Promise<string>;

export type RichTextEditorProps = {
  name: string;
  initialValue?: string;
  placeholder?: string;
  uploadImage?: UploadImageHandler;
  uploadUrl?: string;
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
  shellClassName,
  editorClassName,
  loadingClassName,
  statusClassName,
}: RichTextEditorProps) {
  const editorRef = useRef<LexxyEditorElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [message, setMessage] = useState<string>();
  const [html, setHtml] = useState(initialValue);

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
      setHtml(editor.value);
      setMessage(undefined);
    };

    editor.addEventListener("lexxy:file-accept", handleFileAccept);
    editor.addEventListener("lexxy:change", handleChange);

    return () => {
      editor.removeEventListener("lexxy:file-accept", handleFileAccept);
      editor.removeEventListener("lexxy:change", handleChange);
    };
  }, [initialValue, isReady, uploadImage, uploadUrl]);

  return (
    <div className={joinClassNames("next-editor-lexxy", shellClassName)}>
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
