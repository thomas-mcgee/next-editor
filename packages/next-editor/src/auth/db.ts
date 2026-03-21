import { Pool } from "pg";

declare global {
  // Prevent multiple pool instances during hot reload in dev
  // eslint-disable-next-line no-var
  var nePool: Pool | undefined;
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS ne_users (
    id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name          TEXT        NOT NULL,
    email         TEXT        NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    role          TEXT        NOT NULL DEFAULT 'editor' CHECK (role IN ('editor', 'admin')),
    title         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS ne_content (
    page_id    TEXT        PRIMARY KEY,
    values     JSONB       NOT NULL DEFAULT '{}',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS ne_collection_entries (
    collection_id TEXT        NOT NULL,
    entry_id      TEXT        NOT NULL,
    slug          TEXT,
    status        TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
    published_at  TIMESTAMPTZ,
    values        JSONB       NOT NULL DEFAULT '{}',
    updated_by    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (collection_id, entry_id)
  );

  CREATE UNIQUE INDEX IF NOT EXISTS ne_collection_entries_slug_idx
    ON ne_collection_entries (collection_id, slug)
    WHERE slug IS NOT NULL;
`;

function createPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "[next-editor] DATABASE_URL is not set. Add it to your .env.local file.",
    );
  }
  const p = new Pool({ connectionString });
  // Apply schema on first connection — CREATE TABLE IF NOT EXISTS is idempotent
  p.query(SCHEMA).catch((err) => {
    console.error("[next-editor] Failed to apply schema:", err);
  });
  return p;
}

export const pool = globalThis.nePool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalThis.nePool = pool;
}
