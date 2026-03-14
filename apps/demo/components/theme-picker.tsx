"use client";

import { useTheme } from "@/components/theme-provider";

const options = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
] as const;

export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        borderRadius: 12,
        border: "1px solid var(--border-strong)",
        background: "var(--surface-elevated)",
        padding: 4,
      }}
    >
      {options.map((option) => {
        const active = theme === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => setTheme(option.id)}
            style={{
              border: 0,
              borderRadius: 9,
              background: active ? "var(--foreground)" : "transparent",
              color: active ? "var(--background)" : "var(--muted)",
              padding: "7px 12px",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
