import {
  neLoginAction,
  neRequestPasswordResetAction,
  neResetPasswordAction,
} from "../auth/actions";
import { getTurnstileConfig } from "../auth/turnstile";
import { NeTurnstileWidget } from "./turnstile-widget";

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
  const turnstile = getTurnstileConfig();
  const message = getLoginMessage(error);

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

          {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

          {turnstile.enabled ? (
            <NeTurnstileWidget siteKey={turnstile.siteKey} />
          ) : null}

          <button type="submit" style={{ ...btn, marginTop: 4 }}>
            Sign in
          </button>
        </form>

        <div style={{ display: "grid", gap: 10, marginTop: 20 }}>
          <a
            href="/admin/login/forgot"
            style={{ display: "inline-block", fontSize: 13, fontWeight: 600, color: "#111110", textDecoration: "none" }}
          >
            Forgot password?
          </a>

          <a href="/" style={{ display: "inline-block", fontSize: 13, fontWeight: 600, color: "#111110", textDecoration: "none" }}>
            ← Back to site
          </a>
        </div>
      </div>
    </main>
  );
}

const FORGOT_PASSWORD_MESSAGES: Record<string, { tone: "error" | "success"; text: string }> = {
  invalid: {
    tone: "error",
    text: "Enter the email address for your account.",
  },
  sent: {
    tone: "success",
    text: "If an account exists for that email, a password reset link has been sent.",
  },
  unavailable: {
    tone: "error",
    text: "Password reset email delivery is not configured yet.",
  },
};

export function NeForgotPasswordPage({ status }: { status?: string }) {
  const message = status ? FORGOT_PASSWORD_MESSAGES[status] : null;

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Reset your password"
      description="Enter your email address and we&apos;ll send you a reset link."
      footer={<a href="/admin/login" style={footerLinkStyle}>← Back to sign in</a>}
    >
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

      <form action={neRequestPasswordResetAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <label style={{ display: "block" }}>
          <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#111110" }}>
            Email
          </span>
          <input name="email" type="email" required autoComplete="email" style={inp} />
        </label>

        <button type="submit" style={{ ...btn, marginTop: 4 }}>
          Send reset link
        </button>
      </form>
    </AuthShell>
  );
}

const RESET_PASSWORD_MESSAGES: Record<string, { tone: "error" | "success"; text: string }> = {
  invalid: {
    tone: "error",
    text: "Both password fields are required.",
  },
  mismatch: {
    tone: "error",
    text: "Passwords do not match.",
  },
  weak: {
    tone: "error",
    text: "Password must be at least 8 characters.",
  },
  expired: {
    tone: "error",
    text: "That reset link is invalid or has expired.",
  },
};

export function NeResetPasswordPage({
  token,
  status,
}: {
  token?: string;
  status?: string;
}) {
  const message = status ? RESET_PASSWORD_MESSAGES[status] : null;
  const hasToken = Boolean(token);

  return (
    <AuthShell
      eyebrow="Password reset"
      title="Choose a new password"
      description="Set a new password for your admin account."
      footer={<a href="/admin/login" style={footerLinkStyle}>← Back to sign in</a>}
    >
      {message ? <Notice tone={message.tone}>{message.text}</Notice> : null}

      {hasToken ? (
        <form action={neResetPasswordAction} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input type="hidden" name="token" value={token} />

          <label style={{ display: "block" }}>
            <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#111110" }}>
              New password
            </span>
            <input name="password" type="password" required autoComplete="new-password" style={inp} />
          </label>

          <label style={{ display: "block" }}>
            <span style={{ display: "block", marginBottom: 8, fontSize: 13, fontWeight: 600, color: "#111110" }}>
              Confirm password
            </span>
            <input name="confirmPassword" type="password" required autoComplete="new-password" style={inp} />
          </label>

          <button type="submit" style={{ ...btn, marginTop: 4 }}>
            Save new password
          </button>
        </form>
      ) : (
        <Notice tone="error">That reset link is missing or invalid.</Notice>
      )}
    </AuthShell>
  );
}

function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
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
          {eyebrow}
        </p>
        <h1 style={{ margin: "12px 0 10px", fontSize: 28, fontWeight: 600, color: "#111110" }}>
          {title}
        </h1>
        <p style={{ margin: "0 0 28px", fontSize: 14, lineHeight: 1.6, color: "#5a5a57" }}>
          {description}
        </p>
        {children}
        {footer ? <div style={{ marginTop: 20 }}>{footer}</div> : null}
      </div>
    </main>
  );
}

function Notice({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  return (
    <p
      style={{
        margin: "0 0 16px",
        borderRadius: 12,
        background: tone === "error" ? "#fef2f2" : "#ecfdf3",
        padding: "12px 16px",
        fontSize: 13,
        color: tone === "error" ? "#b91c1c" : "#166534",
      }}
    >
      {children}
    </p>
  );
}

function getLoginMessage(status?: string) {
  if (status === "invalid") return { tone: "error" as const, text: "Invalid email or password." };
  if (status === "challenge") {
    return { tone: "error" as const, text: "Please complete the verification challenge and try again." };
  }
  if (status === "reset") {
    return { tone: "success" as const, text: "Password updated. You can sign in with your new password." };
  }
  return null;
}

const footerLinkStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: 13,
  fontWeight: 600,
  color: "#111110",
  textDecoration: "none",
};
