"use client";

import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type ReactNode,
} from "react";
import { RichTextEditor } from "../rich-text-editor";
import type {
  CollectionDefinition,
  CollectionEntryRecord,
  CollectionFieldDefinition,
  CollectionStatus,
} from "../types";

type Props = {
  collection: CollectionDefinition;
  entry?: CollectionEntryRecord | null;
  saveAction: (formData: FormData) => Promise<void>;
};

export function NeCollectionEntryForm({ collection, entry, saveAction }: Props) {
  const isIncoming = collection.mode === "incoming";
  const statusOptions = getStatusOptions(collection);
  const [activeTab, setActiveTab] = useState<"content" | "publication">("content");
  const [status, setStatus] = useState<CollectionStatus>(
    entry?.status ?? collection.incoming?.defaultStatus ?? statusOptions[0]?.value ?? "draft",
  );
  const [slug, setSlug] = useState(entry?.slug ?? "");
  const [publishedAt, setPublishedAt] = useState(formatDateTimeLocal(entry?.publishedAt));
  const [values, setValues] = useState<Record<string, unknown>>(entry?.values ?? {});

  const title = useMemo(() => {
    if (collection.useAsTitle) {
      const candidate = getStringValue(values[collection.useAsTitle]);
      if (candidate) return candidate;
    }
    return (isIncoming ? entry?.entryId : slug) || entry?.entryId || `New ${collection.singularLabel ?? collection.label}`;
  }, [collection.label, collection.singularLabel, collection.useAsTitle, entry?.entryId, isIncoming, slug, values]);

  return (
    <section>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--ne-fg)" }}>
            {entry ? title : `New ${collection.singularLabel ?? collection.label}`}
          </h2>
          <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--ne-muted)", maxWidth: 620 }}>
            {collection.description ?? `Manage ${collection.label.toLowerCase()} content with a collection-specific schema.`}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "inline-flex",
          gap: 6,
          marginTop: 24,
          borderRadius: 12,
          border: "1px solid var(--ne-border-strong)",
          background: "var(--ne-surface)",
          padding: 4,
        }}
      >
        <TabButton active={activeTab === "content"} label="Content" onClick={() => setActiveTab("content")} />
        <TabButton
          active={activeTab === "publication"}
          label={isIncoming ? "Workflow" : "Publication"}
          onClick={() => setActiveTab("publication")}
        />
      </div>

      <form action={saveAction} style={{ marginTop: 24, display: "grid", gap: 18, maxWidth: 900 }}>
        <input type="hidden" name="collectionId" value={collection.id} />
        <input type="hidden" name="collectionMode" value={collection.mode ?? ""} />
        <input type="hidden" name="allowedStatuses" value={JSON.stringify(statusOptions.map((option) => option.value))} />
        <input type="hidden" name="entryId" value={entry?.entryId ?? ""} />
        <input type="hidden" name="status" value={status} />
        <input type="hidden" name="slug" value={slug} />
        <input type="hidden" name="publishedAt" value={publishedAt} />
        <input type="hidden" name="values" value={JSON.stringify(values)} />

        {activeTab === "content" ? (
          collection.sections.map((section) => (
            <div
              key={section.id}
              style={{
                borderRadius: 14,
                border: "1px solid var(--ne-border-strong)",
                background: "var(--ne-surface)",
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)" }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--ne-fg)" }}>{section.label}</h3>
              </div>
              <div style={{ display: "grid", gap: 16, padding: 16 }}>
                {section.fields.map((field) => (
                  <FieldControl
                    key={field.id}
                    field={field}
                    value={values[field.id]}
                    onChange={(nextValue) => {
                      setValues((current) => ({
                        ...current,
                        [field.id]: nextValue,
                      }));
                    }}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              borderRadius: 14,
              border: "1px solid var(--ne-border-strong)",
              background: "var(--ne-surface)",
              padding: 16,
              display: "grid",
              gap: 16,
              maxWidth: 560,
            }}
          >
            <FieldShell label="Status">
              <select value={status} onChange={(event) => setStatus(event.target.value as CollectionStatus)} style={inputStyle()}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FieldShell>

            {isIncoming ? (
              <>
                <FieldShell label="Entry ID">
                  <input
                    type="text"
                    value={entry?.entryId ?? "Will be generated automatically"}
                    readOnly
                    style={inputStyle({ color: "var(--ne-muted)" })}
                  />
                </FieldShell>

                <FieldShell label="Submitted">
                  <input
                    type="text"
                    value={entry ? formatDateTimeDisplay(entry.createdAt) : "Created when a visitor submits the form"}
                    readOnly
                    style={inputStyle({ color: "var(--ne-muted)" })}
                  />
                </FieldShell>
              </>
            ) : (
              <>
                <FieldShell label="Slug">
                  <input type="text" value={slug} onChange={(event) => setSlug(event.target.value)} style={inputStyle()} />
                </FieldShell>

                <FieldShell label={status === "scheduled" ? "Scheduled for" : "Publish date & time"}>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(event) => setPublishedAt(event.target.value)}
                    style={inputStyle()}
                  />
                </FieldShell>
              </>
            )}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="submit"
            style={{ borderRadius: 10, border: 0, background: "var(--ne-fg)", color: "var(--ne-bg)", padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            {isIncoming ? "Update Submission" : `Save ${collection.singularLabel ?? collection.label}`}
          </button>
          <a href={`/admin/collections/${collection.id}`} style={{ fontSize: 13, color: "var(--ne-muted)", textDecoration: "none" }}>
            Cancel
          </a>
        </div>
      </form>
    </section>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: 0,
        borderRadius: 9,
        background: active ? "var(--ne-fg)" : "transparent",
        color: active ? "var(--ne-bg)" : "var(--ne-fg)",
        padding: "8px 14px",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  );
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: CollectionFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  if (field.type === "repeater") {
    const items = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];

    return (
      <FieldShell label={field.label} description={field.description}>
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((item, index) => (
            <div key={index} style={{ borderRadius: 12, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)", padding: 14, display: "grid", gap: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "var(--ne-fg)" }}>{field.label} #{index + 1}</p>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, currentIndex) => currentIndex !== index))}
                  style={ghostButtonStyle}
                >
                  Remove
                </button>
              </div>
              {field.fields.map((subfield) => (
                <FieldControl
                  key={`${field.id}-${index}-${subfield.id}`}
                  field={subfield}
                  value={item[subfield.id]}
                  onChange={(nextValue) => {
                    const nextItems = [...items];
                    nextItems[index] = {
                      ...item,
                      [subfield.id]: nextValue,
                    };
                    onChange(nextItems);
                  }}
                />
              ))}
            </div>
          ))}

          <button
            type="button"
            onClick={() => onChange([...items, {}])}
            style={{ ...ghostButtonStyle, justifySelf: "start" }}
          >
            Add {field.label}
          </button>
        </div>
      </FieldShell>
    );
  }

  if (field.type === "toggle") {
    return (
      <FieldShell label={field.label} description={field.description}>
        <button
          type="button"
          onClick={() => onChange(!Boolean(value))}
          style={{
            border: 0,
            borderRadius: 10,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 500,
            background: value ? "var(--ne-fg)" : "var(--ne-surface-muted)",
            color: value ? "var(--ne-bg)" : "var(--ne-fg)",
            cursor: "pointer",
          }}
        >
          {value ? "Enabled" : "Disabled"}
        </button>
      </FieldShell>
    );
  }

  if (field.type === "select") {
    return (
      <FieldShell label={field.label} description={field.description}>
        <select value={String(value ?? "")} onChange={(event) => onChange(event.target.value)} style={inputStyle()}>
          <option value="">Select…</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </FieldShell>
    );
  }

  if (field.type === "textarea" || field.type === "embed") {
    return (
      <FieldShell label={field.label} description={field.description}>
        <textarea
          value={String(value ?? "")}
          onChange={(event) => onChange(event.target.value)}
          style={inputStyle({ minHeight: field.type === "embed" ? 140 : 120 })}
          placeholder={field.placeholder}
        />
      </FieldShell>
    );
  }

  if (field.type === "richtext") {
    return (
      <FieldShell label={field.label} description={field.description}>
        <RichTextEditor
          name={`rt-${field.id}`}
          initialValue={String(value ?? "")}
          uploadUrl="/api/ne/upload"
          onChange={onChange}
        />
      </FieldShell>
    );
  }

  if (field.type === "image") {
    return (
      <FieldShell label={field.label} description={field.description}>
        <ImageFieldControl
          value={getStringValue(value)}
          onChange={(nextValue) => onChange(nextValue)}
        />
      </FieldShell>
    );
  }

  const inputType = field.type === "dateTime" ? "datetime-local" : "text";
  return (
    <FieldShell label={field.label} description={field.description}>
      <input
        type={inputType}
        value={formatInputValue(field.type, value)}
        onChange={(event) => onChange(event.target.value)}
        style={inputStyle()}
        placeholder={field.placeholder}
      />
    </FieldShell>
  );
}

function ImageFieldControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Only image files are supported.");
      return;
    }

    setIsUploading(true);
    setError(undefined);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ne/upload", {
        method: "POST",
        body: formData,
      });

      const result = (await response.json()) as {
        ok: boolean;
        url?: string;
        error?: string;
      };

      if (!response.ok || !result.ok || !result.url) {
        setError(result.error ?? "Upload failed.");
        return;
      }

      onChange(result.url);
    } catch {
      setError("Upload failed. Check your connection.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer?.files[0];
    if (file) void handleFile(file);
  };

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {value ? (
        <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", height: 160 }}>
          <img
            src={value}
            alt="Selected image"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              border: "1px solid rgba(255,255,255,0.5)",
              borderRadius: 6,
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 8px",
              cursor: "pointer",
            }}
          >
            Remove
          </button>
        </div>
      ) : null}

      <div
        style={{
          border: `2px dashed ${isDragging ? "var(--ne-fg)" : "var(--ne-border-strong)"}`,
          borderRadius: 10,
          padding: "22px 14px",
          textAlign: "center",
          cursor: "pointer",
          background: isDragging ? "var(--ne-surface-muted)" : "var(--ne-surface)",
          transition: "border-color 150ms ease, background 150ms ease",
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
        {isUploading ? (
          <p style={{ margin: 0, fontSize: 13, color: "var(--ne-muted)" }}>Uploading…</p>
        ) : (
          <>
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "var(--ne-fg)" }}>
              Drop an image or click to select
            </p>
            <p style={{ margin: 0, fontSize: 11, color: "var(--ne-muted)" }}>
              Uploads use the same `/api/ne/upload` B2 flow as the page editor.
            </p>
          </>
        )}
      </div>

      {error ? (
        <p style={{ margin: 0, fontSize: 12, color: "#dc2626" }}>{error}</p>
      ) : null}

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Or paste an image URL…"
        style={inputStyle()}
      />
    </div>
  );
}

function FieldShell({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <label style={{ display: "grid", gap: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ne-fg)" }}>{label}</span>
      {description ? (
        <span style={{ fontSize: 12, lineHeight: 1.5, color: "var(--ne-muted)" }}>{description}</span>
      ) : null}
      {children}
    </label>
  );
}

function inputStyle(extra?: CSSProperties): CSSProperties {
  return {
    width: "100%",
    borderRadius: 10,
    border: "1px solid var(--ne-border-strong)",
    background: "var(--ne-surface)",
    color: "var(--ne-fg)",
    padding: "12px 14px",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
    ...extra,
  };
}

const ghostButtonStyle: CSSProperties = {
  borderRadius: 10,
  border: "1px solid var(--ne-border-strong)",
  background: "var(--ne-surface)",
  color: "var(--ne-fg)",
  padding: "8px 12px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};

function formatDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function formatDateTimeDisplay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatInputValue(type: CollectionFieldDefinition["type"], value: unknown) {
  if (type === "dateTime") return formatDateTimeLocal(getStringValue(value));
  return String(value ?? "");
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getStatusOptions(collection: CollectionDefinition) {
  if (collection.mode === "incoming") {
    const incomingStatuses = collection.incoming?.statuses?.filter((option) => option.value.trim().length > 0) ?? [];
    return incomingStatuses.length > 0
      ? incomingStatuses
      : [
          { label: "New", value: "new" },
          { label: "Resolved", value: "resolved" },
        ];
  }

  return [
    { label: "Draft", value: "draft" },
    { label: "Published", value: "published" },
    { label: "Scheduled", value: "scheduled" },
  ];
}
