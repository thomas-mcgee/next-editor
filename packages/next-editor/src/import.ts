import { readFile } from "node:fs/promises";
import type {
  CollectionDefinition,
  CollectionFieldDefinition,
  CollectionStatus,
  FieldDefinition,
  NextEditorConfig,
  PageDefinition,
} from "./types";
import { getCollectionEntry, saveCollectionEntry } from "./content/collection-store";
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

export type CollectionImportDocument = {
  version: 1;
  collectionId: string;
  entries: CollectionImportEntry[];
};

export type CollectionImportEntry = {
  entryId: string;
  slug?: string | null;
  status?: CollectionStatus;
  publishedAt?: string | null;
  values: Record<string, unknown>;
};

type NormalizedCollectionImportEntry = CollectionImportEntry & {
  hasSlug: boolean;
  hasStatus: boolean;
  hasPublishedAt: boolean;
};

export type CreatePageImportTemplateOptions = {
  includePagePath?: boolean;
};

export type CreateCollectionImportTemplateOptions = {
  entries?: Array<{
    entryId: string;
    slug?: string | null;
    status?: CollectionStatus;
    publishedAt?: string | null;
  }>;
};

export type ValidatePageImportOptions = {
  config: NextEditorConfig;
  document: PageImportDocument;
  allowPartialPages?: boolean;
  allowPartialFields?: boolean;
};

export type ValidateCollectionImportOptions = {
  config: NextEditorConfig;
  document: CollectionImportDocument;
  allowPartialFields?: boolean;
};

export type ImportPagesOptions = ValidatePageImportOptions & {
  mode?: "replace" | "merge";
};

export type ImportCollectionOptions = ValidateCollectionImportOptions & {
  mode?: "replace" | "merge";
  updatedBy?: string | null;
};

export type ImportPagesFromFileOptions = Omit<ImportPagesOptions, "document"> & {
  filePath: string;
};

export type ImportCollectionFromFileOptions = Omit<ImportCollectionOptions, "document"> & {
  filePath: string;
};

export type ImportPagesResult = {
  importedPageIds: string[];
  mode: "replace" | "merge";
};

export type ImportCollectionResult = {
  collectionId: string;
  importedEntryIds: string[];
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
      values: buildPageTemplateValues(page),
    })),
  };
}

export function createCollectionImportTemplate(
  config: NextEditorConfig,
  collectionId: string,
  options: CreateCollectionImportTemplateOptions = {},
): CollectionImportDocument {
  const collection = getCollectionDefinition(config, collectionId);
  const defaultStatus = getDefaultCollectionStatus(collection);
  const entries =
    options.entries && options.entries.length > 0
      ? options.entries
      : [{ entryId: `${collection.id}-entry-1`, status: defaultStatus, publishedAt: null }];

  return {
    version: 1,
    collectionId: collection.id,
    entries: entries.map((entry) => ({
      entryId: entry.entryId,
      slug: entry.slug ?? null,
      status: entry.status ?? defaultStatus,
      publishedAt: collection.mode === "incoming" ? null : (entry.publishedAt ?? null),
      values: buildCollectionTemplateValues(collection),
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

  const rawPages = Array.isArray(document.pages) ? document.pages : [];
  if (!Array.isArray(document.pages)) {
    errors.push('Import document must include a "pages" array.');
  }

  const pageMap = new Map(config.pages.map((page) => [page.id, page]));
  const seenPageIds = new Set<string>();
  const normalizedPages: PageImportPage[] = [];

  for (const page of rawPages) {
    if (!isPlainObject(page)) {
      errors.push("Each page import entry must be an object.");
      continue;
    }

    const pageId = typeof page.pageId === "string" ? page.pageId : "";
    if (!pageId) {
      errors.push('Each page import entry must include a non-empty "pageId".');
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
    throw new Error(formatImportErrors("Page import", errors));
  }

  return {
    version: 1,
    pages: normalizedPages,
  };
}

export function validateCollectionImportDocument(
  options: ValidateCollectionImportOptions,
): CollectionImportDocument {
  const { config, document, allowPartialFields = false } = options;
  const errors: string[] = [];

  if (document.version !== 1) {
    errors.push(`Unsupported import version "${String(document.version)}". Expected "1".`);
  }

  const collectionId = typeof document.collectionId === "string" ? document.collectionId : "";
  if (!collectionId) {
    errors.push('Import document must include a non-empty "collectionId".');
  }

  const collection = collectionId ? findCollectionDefinition(config, collectionId) : null;
  const allowedStatuses = collection ? getAllowedCollectionStatuses(collection) : ["draft", "published", "scheduled"];
  if (collectionId && !collection) {
    errors.push(`Collection "${collectionId}" is not registered in the provided NextEditor config.`);
  }

  const rawEntries = Array.isArray(document.entries) ? document.entries : [];
  if (!Array.isArray(document.entries)) {
    errors.push('Import document must include an "entries" array.');
  }

  const seenEntryIds = new Set<string>();
  const normalizedEntries: NormalizedCollectionImportEntry[] = [];

  for (const entry of rawEntries) {
    if (!isPlainObject(entry)) {
      errors.push("Each collection import entry must be an object.");
      continue;
    }

    const entryId = typeof entry.entryId === "string" ? entry.entryId : "";
    if (!entryId) {
      errors.push('Each collection import entry must include a non-empty "entryId".');
      continue;
    }

    if (seenEntryIds.has(entryId)) {
      errors.push(`Duplicate collection import entry for "${entryId}".`);
      continue;
    }
    seenEntryIds.add(entryId);

    const hasSlug = Object.prototype.hasOwnProperty.call(entry, "slug");
    if (hasSlug && entry.slug !== null && typeof entry.slug !== "string") {
      errors.push(`Collection entry "${entryId}" has an invalid "slug" value.`);
    }

    const hasStatus = Object.prototype.hasOwnProperty.call(entry, "status");
    if (hasStatus && (typeof entry.status !== "string" || !allowedStatuses.includes(entry.status))) {
      errors.push(
        `Collection entry "${entryId}" has an invalid "status". Expected one of: ${allowedStatuses.join(", ")}.`,
      );
    }

    const hasPublishedAt = Object.prototype.hasOwnProperty.call(entry, "publishedAt");
    if (
      hasPublishedAt &&
      entry.publishedAt !== null &&
      typeof entry.publishedAt !== "string"
    ) {
      errors.push(`Collection entry "${entryId}" has an invalid "publishedAt" value.`);
    }

    if (!isPlainObject(entry.values)) {
      errors.push(`Collection entry "${entryId}" must include a "values" object.`);
      continue;
    }

    if (collection) {
      errors.push(
        ...validateCollectionValues(collection, entry.values, {
          allowPartialFields,
          entryId,
        }),
      );
    }

    normalizedEntries.push({
      entryId,
      slug: hasSlug ? (entry.slug ?? null) : undefined,
      status: hasStatus ? entry.status : undefined,
      publishedAt: hasPublishedAt ? (entry.publishedAt ?? null) : undefined,
      values: entry.values,
      hasSlug,
      hasStatus,
      hasPublishedAt,
    });
  }

  if (errors.length > 0) {
    throw new Error(formatImportErrors("Collection import", errors));
  }

  return {
    version: 1,
    collectionId,
    entries: normalizedEntries.map(
      ({ hasPublishedAt: _hasPublishedAt, hasSlug: _hasSlug, hasStatus: _hasStatus, ...entry }) =>
        entry,
    ),
  };
}

export async function importPages(options: ImportPagesOptions): Promise<ImportPagesResult> {
  const { mode = "replace" } = options;
  const document = validatePageImportDocument(options);

  for (const page of document.pages) {
    const values =
      mode === "merge" ? mergeObjects(await readPageContent(page.pageId), page.values) : page.values;

    await setPageContent(page.pageId, values);
  }

  return {
    importedPageIds: document.pages.map((page) => page.pageId),
    mode,
  };
}

export async function importCollection(
  options: ImportCollectionOptions,
): Promise<ImportCollectionResult> {
  const { config, mode = "replace", updatedBy = null } = options;
  const validatedDocument = validateCollectionImportDocument(options);
  const collection = getCollectionDefinition(config, validatedDocument.collectionId);
  const defaultStatus = getDefaultCollectionStatus(collection);
  const rawEntries = Array.isArray(options.document.entries) ? options.document.entries : [];
  const normalizedEntryMap = new Map<string, NormalizedCollectionImportEntry>();

  for (const entry of rawEntries) {
    if (!isPlainObject(entry) || typeof entry.entryId !== "string" || !entry.entryId) {
      continue;
    }

    normalizedEntryMap.set(entry.entryId, {
      entryId: entry.entryId,
      slug: Object.prototype.hasOwnProperty.call(entry, "slug") ? (entry.slug ?? null) : undefined,
      status: Object.prototype.hasOwnProperty.call(entry, "status") ? entry.status : undefined,
      publishedAt: Object.prototype.hasOwnProperty.call(entry, "publishedAt")
        ? (entry.publishedAt ?? null)
        : undefined,
      values: validatedDocument.entries.find((candidate) => candidate.entryId === entry.entryId)?.values ?? {},
      hasSlug: Object.prototype.hasOwnProperty.call(entry, "slug"),
      hasStatus: Object.prototype.hasOwnProperty.call(entry, "status"),
      hasPublishedAt: Object.prototype.hasOwnProperty.call(entry, "publishedAt"),
    });
  }

  for (const entry of validatedDocument.entries) {
    const normalizedEntry = normalizedEntryMap.get(entry.entryId);
    const existing = await getCollectionEntry(collection.id, entry.entryId);
    const values =
      mode === "merge" ? mergeObjects(existing?.values ?? {}, entry.values) : entry.values;

    await saveCollectionEntry({
      collectionId: collection.id,
      entryId: entry.entryId,
      slug:
        normalizedEntry?.hasSlug
          ? (normalizedEntry.slug ?? null)
          : (existing?.slug ?? null),
      status:
        normalizedEntry?.hasStatus
          ? (normalizedEntry.status ?? defaultStatus)
          : (existing?.status ?? defaultStatus),
      publishedAt:
        normalizedEntry?.hasPublishedAt
          ? (collection.mode === "incoming" ? null : (normalizedEntry.publishedAt ?? null))
          : (collection.mode === "incoming" ? null : (existing?.publishedAt ?? null)),
      values,
      updatedBy,
    });
  }

  return {
    collectionId: collection.id,
    importedEntryIds: validatedDocument.entries.map((entry) => entry.entryId),
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

export async function importCollectionFromFile(
  options: ImportCollectionFromFileOptions,
): Promise<ImportCollectionResult> {
  const raw = await readFile(options.filePath, "utf8");
  const parsed = JSON.parse(raw) as CollectionImportDocument;
  return importCollection({
    ...options,
    document: parsed,
  });
}

function buildPageTemplateValues(page: PageDefinition) {
  return page.sections.reduce<Record<string, unknown>>((values, section) => {
    for (const field of section.fields) {
      values = setValueAtPath(values, field.id, getPrimitiveTemplateValue(field));
    }
    return values;
  }, {});
}

function buildCollectionTemplateValues(collection: CollectionDefinition) {
  return collection.sections.reduce<Record<string, unknown>>((values, section) => {
    for (const field of section.fields) {
      values[field.id] = getCollectionTemplateValue(field);
    }
    return values;
  }, {});
}

function getCollectionTemplateValue(field: CollectionFieldDefinition): unknown {
  if (field.type === "repeater") {
    return [];
  }

  return getPrimitiveTemplateValue(field);
}

function getPrimitiveTemplateValue(field: FieldDefinition | CollectionFieldDefinition) {
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

    const typeError = validatePrimitiveFieldValue(field, value);
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

function validateCollectionValues(
  collection: CollectionDefinition,
  values: Record<string, unknown>,
  options: { allowPartialFields: boolean; entryId: string },
) {
  return validateCollectionFieldGroup(collection.sections.flatMap((section) => section.fields), values, {
    allowPartialFields: options.allowPartialFields,
    entryId: options.entryId,
    collectionId: collection.id,
    prefix: "",
  });
}

function validateCollectionFieldGroup(
  fields: CollectionFieldDefinition[],
  values: Record<string, unknown>,
  options: {
    allowPartialFields: boolean;
    collectionId: string;
    entryId: string;
    prefix: string;
  },
) {
  const errors: string[] = [];
  const knownFieldIds = new Set(fields.map((field) => field.id));

  for (const field of fields) {
    const value = values[field.id];
    const fieldPath = options.prefix ? `${options.prefix}.${field.id}` : field.id;

    if (value === undefined) {
      if (!options.allowPartialFields) {
        errors.push(
          `Collection "${options.collectionId}" entry "${options.entryId}" is missing field "${fieldPath}".`,
        );
      }
      continue;
    }

    if (field.type === "repeater") {
      if (!Array.isArray(value)) {
        errors.push(
          `Collection "${options.collectionId}" entry "${options.entryId}" field "${fieldPath}": expected an array.`,
        );
        continue;
      }

      value.forEach((item, index) => {
        if (!isPlainObject(item)) {
          errors.push(
            `Collection "${options.collectionId}" entry "${options.entryId}" field "${fieldPath}[${index}]": expected an object.`,
          );
          return;
        }

        errors.push(
          ...validateCollectionFieldGroup(field.fields, item, {
            ...options,
            prefix: `${fieldPath}[${index}]`,
          }),
        );
      });
      continue;
    }

    const typeError = validatePrimitiveFieldValue(field, value);
    if (typeError) {
      errors.push(
        `Collection "${options.collectionId}" entry "${options.entryId}" field "${fieldPath}": ${typeError}`,
      );
    }
  }

  for (const key of Object.keys(values)) {
    if (!knownFieldIds.has(key)) {
      const unknownPath = options.prefix ? `${options.prefix}.${key}` : key;
      errors.push(
        `Collection "${options.collectionId}" entry "${options.entryId}" includes unknown field "${unknownPath}".`,
      );
    }
  }

  return errors;
}

function validatePrimitiveFieldValue(
  field: FieldDefinition | Exclude<CollectionFieldDefinition, { type: "repeater" }>,
  value: unknown,
) {
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

function collectLeafPaths(source: Record<string, unknown>, prefix = ""): string[] {
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
      next[key] = mergeObjects(next[key] as Record<string, unknown>, value);
      continue;
    }

    next[key] = value;
  }

  return next;
}

function findCollectionDefinition(config: NextEditorConfig, collectionId: string) {
  return config.collections?.find((collection) => collection.id === collectionId) ?? null;
}

function getCollectionDefinition(config: NextEditorConfig, collectionId: string) {
  const collection = findCollectionDefinition(config, collectionId);
  if (!collection) {
    throw new Error(`Collection "${collectionId}" is not registered in the provided NextEditor config.`);
  }
  return collection;
}

function getAllowedCollectionStatuses(collection: CollectionDefinition) {
  if (collection.mode === "incoming") {
    const configured = collection.incoming?.statuses?.map((option) => option.value).filter(Boolean) ?? [];
    return configured.length > 0 ? configured : ["new", "resolved"];
  }

  return ["draft", "published", "scheduled"];
}

function getDefaultCollectionStatus(collection: CollectionDefinition) {
  return collection.mode === "incoming"
    ? collection.incoming?.defaultStatus ?? getAllowedCollectionStatuses(collection)[0] ?? "new"
    : "draft";
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function formatImportErrors(label: string, errors: string[]) {
  return `${label} validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`;
}
