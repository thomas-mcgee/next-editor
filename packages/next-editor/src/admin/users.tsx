"use client";

import type { User } from "../auth/user-store";

const cell: React.CSSProperties = { padding: "12px 16px", fontSize: 13 };

export function NeUsersPage({
  users,
  currentUserId,
  status,
  deleteAction,
}: {
  users: User[];
  currentUserId: string;
  status?: string;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <section>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--ne-fg)" }}>Users</h2>
          <span style={{ borderRadius: 999, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)", padding: "2px 10px", fontSize: 12, fontWeight: 600, color: "var(--ne-muted)" }}>
            {users.length}
          </span>
        </div>
        <a
          href="/admin/users/new"
          style={{ borderRadius: 10, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface)", color: "var(--ne-fg)", padding: "8px 16px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          Add User
        </a>
      </div>

      <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--ne-muted)" }}>
        Admins can manage users. Editors can edit content but cannot access this page.
      </p>

      {status === "created" && (
        <p style={{ marginTop: 14, borderRadius: 10, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)", padding: "12px 16px", fontSize: 13, color: "var(--ne-fg)" }}>
          User created successfully.
        </p>
      )}

      <div style={{ marginTop: 20, borderRadius: 14, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "var(--ne-surface-muted)" }}>
              {["Name", "Email", "Role", "Title", ""].map((h) => (
                <th key={h} style={{ ...cell, fontWeight: 600, color: "var(--ne-muted)", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} style={{ borderTop: "1px solid var(--ne-border-strong)" }}>
                <td style={{ ...cell, fontWeight: 600, color: "var(--ne-fg)" }}>{user.name}</td>
                <td style={{ ...cell, color: "var(--ne-muted)" }}>{user.email}</td>
                <td style={{ ...cell, color: "var(--ne-muted)" }}>{user.role}</td>
                <td style={{ ...cell, color: "var(--ne-muted)" }}>{user.title ?? ""}</td>
                <td style={{ ...cell, textAlign: "right" }}>
                  {user.id !== currentUserId && (
                    <form action={deleteAction} style={{ display: "inline" }}>
                      <input type="hidden" name="userId" value={user.id} />
                      <button
                        type="submit"
                        style={{ background: "none", border: 0, padding: 0, fontSize: 13, color: "var(--ne-muted)", cursor: "pointer" }}
                        onClick={(e) => { if (!confirm(`Delete ${user.name}?`)) e.preventDefault(); }}
                      >
                        Delete
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
