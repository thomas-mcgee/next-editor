"use client";

import type { CSSProperties, DragEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { useEditor } from "./editor-context";
import { useEditorThemeVars } from "./editor-theme";
import { RichTextEditor } from "./rich-text-editor";
import type { FieldDefinition } from "./types";

function ImageUploadControl({
  fieldId,
  currentValue,
  uploadUrl,
}: {
  fieldId: string;
  currentValue: string;
  uploadUrl: string | undefined;
}) {
  const { setFieldValue } = useEditor();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }
    if (!uploadUrl) {
      setError("No upload URL configured.");
      return;
    }
    setIsUploading(true);
    setError(undefined);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(uploadUrl, { method: "POST", body: formData });
      const result = (await response.json()) as { ok: boolean; url?: string; error?: string };
      if (!response.ok || !result.ok || !result.url) {
        setError(result.error ?? "Upload failed.");
        return;
      }
      setFieldValue(fieldId, result.url);
    } catch {
      setError("Upload failed. Check your connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files[0];
    if (file) void handleFile(file);
  };

  const dropZoneStyle: CSSProperties = {
    border: `2px dashed ${isDragging ? "var(--foreground, #18181b)" : "var(--border-strong, #d4d4d8)"}`,
    borderRadius: 10,
    padding: "20px 12px",
    textAlign: "center",
    cursor: uploadUrl ? "pointer" : "default",
    background: isDragging ? "var(--surface-muted, #f4f4f5)" : "var(--surface, #ffffff)",
    transition: "border-color 150ms ease, background 150ms ease",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {currentValue ? (
        <div style={{ position: "relative", borderRadius: 8, overflow: "hidden", height: 120 }}>
          <img
            src={currentValue}
            alt="Current image"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <button
            type="button"
            onClick={() => setFieldValue(fieldId, "")}
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              border: "1px solid rgba(255,255,255,0.5)",
              borderRadius: 6,
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 8px",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      ) : null}

      <div
        style={dropZoneStyle}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => uploadUrl && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = "";
          }}
        />
        {isUploading ? (
          <p style={{ fontSize: 13, color: "var(--muted, #71717a)", margin: 0 }}>Uploading…</p>
        ) : uploadUrl ? (
          <>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground, #18181b)", margin: "0 0 2px" }}>
              Drop an image or click to select
            </p>
            <p style={{ fontSize: 11, color: "var(--muted, #71717a)", margin: 0 }}>
              JPG, PNG, WebP, GIF, AVIF
            </p>
          </>
        ) : (
          <p style={{ fontSize: 12, color: "var(--muted, #71717a)", margin: 0 }}>
            No upload URL configured — use the URL field below.
          </p>
        )}
      </div>

      {error ? (
        <p style={{ fontSize: 12, color: "#dc2626", margin: 0 }}>{error}</p>
      ) : null}

      <input
        type="text"
        value={String(currentValue ?? "")}
        onChange={(e) => setFieldValue(fieldId, e.target.value)}
        placeholder="Or paste an image URL…"
        style={inputStyle()}
      />
    </div>
  );
}

function FieldControl({ field }: { field: FieldDefinition }) {
  const { activeFieldId, getFieldValue, imageUploadUrl, registerFieldRef, setFieldValue } =
    useEditor();
  const ref = useRef<HTMLDivElement>(null);
  const currentValue = getFieldValue(field.id);
  const active = activeFieldId === field.id;

  useEffect(() => {
    registerFieldRef(field.id, ref.current);
    return () => registerFieldRef(field.id, null);
  }, [field.id, registerFieldRef]);

  return (
    <div
      ref={ref}
      style={{
        borderRadius: 12,
        border: `1px solid ${
          active ? "var(--foreground, #18181b)" : "var(--border-strong, #e4e4e7)"
        }`,
        background: active
          ? "var(--surface-elevated, #fafafa)"
          : "var(--surface, #ffffff)",
        padding: 16,
        transition: "border-color 160ms ease, background 160ms ease",
      }}
    >
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--foreground, #18181b)",
            }}
          >
            {field.label}
          </label>
          {field.description ? (
            <p
              style={{
                marginTop: 4,
                fontSize: 12,
                lineHeight: 1.6,
                color: "var(--muted, #71717a)",
              }}
            >
              {field.description}
            </p>
          ) : null}
        </div>
        <span
          style={{
            fontSize: 11,
            color: "var(--muted, #a1a1aa)",
          }}
        >
          {formatFieldType(field.type)}
        </span>
      </div>

      {field.type === "textarea" ? (
        <textarea
          value={String(currentValue ?? "")}
          onChange={(event) => setFieldValue(field.id, event.target.value)}
          style={inputStyle({ minHeight: 112 })}
        />
      ) : null}

      {field.type === "richtext" ? (
        <RichTextEditor
          name={field.id}
          initialValue={String(currentValue ?? "")}
          placeholder={field.placeholder ?? "Start writing..."}
          toolbarMode="minimal"
          onChange={(nextValue) => setFieldValue(field.id, nextValue)}
          shellClassName="next-editor-sidebar-richtext"
          editorClassName="next-editor-sidebar-richtext__editor"
          loadingClassName="next-editor-sidebar-richtext__loading"
          statusClassName="next-editor-sidebar-richtext__status"
        />
      ) : null}

      {field.type === "embed" ? (
        <textarea
          value={String(currentValue ?? "")}
          onChange={(event) => setFieldValue(field.id, event.target.value)}
          style={inputStyle({ minHeight: 160 })}
        />
      ) : null}

      {field.type === "text" || field.type === "slug" || field.type === "dateTime" ? (
        <input
          type={field.type === "dateTime" ? "datetime-local" : "text"}
          value={String(currentValue ?? "")}
          onChange={(event) => setFieldValue(field.id, event.target.value)}
          style={inputStyle()}
        />
      ) : null}

      {field.type === "image" ? (
        <ImageUploadControl
          fieldId={field.id}
          currentValue={String(currentValue ?? "")}
          uploadUrl={imageUploadUrl}
        />
      ) : null}

      {field.type === "toggle" ? (
        <button
          type="button"
          onClick={() => setFieldValue(field.id, !Boolean(currentValue))}
          style={{
            border: 0,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 500,
            background: currentValue
              ? "var(--foreground, #18181b)"
              : "var(--surface-muted, #f4f4f5)",
            color: currentValue
              ? "var(--background, #ffffff)"
              : "var(--foreground, #3f3f46)",
            cursor: "pointer",
          }}
        >
          {currentValue ? "Enabled" : "Disabled"}
        </button>
      ) : null}

      {field.type === "select" ? (
        <select
          value={String(currentValue ?? "")}
          onChange={(event) => setFieldValue(field.id, event.target.value)}
          style={inputStyle()}
        >
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

export function EditorSidebar() {
  const {
    activeFieldId,
    attemptExitEditMode,
    isDirty,
    isEditing,
    isSaving,
    page,
    saveChanges,
  } = useEditor();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(page.sections.map((section) => [section.id, false])),
  );
  const themeVars = useEditorThemeVars();

  useEffect(() => {
    setOpenSections(
      Object.fromEntries(page.sections.map((section) => [section.id, false])),
    );
  }, [page.sections]);

  useEffect(() => {
    if (!activeFieldId) {
      return;
    }

    const matchingField = page.sections
      .flatMap((section) => section.fields)
      .find((field) => field.id === activeFieldId);

    if (!matchingField?.sectionId) {
      return;
    }

    setOpenSections((current) => ({
      ...current,
      [matchingField.sectionId as string]: true,
    }));
  }, [activeFieldId, page.sections]);

  const handleSave = async () => {
    await saveChanges();
  };

  const setAllSections = (open: boolean) => {
    setOpenSections(
      Object.fromEntries(page.sections.map((section) => [section.id, open])),
    );
  };

  return (
    <aside
      style={{
        ...themeVars,
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 40,
        height: "100vh",
        width: "100%",
        maxWidth: 420,
        borderRight: "1px solid var(--border-strong, #e4e4e7)",
        background: "var(--surface, #faf8f4)",
        color: "var(--foreground, #18181b)",
        boxShadow: "var(--shadow-heavy, 0 28px 80px rgba(24,24,27,0.18))",
        transform: isEditing ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 220ms ease",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            borderBottom: "1px solid var(--border-strong, #e4e4e7)",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: 18,
                  lineHeight: 1.2,
                  fontWeight: 600,
                  color: "var(--foreground, #18181b)",
                }}
              >
                {page.label}
              </h2>
              <p
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  color: "var(--muted, #71717a)",
                }}
              >
                {isDirty ? "Unsaved changes" : "All changes saved"}
              </p>
            </div>
            <button
              type="button"
              onClick={attemptExitEditMode}
              style={secondaryButtonStyle}
            >
              Close
            </button>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 8,
              marginTop: 16,
            }}
          >
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                ...primaryButtonStyle,
                background: isSaving
                  ? "var(--muted, #a1a1aa)"
                  : "var(--foreground, #18181b)",
                color: "var(--background, #ffffff)",
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setAllSections(true)}
              style={secondaryButtonStyle}
            >
              Open All
            </button>
            <button
              type="button"
              onClick={() => setAllSections(false)}
              style={secondaryButtonStyle}
            >
              Close All
            </button>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 14px",
          }}
        >
          {page.sections.map((section) => {
            const isOpen = openSections[section.id];
            return (
              <div
                key={section.id}
                style={{
                  marginBottom: 12,
                  borderRadius: 12,
                  border: "1px solid var(--border-strong, #e4e4e7)",
                  background: "var(--surface-muted, #ffffff)",
                  overflow: "hidden",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenSections((current) => ({
                      ...current,
                      [section.id]: !current[section.id],
                    }))
                  }
                  style={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    textAlign: "left",
                    border: 0,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--foreground, #52525b)",
                    }}
                  >
                    {section.label}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "var(--muted, #a1a1aa)",
                    }}
                  >
                    {isOpen ? "Hide" : "Show"}
                  </span>
                </button>
                {isOpen ? (
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                      borderTop: "1px solid var(--border-strong, #e4e4e7)",
                      padding: 14,
                    }}
                  >
                    {section.fields.map((field) => (
                      <FieldControl key={field.id} field={field} />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    width: "100%",
    borderRadius: 10,
    border: "1px solid var(--border-strong, #d4d4d8)",
    background: "var(--surface, #ffffff)",
    padding: "10px 12px",
    fontSize: 14,
    color: "var(--foreground, #18181b)",
    outline: "none",
    ...extra,
  };
}

const primaryButtonStyle: CSSProperties = {
  display: "inline-flex",
  border: 0,
  borderRadius: 10,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
};

const secondaryButtonStyle: CSSProperties = {
  borderRadius: 10,
  border: "1px solid var(--border-strong, #d4d4d8)",
  background: "var(--surface, #ffffff)",
  padding: "8px 12px",
  fontSize: 14,
  fontWeight: 500,
  color: "var(--foreground, #3f3f46)",
  cursor: "pointer",
};

function formatFieldType(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
