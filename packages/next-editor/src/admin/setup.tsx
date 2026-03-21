import { neSetupAction } from "../auth/actions";

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

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Name, email, and password are all required.",
  mismatch: "Passwords do not match.",
  weak: "Password must be at least 8 characters.",
  exists: "An account with that email already exists.",
};

export function NeSetupPage({ status }: { status?: string }) {
  const error = status ? ERROR_MESSAGES[status] : null;

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
      <div style={{ width: "100%", maxWidth: 440 }}>
        <div
          style={{
            borderRadius: 28,
            border: "1px solid #e4e4e0",
            background: "#fff",
            padding: 32,
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "#7c7c78" }}>
            First-time setup
          </p>
          <h1 style={{ margin: "12px 0 10px", fontSize: 28, fontWeight: 600, color: "#111110" }}>
            Create admin account
          </h1>
          <p style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.6, color: "#5a5a57" }}>
            No users exist yet. Create your administrator account to get started. You&apos;ll be
            able to add more users from the admin panel.
          </p>

          {error && (
            <p style={{ margin: "0 0 16px", borderRadius: 12, background: "#fef2f2", padding: "12px 16px", fontSize: 13, color: "#b91c1c" }}>
              {error}
            </p>
          )}

          <form action={neSetupAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#111110" }}>Full name</span>
              <input name="name" type="text" required autoComplete="name" placeholder="Jane Smith" style={inp} />
            </label>

            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#111110" }}>Email</span>
              <input name="email" type="email" required autoComplete="email" placeholder="jane@example.com" style={inp} />
            </label>

            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#111110" }}>Password</span>
              <input name="password" type="password" required autoComplete="new-password" placeholder="At least 8 characters" style={inp} />
            </label>

            <label style={{ display: "block" }}>
              <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#111110" }}>Confirm password</span>
              <input name="confirmPassword" type="password" required autoComplete="new-password" style={inp} />
            </label>

            <button
              type="submit"
              style={{
                marginTop: 4,
                width: "100%",
                borderRadius: 999,
                border: 0,
                background: "#111110",
                color: "#fff",
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Create account &amp; sign in
            </button>
          </form>
        </div>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "#a0a09c" }}>
          This page is only shown before any users are created.
        </p>
      </div>
    </main>
  );
}
