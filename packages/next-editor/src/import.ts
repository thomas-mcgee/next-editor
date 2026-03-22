import { readFile } from "node:fs/promises";
import type { NextEditorConfig, PageDefinition, FieldDefinition } from "./types";
import { readPageContent, setPageContent } from "./content/store";
import { getValueAtPath, setValueAtPath } from "./utils";

export type PageImportDocument = {
  version: 1;
  pages: PageImportPage[];
};

export type PageImportPage = {
  pageId: string;
  path?: string;
  values: Record<string, unknown>;
};

export type CreatePageImportTemplateOptions = {
  includePagePath?: boolean;
};

export type ValidatePageImportOptions = {
  config: NextEditorConfig;
  document: PageImportDocument;
  allowPartialPages?: boolean;
  allowPartialFields?: boolean;
};

export type ImportPagesOptions = ValidatePageImportOptions & {
  mode?: "replace" | "merge";
};

export type ImportPagesFromFileOptions = Omit<ImportPagesOptions, "document"> & {
  filePath: string;
};

export type ImportPagesResult = {
  importedPageIds: string[];
  mode: "replace" | "merge";
};

export function createPageImportTemplate(
  config: NextEditorConfig,
  options: CreatePageImportTemplateOptions = {},
): PageImportDocument {
  return {
    version: 1,
    pages: config.pages.map((page) => ({
      pageId: page.id,
      ...(options.includePagePath === false ? {} : { path: page.path }),
      values: buildTemplateValues(page),
    })),
  };
}

export function validatePageImportDocument(
  options: ValidatePageImportOptions,
): PageImportDocument {
  const { config, document, allowPartialFields = false, allowPartialPages = false } = options;
  const errors: string[] = [];

  if (document.version !== 1) {
    errors.push(`Unsupported import version "${String(document.version)}". Expected "1".`);
  }

  if (!Array.isArray(document.pages)) {
    errors.push("Import document must include a \"pages\" array.");
  }

  const pageMap = new Map(config.pages.map((page) => [page.id, page]));
  const seenPageIds = new Set<string>();
  const normalizedPages: PageImportPage[] = [];

  for (const page of document.pages ?? []) {
    if (!isPlainObject(page)) {
      errors.push("Each page import entry must be an object.");
      continue;
    }

    const pageId = typeof page.pageId === "string" ? page.pageId : "";
    if (!pageId) {
      errors.push("Each page import entry must include a non-empty \"pageId\".");
      continue;
    }

    if (seenPageIds.has(pageId)) {
      errors.push(`Duplicate page import entry for "${pageId}".`);
      continue;
    }
    seenPageIds.add(pageId);

    const definition = pageMap.get(pageId);
    if (!definition) {
      errors.push(`Page "${pageId}" is not registered in the provided NextEditor config.`);
      continue;
    }

    if (page.path !== undefined && typeof page.path !== "string") {
      errors.push(`Page "${pageId}" has an invalid "path" value. Expected a string.`);
    }

    if (page.path !== undefined && page.path !== definition.path) {
      errors.push(
        `Page "${pageId}" path mismatch. Expected "${definition.path}" but received "${page.path}".`,
      );
    }

    if (!isPlainObject(page.values)) {
      errors.push(`Page "${pageId}" must include a "values" object.`);
      continue;
    }

    errors.push(...validatePageValues(definition, page.values, { allowPartialFields }));

    normalizedPages.push({
      pageId,
      path: definition.path,
      values: page.values,
    });
  }

  if (!allowPartialPages) {
    for (const page of config.pages) {
      if (!seenPageIds.has(page.id)) {
        errors.push(`Missing page import entry for "${page.id}".`);
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(formatImportErrors(errors));
  }

  return {
    version: 1,
    pages: normalizedPages,
  };
}

export async function importPages(options: ImportPagesOptions): Promise<ImportPagesResult> {
  const { mode = "replace" } = options;
  const document = validatePageImportDocument(options);

  for (const page of document.pages) {
    const values =
      mode === "merge"
        ? mergeObjects(await readPageContent(page.pageId), page.values)
        : page.values;

    await setPageContent(page.pageId, values);
  }

  return {
    importedPageIds: document.pages.map((page) => page.pageId),
    mode,
  };
}

export async function importPagesFromFile(
  options: ImportPagesFromFileOptions,
): Promise<ImportPagesResult> {
  const raw = await readFile(options.filePath, "utf8");
  const parsed = JSON.parse(raw) as PageImportDocument;
  return importPages({
    ...options,
    document: parsed,
  });
}

function buildTemplateValues(page: PageDefinition) {
  return page.sections.reduce<Record<string, unknown>>((values, section) => {
    for (const field of section.fields) {
      values = setValueAtPath(values, field.id, getTemplateValue(field));
    }
    return values;
  }, {});
}

function getTemplateValue(field: FieldDefinition) {
  if (field.type === "toggle") {
    return false;
  }

  if (field.type === "select") {
    return field.options[0]?.value ?? "";
  }

  return "";
}

function validatePageValues(
  page: PageDefinition,
  values: Record<string, unknown>,
  options: { allowPartialFields: boolean },
) {
  const errors: string[] = [];
  const fieldIds = new Set(page.sections.flatMap((section) => section.fields.map((field) => field.id)));

  for (const field of page.sections.flatMap((section) => section.fields)) {
    const value = getValueAtPath(values, field.id);

    if (value === undefined) {
      if (!options.allowPartialFields) {
        errors.push(`Page "${page.id}" is missing field "${field.id}".`);
      }
      continue;
    }

    const typeError = validateFieldValue(field, value);
    if (typeError) {
      errors.push(`Page "${page.id}" field "${field.id}": ${typeError}`);
    }
  }

  for (const path of collectLeafPaths(values)) {
    if (!fieldIds.has(path)) {
      errors.push(`Page "${page.id}" includes unknown field "${path}".`);
    }
  }

  return errors;
}

function validateFieldValue(field: FieldDefinition, value: unknown) {
  if (field.type === "toggle") {
    return typeof value === "boolean" ? null : "expected a boolean.";
  }

  if (field.type === "select") {
    if (typeof value !== "string") {
      return "expected a string.";
    }

    const allowedValues = new Set(field.options.map((option) => option.value));
    return allowedValues.has(value)
      ? null
      : `expected one of: ${field.options.map((option) => `"${option.value}"`).join(", ")}.`;
  }

  return typeof value === "string" ? null : "expected a string.";
}

function collectLeafPaths(
  source: Record<string, unknown>,
  prefix = "",
): string[] {
  const paths: string[] = [];

  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      paths.push(...collectLeafPaths(value, path));
      continue;
    }

    paths.push(path);
  }

  return paths;
}

function mergeObjects(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const next = structuredClone(base);

  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(next[key])) {
      next[key] = mergeObjects(
        next[key] as Record<string, unknown>,
        value,
      );
      continue;
    }

    next[key] = value;
  }

  return next;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatImportErrors(errors: string[]) {
  return `Page import validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`;
}
