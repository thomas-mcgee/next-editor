"use client";

import {
  EditorProvider,
  EditorSidebar,
  EditorViewport,
  FloatingAdminBar,
} from "@makeablebrand/next-editor/client";
import type { ComponentProps, ReactNode } from "react";

type DemoEditorShellProps = Pick<
  ComponentProps<typeof EditorProvider>,
  "page" | "initialValues" | "canEdit"
> & {
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
      saveUrl="/api/ne/content"
      imageUploadUrl="/api/ne/upload"
      adminHref="/admin"
    >
      {canEdit ? <EditorSidebar /> : null}
      {canEdit ? <FloatingAdminBar /> : null}
      <EditorViewport>
        <div className="site-theme-scope">{children}</div>
      </EditorViewport>
    </EditorProvider>
  );
}
