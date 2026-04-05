import { auth } from "./auth/config";
import {
  getCollectionEntry,
  getPublishedCollectionEntryBySlug,
  listCollectionEntries as _listCollectionEntries,
  listPublishedCollectionEntries,
  saveCollectionEntry,
} from "./content/collection-store";
import { getPageContent as _getPageContent } from "./content/store";
import type { CollectionDefinition, NextEditorConfig } from "./types";
import { randomUUID } from "node:crypto";

export async function getSession() {
  return auth();
}

export async function canEdit(): Promise<boolean> {
  const session = await auth();
  const role = session?.user?.role;
  return role === "editor" || role === "admin";
}

export async function getPageContent(pageId: string): Promise<Record<string, unknown>> {
  return _getPageContent(pageId);
}

export async function listCollectionEntries(collectionId: string) {
  return _listCollectionEntries(collectionId);
}

export async function listPublishedEntries(collectionId: string) {
  return listPublishedCollectionEntries(collectionId);
}

export async function getCollectionEntryById(collectionId: string, entryId: string) {
  return getCollectionEntry(collectionId, entryId);
}

export async function getPublishedEntryBySlug(collectionId: string, slug: string) {
  return getPublishedCollectionEntryBySlug(collectionId, slug);
}

export async function createIncomingCollectionEntry(
  config: NextEditorConfig,
  input: {
    collectionId: string;
    entryId?: string;
    values: Record<string, unknown>;
    status?: string;
  },
) {
  const collection = config.collections?.find((item) => item.id === input.collectionId);
  if (!collection) {
    throw new Error(`[next-editor] Collection "${input.collectionId}" is not registered in the provided config.`);
  }

  if (collection.mode !== "incoming") {
    throw new Error(`[next-editor] Collection "${input.collectionId}" is not configured as an incoming collection.`);
  }

  const allowedStatuses = getAllowedStatuses(collection);
  const status = input.status ?? collection.incoming?.defaultStatus ?? allowedStatuses[0] ?? "new";

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      `[next-editor] Invalid incoming status "${status}" for collection "${input.collectionId}".`,
    );
  }

  await saveCollectionEntry({
    collectionId: input.collectionId,
    entryId: input.entryId?.trim() || randomUUID(),
    slug: null,
    status,
    publishedAt: null,
    values: input.values,
    updatedBy: null,
  });
}

function getAllowedStatuses(collection: CollectionDefinition) {
  const configured = collection.incoming?.statuses?.map((item) => item.value).filter(Boolean) ?? [];
  return configured.length > 0 ? configured : ["new", "resolved"];
}
