import { unstable_noStore as noStore } from "next/cache";
import { pool } from "../auth/db";
import type { CollectionEntryRecord, CollectionStatus } from "../types";

type EntryRow = {
  collection_id: string;
  entry_id: string;
  slug: string | null;
  status: CollectionStatus;
  published_at: string | null;
  values: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
};

function mapRow(row: EntryRow): CollectionEntryRecord {
  return {
    collectionId: row.collection_id,
    entryId: row.entry_id,
    slug: row.slug,
    status: row.status,
    publishedAt: row.published_at,
    values: row.values ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

export async function listCollectionEntries(collectionId: string): Promise<CollectionEntryRecord[]> {
  noStore();
  const { rows } = await pool.query<EntryRow>(
    `SELECT collection_id, entry_id, slug, status, published_at, values, created_at, updated_at, updated_by
       FROM ne_collection_entries
      WHERE collection_id = $1
      ORDER BY updated_at DESC`,
    [collectionId],
  );
  return rows.map(mapRow);
}

export async function listPublishedCollectionEntries(collectionId: string): Promise<CollectionEntryRecord[]> {
  noStore();
  const { rows } = await pool.query<EntryRow>(
    `SELECT collection_id, entry_id, slug, status, published_at, values, created_at, updated_at, updated_by
       FROM ne_collection_entries
      WHERE collection_id = $1
        AND (
          status = 'published'
          OR (status = 'scheduled' AND published_at IS NOT NULL AND published_at <= now())
        )
      ORDER BY COALESCE(published_at, updated_at) DESC`,
    [collectionId],
  );
  return rows.map(mapRow);
}

export async function getCollectionEntry(
  collectionId: string,
  entryId: string,
): Promise<CollectionEntryRecord | null> {
  noStore();
  const { rows } = await pool.query<EntryRow>(
    `SELECT collection_id, entry_id, slug, status, published_at, values, created_at, updated_at, updated_by
       FROM ne_collection_entries
      WHERE collection_id = $1 AND entry_id = $2
      LIMIT 1`,
    [collectionId, entryId],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function getPublishedCollectionEntryBySlug(
  collectionId: string,
  slug: string,
): Promise<CollectionEntryRecord | null> {
  noStore();
  const { rows } = await pool.query<EntryRow>(
    `SELECT collection_id, entry_id, slug, status, published_at, values, created_at, updated_at, updated_by
       FROM ne_collection_entries
      WHERE collection_id = $1
        AND slug = $2
        AND (
          status = 'published'
          OR (status = 'scheduled' AND published_at IS NOT NULL AND published_at <= now())
        )
      LIMIT 1`,
    [collectionId, slug],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function saveCollectionEntry(input: {
  collectionId: string;
  entryId: string;
  slug: string | null;
  status: CollectionStatus;
  publishedAt: string | null;
  values: Record<string, unknown>;
  updatedBy: string | null;
}): Promise<void> {
  await pool.query(
    `INSERT INTO ne_collection_entries (
        collection_id,
        entry_id,
        slug,
        status,
        published_at,
        values,
        updated_at,
        updated_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, now(), $7)
      ON CONFLICT (collection_id, entry_id)
      DO UPDATE SET
        slug = EXCLUDED.slug,
        status = EXCLUDED.status,
        published_at = EXCLUDED.published_at,
        values = EXCLUDED.values,
        updated_at = now(),
        updated_by = EXCLUDED.updated_by`,
    [
      input.collectionId,
      input.entryId,
      input.slug,
      input.status,
      input.publishedAt,
      JSON.stringify(input.values),
      input.updatedBy,
    ],
  );
}

export async function deleteCollectionEntry(collectionId: string, entryId: string): Promise<void> {
  await pool.query(
    `DELETE FROM ne_collection_entries WHERE collection_id = $1 AND entry_id = $2`,
    [collectionId, entryId],
  );
}
