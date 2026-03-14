"use client";

import { useState } from "react";
import { useEditor } from "./editor-context";

export function FloatingAdminBar() {
  const {
    adminHref,
    canEdit,
    enterEditMode,
    isEditing,
    isSaving,
    saveChanges,
  } = useEditor();
  const [error, setError] = useState<string>();

  if (!canEdit) {
    return null;
  }

  const handlePrimary = async () => {
    if (!isEditing) {
      enterEditMode();
      return;
    }

    const result = await saveChanges();
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setError(undefined);
  };

  return (
    <div
      style={{
        position: "fixed",
        right: 24,
        bottom: 24,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        gap: 8,
        borderRadius: 999,
        border: "1px solid #e4e4e7",
        background: "rgba(255,255,255,0.96)",
        padding: 8,
        boxShadow: "0 20px 60px rgba(24,24,27,0.16)",
        backdropFilter: "blur(14px)",
        fontFamily:
          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <a
        href={adminHref}
        style={{
          borderRadius: 999,
          border: "1px solid #e4e4e7",
          padding: "10px 16px",
          fontSize: 14,
          fontWeight: 500,
          color: "#3f3f46",
          textDecoration: "none",
        }}
      >
        Admin
      </a>
      <button
        type="button"
        onClick={handlePrimary}
        disabled={isSaving}
        style={{
          border: 0,
          borderRadius: 999,
          background: isSaving ? "#a1a1aa" : "#18181b",
          padding: "10px 16px",
          fontSize: 14,
          fontWeight: 600,
          color: "#ffffff",
          cursor: isSaving ? "not-allowed" : "pointer",
        }}
      >
        {isEditing ? (isSaving ? "Saving..." : "Save Changes") : "Edit This"}
      </button>
      {error ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            bottom: "calc(100% + 8px)",
            borderRadius: 16,
            background: "#18181b",
            padding: "8px 12px",
            fontSize: 12,
            color: "#ffffff",
          }}
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
