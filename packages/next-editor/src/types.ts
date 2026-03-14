import type { ComponentType, JSX, ReactNode } from "react";

export type PrimitiveFieldType =
  | "text"
  | "textarea"
  | "image"
  | "select"
  | "toggle";

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
  type: "text" | "textarea" | "image";
};

export type ToggleFieldDefinition = BaseFieldDefinition & {
  type: "toggle";
};

export type SelectFieldDefinition = BaseFieldDefinition & {
  type: "select";
  options: FieldOption[];
};

export type FieldDefinition =
  | TextFieldDefinition
  | ToggleFieldDefinition
  | SelectFieldDefinition;

export type PageSectionDefinition = {
  id: string;
  label: string;
  fields: FieldDefinition[];
};

export type PageDefinition = {
  id: string;
  label: string;
  sections: PageSectionDefinition[];
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
  canEdit: boolean;
  adminHref?: string;
  children: ReactNode;
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
  enterEditMode: () => void;
  attemptExitEditMode: () => boolean;
  setFieldValue: (fieldId: string, value: unknown) => void;
  saveChanges: () => Promise<SaveResult>;
  focusField: (fieldId: string) => void;
  registerFieldRef: (fieldId: string, element: HTMLElement | null) => void;
  registerRegion: (fieldId: string, element: HTMLElement | null) => void;
  getFieldValue: <T = unknown>(fieldId: string) => T | undefined;
};
