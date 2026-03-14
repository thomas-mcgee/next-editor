"use client";

import {
  EditorProvider,
  EditorSidebar,
  FloatingAdminBar,
  type EditorPageValues,
  type PageDefinition,
} from "next-editor";
import type { ReactNode } from "react";

type DemoEditorShellProps = {
  page: PageDefinition;
  initialValues: EditorPageValues;
  canEdit: boolean;
  children: ReactNode;
};

export function DemoEditorShell({
  page,
  initialValues,
  canEdit,
  children,
}: DemoEditorShellProps) {
  return (
    <EditorProvider
      page={page}
      initialValues={initialValues}
      canEdit={canEdit}
      saveUrl="/api/editor/page"
      adminHref="/admin"
    >
      {canEdit ? <EditorSidebar /> : null}
      {canEdit ? <FloatingAdminBar /> : null}
      {children}
    </EditorProvider>
  );
}
