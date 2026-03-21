import { auth } from "./auth/config";
import {
  getCollectionEntry,
  getPublishedCollectionEntryBySlug,
  listCollectionEntries as _listCollectionEntries,
  listPublishedCollectionEntries,
} from "./content/collection-store";
import { getPageContent as _getPageContent } from "./content/store";

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
