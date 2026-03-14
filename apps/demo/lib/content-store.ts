import { promises as fs } from "node:fs";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";

const contentPath = path.join(process.cwd(), "data", "content.json");
const collectionsPath = path.join(process.cwd(), "data", "collections.json");

export type StoredPageDocument = {
  pageId: string;
  values: Record<string, unknown>;
  updatedAt: string;
  updatedBy: string;
};

type ContentFile = Record<string, StoredPageDocument>;
type CollectionsFile = Record<string, Array<Record<string, unknown>>>;

async function readContentFile() {
  const raw = await fs.readFile(contentPath, "utf8");
  return JSON.parse(raw) as ContentFile;
}

async function readCollectionsFile() {
  const raw = await fs.readFile(collectionsPath, "utf8");
  return JSON.parse(raw) as CollectionsFile;
}

export async function getPageDocument(pageId: string) {
  noStore();
  const content = await readContentFile();
  const page = content[pageId];

  if (!page) {
    throw new Error(`Missing content for page "${pageId}".`);
  }

  return page;
}

export async function listPageDocuments() {
  noStore();
  return Object.values(await readContentFile());
}

export async function savePageDocument(
  pageId: string,
  values: Record<string, unknown>,
  updatedBy: string,
) {
  const content = await readContentFile();

  content[pageId] = {
    pageId,
    values,
    updatedAt: new Date().toISOString(),
    updatedBy,
  };

  await fs.writeFile(contentPath, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  return content[pageId];
}

export async function listCollectionEntries(collectionId: string) {
  noStore();
  const collections = await readCollectionsFile();
  return collections[collectionId] ?? [];
}

export async function listAllCollections() {
  noStore();
  return readCollectionsFile();
}
