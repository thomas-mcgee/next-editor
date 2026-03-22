import { pool } from "../auth/db";
import { unstable_noStore as noStore } from "next/cache";

export async function readPageContent(pageId: string): Promise<Record<string, unknown>> {
  const { rows } = await pool.query<{ values: Record<string, unknown> }>(
    `SELECT values FROM ne_content WHERE page_id = $1`,
    [pageId],
  );
  return rows[0]?.values ?? {};
}

export async function getPageContent(pageId: string): Promise<Record<string, unknown>> {
  noStore();
  return readPageContent(pageId);
}

export async function setPageContent(
  pageId: string,
  values: Record<string, unknown>,
): Promise<void> {
  await pool.query(
    `INSERT INTO ne_content (page_id, values, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (page_id) DO UPDATE SET values = $2, updated_at = now()`,
    [pageId, JSON.stringify(values)],
  );
}
