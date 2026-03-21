import { neCreateUserAction } from "../auth/actions";

const inp: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid var(--ne-border-strong)",
  background: "var(--ne-surface-muted)",
  color: "var(--ne-fg)",
  padding: "12px 16px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};

export function NeNewUserPage({ status }: { status?: string }) {
  return (
    <section>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--ne-fg)" }}>Add User</h2>
      <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--ne-muted)" }}>
        New users can sign in immediately with the password you set.
      </p>

      {status === "invalid" && (
        <p style={{ marginTop: 14, borderRadius: 10, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)", padding: "12px 16px", fontSize: 13, color: "var(--ne-fg)" }}>
          Name, email, and password are required.
        </p>
      )}
      {status === "exists" && (
        <p style={{ marginTop: 14, borderRadius: 10, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)", padding: "12px 16px", fontSize: 13, color: "var(--ne-fg)" }}>
          A user with that email already exists.
        </p>
      )}

      <form action={neCreateUserAction} style={{ marginTop: 28, maxWidth: 480, display: "flex", flexDirection: "column", gap: 18 }}>
        {([
          ["Full name", "name", "text", ""],
          ["Email", "email", "email", ""],
          ["Title", "title", "text", "e.g. Content Editor"],
          ["Password", "password", "password", ""],
        ] as const).map(([label, name, type, placeholder]) => (
          <label key={name} style={{ display: "block" }}>
            <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--ne-fg)" }}>
              {label}
            </span>
            <input name={name} type={type} placeholder={placeholder || undefined} style={inp} />
          </label>
        ))}

        <label style={{ display: "block" }}>
          <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--ne-fg)" }}>Role</span>
          <select
            name="role"
            defaultValue="editor"
            style={{ ...inp, appearance: "auto" as React.CSSProperties["appearance"] }}
          >
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        </label>

        <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
          <button
            type="submit"
            style={{ borderRadius: 10, border: 0, background: "var(--ne-fg)", color: "var(--ne-bg)", padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Add User
          </button>
          <a href="/admin/users" style={{ fontSize: 13, color: "var(--ne-muted)", textDecoration: "none" }}>
            Cancel
          </a>
        </div>
      </form>
    </section>
  );
}
