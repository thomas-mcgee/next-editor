import { createHash, randomBytes } from "node:crypto";
import { pool } from "./db";

type PasswordResetTokenRow = {
  token_hash: string;
  user_id: string;
  expires_at: Date;
  used_at: Date | null;
};

export type PasswordResetTokenRecord = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
};

function mapRow(row: PasswordResetTokenRow): PasswordResetTokenRecord {
  return {
    tokenHash: row.token_hash,
    userId: row.user_id,
    expiresAt: row.expires_at,
    usedAt: row.used_at,
  };
}

export function createPasswordResetTokenValue() {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function savePasswordResetToken(input: {
  userId: string;
  token: string;
  expiresAt: Date;
}): Promise<void> {
  await pool.query(
    `INSERT INTO ne_password_reset_tokens (token_hash, user_id, expires_at)
     VALUES ($1, $2, $3)`,
    [hashPasswordResetToken(input.token), input.userId, input.expiresAt.toISOString()],
  );
}

export async function getPasswordResetToken(token: string): Promise<PasswordResetTokenRecord | null> {
  const { rows } = await pool.query<PasswordResetTokenRow>(
    `SELECT token_hash, user_id, expires_at, used_at
       FROM ne_password_reset_tokens
      WHERE token_hash = $1
      LIMIT 1`,
    [hashPasswordResetToken(token)],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function markPasswordResetTokenUsed(token: string): Promise<void> {
  await pool.query(
    `UPDATE ne_password_reset_tokens
        SET used_at = now()
      WHERE token_hash = $1`,
    [hashPasswordResetToken(token)],
  );
}

export async function deletePasswordResetTokensForUser(userId: string): Promise<void> {
  await pool.query(
    `DELETE FROM ne_password_reset_tokens WHERE user_id = $1`,
    [userId],
  );
}

export function isPasswordResetTokenActive(token: PasswordResetTokenRecord | null) {
  if (!token) return false;
  if (token.usedAt) return false;
  return token.expiresAt.getTime() > Date.now();
}
