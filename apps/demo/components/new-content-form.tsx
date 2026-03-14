"use client";

import { useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import type { ContentTypeDefinition, ContentTypeField } from "@/lib/content-types";

type NewContentFormProps = {
  definition: ContentTypeDefinition;
};

export function NewContentForm({ definition }: NewContentFormProps) {
  const [tab, setTab] = useState<"content" | "publication">("content");
  const [status, setStatus] = useState("draft");

  const contentFields = definition.fields.filter(isContentField);
  const publicationFields = definition.fields.filter((field) => {
    if (isContentField(field)) {
      return false;
    }

    if (field.id === "publishedAt") {
      return status === "scheduled";
    }

    return true;
  });

  return (
    <form className="mt-8 w-full space-y-6">
      <div
        style={{
          display: "inline-flex",
          gap: 6,
          borderRadius: 12,
          border: "1px solid var(--border-strong)",
          background: "var(--surface)",
          padding: 4,
        }}
      >
        <TabButton
          active={tab === "content"}
          onClick={() => setTab("content")}
          label="Content"
        />
        <TabButton
          active={tab === "publication"}
          onClick={() => setTab("publication")}
          label="Publication"
        />
      </div>

      <div className="space-y-5">
        {(tab === "content" ? contentFields : publicationFields).map((field) => (
          <FieldControl
            key={field.id}
            field={field}
            status={status}
            onStatusChange={setStatus}
          />
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl px-5 py-3 text-sm font-semibold"
          style={{
            border: 0,
            background: "var(--foreground)",
            color: "var(--background)",
          }}
        >
          Save {definition.singularLabel}
        </button>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          Rich text editor is wired for UI shaping. Save behavior can connect to
          your content model next.
        </p>
      </div>
    </form>
  );
}

function FieldControl({
  field,
  status,
  onStatusChange,
}: {
  field: ContentTypeField;
  status: string;
  onStatusChange: (value: string) => void;
}) {
  if (field.type === "richtext") {
    return (
      <div className="block">
        <div
          className="mb-2 block text-sm font-medium"
          style={{ color: "var(--foreground)" }}
        >
          {field.label}
        </div>
        <RichTextEditor
          name={field.id}
          placeholder={`Write the ${field.label.toLowerCase()}...`}
        />
      </div>
    );
  }

  return (
    <label className="block">
      <span
        className="mb-2 block text-sm font-medium"
        style={{ color: "var(--foreground)" }}
      >
        {field.label}
      </span>
      {field.type === "textarea" ? (
        <textarea
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            minHeight: 120,
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
            color: "var(--foreground)",
          }}
        />
      ) : field.type === "status" ? (
        <select
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          style={{
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
            color: "var(--foreground)",
          }}
        >
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
      ) : field.type === "date" ? (
        <input
          type="datetime-local"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
            color: "var(--foreground)",
          }}
        />
      ) : (
        <input
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            border: "1px solid var(--border-strong)",
            background: "var(--surface)",
            color: "var(--foreground)",
          }}
        />
      )}
    </label>
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
        background: active ? "var(--foreground)" : "transparent",
        color: active ? "var(--background)" : "var(--foreground)",
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

function isContentField(field: ContentTypeField) {
  return field.id === "title" || field.type === "richtext";
}
