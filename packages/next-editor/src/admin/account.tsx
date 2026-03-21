import { neUpdateAccountAction } from "../auth/actions";
import type { User } from "../auth/user-store";

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

export function NeAccountPage({ user, status }: { user: User; status?: string }) {
  return (
    <section>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--ne-fg)" }}>Account</h2>
      <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--ne-muted)" }}>
        Update your name, email, and display title.
      </p>

      <form action={neUpdateAccountAction} style={{ marginTop: 28, maxWidth: 480, display: "flex", flexDirection: "column", gap: 18 }}>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--ne-fg)" }}>Name</span>
          <input name="name" defaultValue={user.name} style={inp} />
        </label>

        <label style={{ display: "block" }}>
          <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--ne-fg)" }}>Email</span>
          <input name="email" type="email" defaultValue={user.email} style={inp} />
        </label>

        <label style={{ display: "block" }}>
          <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "var(--ne-fg)" }}>Title</span>
          <input name="title" defaultValue={user.title ?? ""} placeholder="e.g. Content Editor" style={inp} />
        </label>

        {status === "saved" && (
          <p style={{ margin: 0, borderRadius: 10, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)", padding: "12px 16px", fontSize: 13, color: "var(--ne-fg)" }}>
            Account updated.
          </p>
        )}
        {status === "invalid" && (
          <p style={{ margin: 0, borderRadius: 10, border: "1px solid var(--ne-border-strong)", background: "var(--ne-surface-muted)", padding: "12px 16px", fontSize: 13, color: "var(--ne-fg)" }}>
            Name and email are required.
          </p>
        )}

        <div style={{ paddingTop: 4 }}>
          <button
            type="submit"
            style={{ borderRadius: 10, border: 0, background: "var(--ne-fg)", color: "var(--ne-bg)", padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Save
          </button>
        </div>
      </form>
    </section>
  );
}
