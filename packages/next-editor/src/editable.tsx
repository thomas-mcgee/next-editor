"use client";

import {
  type ElementType,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
} from "react";
import type {
  EditableImageProps,
  EditableRegionProps,
  EditableTextProps,
} from "./types";
import { useEditorThemeVars } from "./editor-theme";
import { useEditor } from "./editor-context";
import { cx } from "./utils";

function RegionChrome({
  fieldId,
  className,
  children,
}: {
  fieldId: string;
  className?: string;
  children: ReactNode;
}) {
  const { canEdit, isEditing, activeFieldId, focusField, registerRegion } =
    useEditor();
  const ref = useRef<HTMLDivElement>(null);
  const themeVars = useEditorThemeVars();

  useEffect(() => {
    registerRegion(fieldId, ref.current);
    return () => registerRegion(fieldId, null);
  }, [fieldId, registerRegion]);

  if (!canEdit) {
    return <>{children}</>;
  }

  const active = activeFieldId === fieldId;

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...themeVars,
        position: "relative",
        borderRadius: 12,
        outline: isEditing
          ? `${active ? 3 : 1}px solid ${
              active
                ? "#ec4899"
                : "var(--border-strong, #d4d4d8)"
            }`
          : "none",
        outlineOffset: isEditing ? 4 : 0,
        transition: "outline-color 160ms ease, outline-width 160ms ease",
      }}
    >
      {isEditing ? (
        <button
          type="button"
          onClick={() => focusField(fieldId)}
          style={{
            position: "absolute",
            top: -12,
            right: 12,
            zIndex: 10,
            borderRadius: 10,
            border: "1px solid var(--border-strong, #d4d4d8)",
            background: "var(--surface, #ffffff)",
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 600,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            color: "var(--foreground, #18181b)",
            boxShadow: "var(--shadow-soft, 0 8px 20px rgba(24,24,27,0.12))",
            cursor: "pointer",
          }}
        >
          Edit
        </button>
      ) : null}
      {children}
    </div>
  );
}

export function EditableRegion({
  fieldId,
  className,
  children,
}: EditableRegionProps) {
  return (
    <RegionChrome fieldId={fieldId} className={className}>
      {children}
    </RegionChrome>
  );
}

export function EditableText({
  fieldId,
  value,
  as = "span",
  className,
  placeholder = "Empty field",
  children,
}: EditableTextProps) {
  const { getFieldValue } = useEditor();
  const Component = as as ElementType;
  const currentValue = getFieldValue<string>(fieldId) ?? value ?? "";

  return (
    <EditableRegion fieldId={fieldId}>
      <Component className={className}>
        {currentValue || children || <span className="opacity-50">{placeholder}</span>}
      </Component>
    </EditableRegion>
  );
}

export function EditableImage({
  fieldId,
  src,
  alt,
  className,
}: EditableImageProps) {
  const { getFieldValue } = useEditor();
  const currentSrc =
    getFieldValue<string>(fieldId) ??
    src ??
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80";

  return (
    <EditableRegion fieldId={fieldId} className={className}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 16,
          ...imageWrapperStyle,
        }}
      >
        <img
          src={currentSrc}
          alt={alt}
          style={{
            display: "block",
            height: "100%",
            width: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </EditableRegion>
  );
}

const imageWrapperStyle: CSSProperties = {};
