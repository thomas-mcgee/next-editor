"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ThemeMode = "system" | "light" | "dark";
type ThemeContextValue = { theme: ThemeMode; setTheme: (t: ThemeMode) => void };

const STORAGE_KEY = "ne-admin-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

// CSS variables injected by the theme provider
const LIGHT_VARS = `
  :root:not([data-ne-theme]),
  :root[data-ne-theme="light"],
  :root[data-ne-theme="system"] {
    --ne-bg: #f9f9f8;
    --ne-surface: #ffffff;
    --ne-surface-muted: #f4f4f3;
    --ne-surface-elevated: rgba(255,255,255,0.85);
    --ne-fg: #111110;
    --ne-muted: #7c7c78;
    --ne-border: rgba(0,0,0,0.09);
    --ne-border-strong: rgba(0,0,0,0.14);
    --ne-shadow-soft: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  }
`;

const DARK_VARS = `
  :root[data-ne-theme="dark"] {
    --ne-bg: #111110;
    --ne-surface: #1c1c1a;
    --ne-surface-muted: #232321;
    --ne-surface-elevated: rgba(28,28,26,0.85);
    --ne-fg: #eeeeec;
    --ne-muted: #888884;
    --ne-border: rgba(255,255,255,0.06);
    --ne-border-strong: rgba(255,255,255,0.10);
    --ne-shadow-soft: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
  }
`;

const SYSTEM_DARK_VARS = `
  @media (prefers-color-scheme: dark) {
    :root:not([data-ne-theme]) {
      --ne-bg: #111110;
      --ne-surface: #1c1c1a;
      --ne-surface-muted: #232321;
      --ne-surface-elevated: rgba(28,28,26,0.85);
      --ne-fg: #eeeeec;
      --ne-muted: #888884;
      --ne-border: rgba(255,255,255,0.06);
      --ne-border-strong: rgba(255,255,255,0.10);
      --ne-shadow-soft: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
    }
    :root[data-ne-theme="system"] {
      --ne-bg: #111110;
      --ne-surface: #1c1c1a;
      --ne-surface-muted: #232321;
      --ne-surface-elevated: rgba(28,28,26,0.85);
      --ne-fg: #eeeeec;
      --ne-muted: #888884;
      --ne-border: rgba(255,255,255,0.06);
      --ne-border-strong: rgba(255,255,255,0.10);
      --ne-shadow-soft: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
    }
  }
`;

export function NeThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof document === "undefined") return "system";
    const stored = document.documentElement.dataset.neTheme;
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  });

  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem(STORAGE_KEY);
    const nextTheme =
      stored === "light" || stored === "dark" || stored === "system" ? stored : "system";

    root.dataset.neTheme = nextTheme;
    setThemeState(nextTheme);
  }, []);

  const setTheme = (next: ThemeMode) => {
    setThemeState(next);
    document.documentElement.dataset.neTheme = next;
    localStorage.setItem(STORAGE_KEY, next);
  };

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <style>{LIGHT_VARS + DARK_VARS + SYSTEM_DARK_VARS}</style>
      {children}
    </ThemeContext.Provider>
  );
}

export function useNeTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useNeTheme must be used within NeThemeProvider.");
  return ctx;
}
