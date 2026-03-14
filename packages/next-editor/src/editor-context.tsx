"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { EditorProviderProps, EditorState, SaveResult } from "./types";
import { getValueAtPath, isEqualJson, setValueAtPath } from "./utils";

const EditorContext = createContext<EditorState | null>(null);

export function EditorProvider({
  page,
  initialValues,
  saveUrl,
  canEdit,
  adminHref = "/admin",
  children,
}: EditorProviderProps) {
  const [values, setValues] = useState(initialValues);
  const [savedValues, setSavedValues] = useState(initialValues);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string>();
  const fieldRefs = useRef(new Map<string, HTMLElement>());
  const regionRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    setValues(initialValues);
    setSavedValues(initialValues);
  }, [initialValues]);

  const isDirty = !isEqualJson(values, savedValues);

  useEffect(() => {
    if (!canEdit || !isDirty) {
      return;
    }

    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [canEdit, isDirty]);

  const enterEditMode = useCallback(() => {
    if (!canEdit) {
      return;
    }
    setIsEditing(true);
  }, [canEdit]);

  const attemptExitEditMode = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Leave edit mode anyway?",
      );
      if (!confirmed) {
        return false;
      }
      setValues(savedValues);
    }

    setIsEditing(false);
    setActiveFieldId(undefined);
    return true;
  }, [isDirty, savedValues]);

  const setFieldValue = useCallback((fieldId: string, value: unknown) => {
    setValues((current) => setValueAtPath(current, fieldId, value));
  }, []);

  const registerFieldRef = useCallback(
    (fieldId: string, element: HTMLElement | null) => {
      if (!element) {
        fieldRefs.current.delete(fieldId);
        return;
      }
      fieldRefs.current.set(fieldId, element);
    },
    [],
  );

  const registerRegion = useCallback(
    (fieldId: string, element: HTMLElement | null) => {
      if (!element) {
        regionRefs.current.delete(fieldId);
        return;
      }
      regionRefs.current.set(fieldId, element);
    },
    [],
  );

  const focusField = useCallback((fieldId: string) => {
    setIsEditing(true);
    setActiveFieldId(fieldId);

    const field = fieldRefs.current.get(fieldId);
    if (field) {
      field.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = field.querySelector<HTMLElement>(
        "input, textarea, select, button",
      );
      input?.focus();
      return;
    }

    const region = regionRefs.current.get(fieldId);
    region?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const saveChanges = useCallback(async (): Promise<SaveResult> => {
    if (!canEdit) {
      return { ok: false, error: "Not authorized." };
    }

    setIsSaving(true);
    try {
      const response = await fetch(saveUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageId: page.id,
          values,
        }),
      });

      const result = (await response.json()) as SaveResult;
      if (!response.ok || !result.ok) {
        return {
          ok: false,
          error: result.error ?? "Unable to save changes.",
        };
      }

      setSavedValues(values);
      setIsEditing(false);
      setActiveFieldId(undefined);
      return { ok: true };
    } catch {
      return { ok: false, error: "Unable to reach the save endpoint." };
    } finally {
      setIsSaving(false);
    }
  }, [canEdit, page.id, saveUrl, values]);

  const state = useMemo<EditorState>(
    () => ({
      page,
      values,
      isEditing,
      isSaving,
      canEdit,
      activeFieldId,
      isDirty,
      adminHref,
      enterEditMode,
      attemptExitEditMode,
      setFieldValue,
      saveChanges,
      focusField,
      registerFieldRef,
      registerRegion,
      getFieldValue: <T,>(fieldId: string) => getValueAtPath<T>(values, fieldId),
    }),
    [
      activeFieldId,
      adminHref,
      attemptExitEditMode,
      canEdit,
      enterEditMode,
      focusField,
      isDirty,
      isEditing,
      isSaving,
      page,
      registerFieldRef,
      registerRegion,
      saveChanges,
      setFieldValue,
      values,
    ],
  );

  return (
    <EditorContext.Provider value={state}>{children}</EditorContext.Provider>
  );
}

export function useEditor() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within an EditorProvider.");
  }
  return context;
}
