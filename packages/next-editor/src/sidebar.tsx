"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor } from "./editor-context";
import type { FieldDefinition } from "./types";
import { cx } from "./utils";

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
        borderRadius: 18,
        border: `1px solid ${active ? "#18181b" : "#e4e4e7"}`,
        background: active ? "#fafafa" : "#ffffff",
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
              color: "#18181b",
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
                color: "#71717a",
              }}
            >
              {field.description}
            </p>
          ) : null}
        </div>
        <span
          style={{
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#a1a1aa",
          }}
        >
          {field.type}
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
            borderRadius: 999,
            padding: "10px 14px",
            fontSize: 14,
            fontWeight: 500,
            background: currentValue ? "#18181b" : "#f4f4f5",
            color: currentValue ? "#ffffff" : "#3f3f46",
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    setOpenSections(
      Object.fromEntries(page.sections.map((section) => [section.id, true])),
    );
  }, [isEditing, page.sections]);

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
        borderRight: "1px solid #e4e4e7",
        background: "#faf8f4",
        color: "#18181b",
        boxShadow: "0 28px 80px rgba(24,24,27,0.18)",
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
            borderBottom: "1px solid #e4e4e7",
            padding: "20px 24px",
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
              <p
                style={{
                  fontSize: 12,
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "#71717a",
                }}
              >
                NextEditor
              </p>
              <h2
                style={{
                  marginTop: 8,
                  fontSize: 30,
                  lineHeight: 1.1,
                  fontWeight: 600,
                }}
              >
                {page.label}
              </h2>
              <p
                style={{
                  marginTop: 4,
                  fontSize: 14,
                  color: "#71717a",
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
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            style={{
              ...primaryButtonStyle,
              marginTop: 20,
              background: isSaving ? "#a1a1aa" : "#18181b",
              cursor: isSaving ? "not-allowed" : "pointer",
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 16px",
          }}
        >
          {page.sections.map((section) => {
            const isOpen = openSections[section.id];
            return (
              <div
                key={section.id}
                style={{
                  marginBottom: 16,
                  borderRadius: 24,
                  border: "1px solid #e4e4e7",
                  background: "#ffffff",
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
                    padding: "16px 20px",
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
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "#52525b",
                    }}
                  >
                    {section.label}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      color: "#a1a1aa",
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
                      borderTop: "1px solid #e4e4e7",
                      padding: 16,
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
    borderRadius: 12,
    border: "1px solid #d4d4d8",
    padding: "10px 12px",
    fontSize: 14,
    color: "#18181b",
    outline: "none",
    ...extra,
  };
}

const primaryButtonStyle: React.CSSProperties = {
  display: "inline-flex",
  border: 0,
  borderRadius: 999,
  padding: "10px 16px",
  fontSize: 14,
  fontWeight: 600,
  color: "#ffffff",
};

const secondaryButtonStyle: React.CSSProperties = {
  borderRadius: 999,
  border: "1px solid #d4d4d8",
  background: "#ffffff",
  padding: "8px 12px",
  fontSize: 14,
  fontWeight: 500,
  color: "#3f3f46",
  cursor: "pointer",
};
