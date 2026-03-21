import { neLoginAction } from "../auth/actions";

const inp: React.CSSProperties = {
  width: "100%",
  borderRadius: 16,
  border: "1px solid #d4d4d0",
  padding: "12px 16px",
  fontSize: 14,
  color: "#111110",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
};

const btn: React.CSSProperties = {
  width: "100%",
  borderRadius: 999,
  border: 0,
  background: "#111110",
  color: "#fff",
  padding: "12px 16px",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};

export function NeLoginPage({ error }: { error?: string }) {
  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
        background: "#f9f9f8",
        fontFamily: 'system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 28,
          border: "1px solid #e4e4e0",
          background: "#fff",
          padding: 32,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7c7c78" }}>
          Admin Access
        </p>
        <h1 style={{ margin: "12px 0 10px", fontSize: 28, fontWeight: 600, color: "#111110" }}>
          Sign in
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, lineHeight: 1.6, color: "#5a5a57" }}>
          Sign in to access the editor and admin panel.
        </p>

        <form action={neLoginAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <label style={{ display: "block" }}>
            <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#111110" }}>
              Email
            </span>
            <input name="email" type="email" required autoComplete="email" style={inp} />
          </label>

          <label style={{ display: "block" }}>
            <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#111110" }}>
              Password
            </span>
            <input name="password" type="password" required autoComplete="current-password" style={inp} />
          </label>

          {error === "invalid" && (
            <p style={{ margin: 0, borderRadius: 12, background: "#fef2f2", padding: "12px 16px", fontSize: 13, color: "#b91c1c" }}>
              Invalid email or password.
            </p>
          )}

          <button type="submit" style={{ ...btn, marginTop: 4 }}>
            Sign in
          </button>
        </form>

        <a href="/" style={{ display: "inline-block", marginTop: 20, fontSize: 13, fontWeight: 600, color: "#111110", textDecoration: "none" }}>
          ← Back to site
        </a>
      </div>
    </main>
  );
}
