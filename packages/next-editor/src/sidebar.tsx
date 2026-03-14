"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import { useEditor } from "./editor-context";
import type { FieldDefinition } from "./types";

function FieldControl({ field }: { field: FieldDefinition }) {
  const { activeFieldId, getFieldValue, registerFieldRef, setFieldValue } =
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

      {field.type === "text" || field.type === "image" ? (
        <input
          type="text"
          value={String(currentValue ?? "")}
          onChange={(event) => setFieldValue(field.id, event.target.value)}
          style={inputStyle()}
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
