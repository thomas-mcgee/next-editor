"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "ne-admin-theme";

const LIGHT_VARS: CSSProperties = {
  "--background": "#ffffff",
  "--surface": "#ffffff",
  "--surface-muted": "#f4f4f3",
  "--surface-elevated": "rgba(255,255,255,0.85)",
  "--foreground": "#111110",
  "--muted": "#7c7c78",
  "--border": "rgba(0,0,0,0.09)",
  "--border-strong": "rgba(0,0,0,0.14)",
  "--shadow-soft": "0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)",
  "--shadow-heavy": "0 28px 80px rgba(24,24,27,0.18)",
} as CSSProperties;

const DARK_VARS: CSSProperties = {
  "--background": "#111110",
  "--surface": "#1c1c1a",
  "--surface-muted": "#232321",
  "--surface-elevated": "rgba(28,28,26,0.85)",
  "--foreground": "#eeeeec",
  "--muted": "#888884",
  "--border": "rgba(255,255,255,0.06)",
  "--border-strong": "rgba(255,255,255,0.10)",
  "--shadow-soft": "0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)",
  "--shadow-heavy": "0 28px 80px rgba(0,0,0,0.4)",
} as CSSProperties;

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
}

function resolveTheme(mode: ThemeMode, prefersDark: boolean) {
  if (mode === "system") return prefersDark ? "dark" : "light";
  return mode;
}

export function useEditorThemeVars() {
  // Keep the SSR render and initial client render identical, then sync to the
  // saved admin theme once mounted to avoid hydration mismatches.
  const [theme, setTheme] = useState<ThemeMode>("system");
  const [prefersDark, setPrefersDark] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      setTheme(getStoredTheme());
      setPrefersDark(media.matches);
    };

    syncTheme();
    media.addEventListener("change", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      media.removeEventListener("change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  return useMemo(() => {
    return resolveTheme(theme, prefersDark) === "dark" ? DARK_VARS : LIGHT_VARS;
  }, [prefersDark, theme]);
}
