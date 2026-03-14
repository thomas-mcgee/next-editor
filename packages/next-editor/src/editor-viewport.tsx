"use client";

import type { EditorViewportProps } from "./types";
import { useEditor } from "./editor-context";

export function EditorViewport({
  children,
  sidebarWidth = 420,
}: EditorViewportProps) {
  const { canEdit, isEditing } = useEditor();
  const shouldPush = canEdit && isEditing;

  return (
    <div
      style={{
        minHeight: "100vh",
        marginLeft: shouldPush ? sidebarWidth : 0,
        width: shouldPush ? `calc(100% - ${sidebarWidth}px)` : "100%",
        transition: "margin-left 220ms ease, width 220ms ease",
      }}
    >
      {children}
    </div>
  );
}
