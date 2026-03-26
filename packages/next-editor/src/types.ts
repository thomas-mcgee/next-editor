import type { ComponentType, JSX, ReactNode } from "react";

export type PrimitiveFieldType =
  | "text"
  | "textarea"
  | "image"
  | "select"
  | "toggle"
  | "slug"
  | "dateTime"
  | "richtext"
  | "embed"
  | "repeater";

export type FieldOption = {
  label: string;
  value: string;
};

export type BaseFieldDefinition = {
  id: string;
  label: string;
  description?: string;
  placeholder?: string;
  sectionId?: string;
};

export type TextFieldDefinition = BaseFieldDefinition & {
  type: "text" | "textarea" | "image" | "slug" | "dateTime" | "richtext" | "embed";
};

export type ToggleFieldDefinition = BaseFieldDefinition & {
  type: "toggle";
};

export type SelectFieldDefinition = BaseFieldDefinition & {
  type: "select";
  options: FieldOption[];
};

export type RepeaterFieldDefinition = BaseFieldDefinition & {
  type: "repeater";
  fields: CollectionFieldDefinition[];
};

export type FieldDefinition =
  | TextFieldDefinition
  | ToggleFieldDefinition
  | SelectFieldDefinition;

export type CollectionFieldDefinition =
  | TextFieldDefinition
  | ToggleFieldDefinition
  | SelectFieldDefinition
  | RepeaterFieldDefinition;

export type PageSectionDefinition = {
  id: string;
  label: string;
  fields: FieldDefinition[];
};

export type PageDefinition = {
  id: string;
  label: string;
  path: string;
  description?: string;
  sections: PageSectionDefinition[];
};

export type CollectionDefinition = {
  id: string;
  label: string;
  singularLabel?: string;
  path?: string;
  description?: string;
  useAsTitle?: string;
  sections: Array<{
    id: string;
    label: string;
    fields: CollectionFieldDefinition[];
  }>;
};

export type DashboardLinkDefinition = {
  id: string;
  title: string;
  description?: string;
  href: string;
  openInNewTab?: boolean;
};

export type NextEditorConfig = {
  pages: PageDefinition[];
  collections?: CollectionDefinition[];
  dashboardLinks?: DashboardLinkDefinition[];
};

export type CollectionStatus = "draft" | "published" | "scheduled";

export type CollectionEntryRecord = {
  collectionId: string;
  entryId: string;
  slug: string | null;
  status: CollectionStatus;
  publishedAt: string | null;
  values: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  updatedBy: string | null;
};

export type EditorPageValues = Record<string, unknown>;

export type SaveResult = {
  ok: boolean;
  error?: string;
};

export type EditorProviderProps = {
  page: PageDefinition;
  initialValues: EditorPageValues;
  saveUrl: string;
  imageUploadUrl?: string;
  canEdit: boolean;
  adminHref?: string;
  children: ReactNode;
};

export type EditorViewportProps = {
  children: ReactNode;
  sidebarWidth?: number;
};

export type EditableTextProps = {
  fieldId: string;
  value?: string | null;
  as?:
    | keyof JSX.IntrinsicElements
    | ComponentType<{ className?: string; children?: ReactNode }>;
  className?: string;
  placeholder?: string;
  children?: ReactNode;
};

export type EditableRegionProps = {
  fieldId: string;
  className?: string;
  children: ReactNode;
};

export type EditableImageProps = {
  fieldId: string;
  src?: string | null;
  alt: string;
  className?: string;
};

export type EditorState = {
  page: PageDefinition;
  values: EditorPageValues;
  isEditing: boolean;
  isSaving: boolean;
  canEdit: boolean;
  activeFieldId?: string;
  isDirty: boolean;
  adminHref: string;
  imageUploadUrl?: string;
  enterEditMode: () => void;
  attemptExitEditMode: () => boolean;
  setFieldValue: (fieldId: string, value: unknown) => void;
  saveChanges: () => Promise<SaveResult>;
  focusField: (fieldId: string) => void;
  registerFieldRef: (fieldId: string, element: HTMLElement | null) => void;
  registerRegion: (fieldId: string, element: HTMLElement | null) => void;
  getFieldValue: <T = unknown>(fieldId: string) => T | undefined;
};
