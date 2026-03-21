import { pool } from "./db";

export type DbUser = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  title: string | null;
  created_at: Date;
};

export type User = Omit<DbUser, "password_hash" | "created_at">;

export async function countUsers(): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM ne_users`,
  );
  return parseInt(rows[0].count, 10);
}

export async function listUsers(): Promise<User[]> {
  const { rows } = await pool.query<User>(
    `SELECT id, name, email, role, title FROM ne_users ORDER BY created_at ASC`,
  );
  return rows;
}

export async function getUserById(id: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    `SELECT id, name, email, role, title FROM ne_users WHERE id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getUserByEmail(email: string): Promise<DbUser | null> {
  const { rows } = await pool.query<DbUser>(
    `SELECT * FROM ne_users WHERE LOWER(email) = LOWER($1)`,
    [email],
  );
  return rows[0] ?? null;
}

export async function createUser(values: {
  name: string;
  email: string;
  password_hash: string;
  role: string;
  title?: string | null;
}): Promise<User> {
  const { rows } = await pool.query<User>(
    `INSERT INTO ne_users (name, email, password_hash, role, title)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, role, title`,
    [values.name, values.email, values.password_hash, values.role, values.title ?? null],
  );
  return rows[0];
}

export async function updateUser(
  id: string,
  values: { name: string; email: string; title?: string | null },
): Promise<User> {
  const { rows } = await pool.query<User>(
    `UPDATE ne_users SET name = $1, email = $2, title = $3
     WHERE id = $4
     RETURNING id, name, email, role, title`,
    [values.name, values.email, values.title ?? null, id],
  );
  if (!rows[0]) throw new Error(`[next-editor] User "${id}" not found.`);
  return rows[0];
}

export async function deleteUser(id: string): Promise<void> {
  await pool.query(`DELETE FROM ne_users WHERE id = $1`, [id]);
}
