"use client";

import { useNeTheme } from "./theme-provider";

const options = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
] as const;

function ThemePicker() {
  const { theme, setTheme } = useNeTheme();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        borderRadius: 12,
        border: "1px solid var(--ne-border-strong)",
        background: "var(--ne-surface-elevated)",
        padding: 4,
      }}
    >
      {options.map((opt) => {
        const active = theme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            style={{
              border: 0,
              borderRadius: 9,
              background: active ? "var(--ne-fg)" : "transparent",
              color: active ? "var(--ne-bg)" : "var(--ne-muted)",
              padding: "7px 14px",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background 120ms, color 120ms",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function NeSettingsPage() {
  return (
    <section>
      <h2 style={{ margin: 0, fontSize: 28, fontWeight: 600, color: "var(--ne-fg)" }}>
        Interface Theme
      </h2>
      <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: "var(--ne-muted)", maxWidth: 480 }}>
        Choose whether the admin interface follows your system appearance or stays in a fixed
        light or dark theme.
      </p>
      <div style={{ marginTop: 28 }}>
        <ThemePicker />
      </div>
    </section>
  );
}
